# SupportFlow

SupportFlow is a focused multi-tenant customer support desk built as a full-stack portfolio project. Admins and agents triage organization tickets, customers track their own requests, and PostgreSQL Row Level Security keeps Acme and Globex data isolated even when requests bypass the UI.

## Features

- Email/password authentication with active-membership checks and role-aware redirects
- Admin, agent, and customer workspaces
- Server-filtered ticket search, status, priority, category, assignment, and quick views
- Transaction-safe ticket creation, assignment, status, priority, history, and first-response SLA logic
- Ticket-scoped private Supabase Realtime Broadcast for new comments
- Private 5 MB Supabase Storage attachments with MIME/extension checks and 60-second signed URLs
- Admin and agent analytics with efficient PostgreSQL aggregation
- Responsive sidebar, tables, badges, charts, empty states, form errors, and toast feedback
- Unit, live RLS/integration, and multi-role Playwright coverage

## Technology

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Supabase PostgreSQL/Auth/Storage/Realtime, `@supabase/ssr`, React Hook Form, Zod, Recharts, Vitest, and Playwright.

## Roles

| Role | Access |
| --- | --- |
| Admin | Organization analytics and tickets, assignment, priority/status changes, comments, attachments, history, read-only team page |
| Agent | Organization tickets, assigned/unassigned views, permitted status transitions, comments, attachments, history |
| Customer | Own tickets only, ticket creation, comments, attachments, and closing a resolved ticket |

## Architecture and security

Each business record carries `organization_id`. Server operations derive organization, actor, and role from the authenticated session; browser-supplied tenant or actor identifiers are never trusted. RLS is enabled on every application table. Mutations use narrow, role-aware PostgreSQL functions so workflow updates and ticket events commit atomically.

See [architecture](docs/architecture.md), [database](docs/database.md), and [security](docs/security.md) for details.

## Ticket workflow

```text
open -> in_progress -> resolved -> closed
  \-----------------> resolved
                       \-> in_progress
```

Admins can use every valid transition. Agents can start, resolve, or reopen work. Customers can only close their own resolved ticket. Priority is admin-only and assignment requires an active agent in the same organization.

## SLA model

First-response deadlines are 72 hours for low, 48 for medium, 24 for high, and 4 for urgent. The first admin/agent comment sets `first_agent_response_at` once. The UI reports pending time, overdue time, met, or missed. Business hours and escalation rules are intentionally out of scope.

## Local setup

Requirements: Node.js 20+ and a Supabase project.

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and provide:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=your-server-only-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEMO_MODE=true
   ```

3. Apply the SQL files in `supabase/migrations` in timestamp order. The repository migrations create tables, functions, indexes, RLS, the private bucket, and private comment Broadcast authorization.

4. Create demo Auth users and records:

   ```bash
   npm run seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

Development password for every account: `SupportFlowDemo2026!`

| Organization | Admin | Agent | Customer |
| --- | --- | --- | --- |
| Acme Technologies | `admin@acme.demo` | `agent@acme.demo` | `customer@acme.demo` |
| Globex Solutions | `admin@globex.demo` | `agent@globex.demo` | `customer@globex.demo` |

Never reuse this password or enable demo mode in a real production environment.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run test:e2e
```

Integration tests use the demo Supabase project and service role for setup/cleanup. Playwright starts SupportFlow on port 3100 so it cannot reuse another local app on port 3000.

## Deployment

Deploy to Vercel or another Next.js-compatible host. Configure all environment variables in the host, keep the service role server-only, set `NEXT_PUBLIC_APP_URL` to the production origin, add that origin to Supabase Auth URL configuration, and disable demo mode. Apply migrations before deploying application code.

## Screenshots

Add final portfolio screenshots here after deployment:

- Login and tenant-isolation overview
- Admin dashboard and charts
- Ticket detail conversation/history
- Customer ticket list and creation form

## Known limitations

This is deliberately a medium-sized portfolio application. Demo seeding resets seeded organization tickets when rerun. The service-role key is used only by server code, the team email lookup, and test/seed tooling. SLA time is continuous elapsed time rather than business hours.

## Future improvements

Organization invitations and switching, billing, notifications, webhooks, external integrations, knowledge base, satisfaction surveys, advanced SLA calendars/escalations, agent groups and auto-assignment, internal notes, read receipts, presence, custom fields, exports, advanced reporting, and mobile clients are intentionally deferred.
