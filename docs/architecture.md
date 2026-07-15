# Architecture

## Application structure

SupportFlow uses the Next.js App Router. Authenticated pages are Server Components that resolve the active membership and load RLS-filtered data before rendering. Client Components are limited to login, forms, filters, charts, ticket controls, uploads, toasts, and Realtime subscriptions.

```text
Browser
  -> Next.js proxy refreshes Supabase session cookies
  -> Server Component resolves active organization membership
  -> RLS-filtered reads or protected Route Handler
  -> PostgreSQL function validates role/tenant and commits workflow + event
```

The staff shell lives under `/dashboard`; customers use `/customer`. Both layouts enforce role access server-side. `/login` uses a server Route Handler so session cookies and the role destination are committed together.

## Supabase clients

- `lib/supabase/client.ts`: publishable-key browser client for Auth, Storage, and Realtime.
- `lib/supabase/server.ts`: request-scoped cookie client for Server Components and Route Handlers.
- `lib/supabase/admin.ts`: server-only service-role client used for demo administration and team email lookup.
- `proxy.ts`: refreshes authentication claims/cookies without authorizing business actions.

Generated types live in `lib/database.types.ts`.

## Authorization flow

Every protected request calls active membership resolution. The database then independently obtains `auth.uid()`, organization, and role inside secure helper functions. A missing or inactive membership blocks access. Cross-tenant resources appear unavailable rather than leaking existence.

## API design

Route Handlers parse Zod input, establish authentication/role context, call a narrow RPC or RLS-protected query, and translate database errors into a stable application format. Organization IDs, actors, uploaders, and creators never come from request bodies.

Core operations cover ticket creation, assignment, status, priority, comments, attachments, signed URLs, and login. Data-heavy reads are performed directly in Server Components with the authenticated SSR client.

## Ticket workflow

PostgreSQL functions lock the ticket row, validate the role-specific transition, update it, and insert the matching history event in one transaction. Assignment validates an active same-organization agent. The first staff comment sets first response time with `coalesce`, making later comments idempotent.

## Realtime comments

Historical comments render server-side. The browser authenticates Realtime and joins a private topic named `ticket:TICKET_ID:comments`. A database trigger calls `realtime.send` after comment insert. `realtime.messages` RLS calls the same ticket-access check used by application data, preventing subscription to another ticket. The client appends new IDs once and removes the channel on unmount.

## Attachment flow

The upload route authenticates the member, verifies ticket access, validates extension/MIME/size, and uploads to `ORGANIZATION_ID/TICKET_ID/UUID-FILENAME`. Storage RLS checks the topic path against ticket access. Metadata is recorded through a protected function. Downloads pass through an authenticated route that returns a 60-second signed URL; the bucket is never public.
