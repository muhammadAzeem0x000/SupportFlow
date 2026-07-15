# Security

## Tenant isolation

RLS is the primary boundary. Every business table contains `organization_id`, and read policies compare it with the authenticated active membership. Staff can read organization tickets; customers can read only tickets they created. Comments, attachments, events, and Realtime topics delegate to the same ticket-access predicate.

## Role enforcement

Client controls improve usability but grant no authority. PostgreSQL RPCs resolve `auth.uid()` and active membership, validate roles, lock target rows, and reject invalid workflows. Direct table update policies are intentionally absent for business tables, preventing column-overposting and role/tenant changes.

## Server validation and errors

Zod validates request bodies and files before database access; PostgreSQL constraints and functions are authoritative. APIs return stable codes/messages and never expose cross-tenant existence or raw SQL/Supabase details. Logs exclude passwords, tokens, signed URLs, and attachment content.

## Storage

`ticket-attachments` is private. Both application validation and bucket settings enforce allowed MIME types and 5 MB size. Object paths contain organization and ticket IDs. Storage RLS revalidates ticket access, and downloads use short-lived signed URLs.

## Realtime

Comment topics are private and ticket-specific. The database broadcasts inserts; authenticated clients may receive a topic only when `can_access_realtime_topic` validates its ticket through active membership. No organization-wide comment channel exists.

## Service role

The service role is imported only by a `server-only` module and local seed/integration tooling. It is excluded from browser bundles and `.git` through `.env.local`. Rotate it immediately if exposed.

## Verification

Live integration tests sign in as Acme and Globex users and verify cross-tenant tickets, comments, events, attachment metadata, assignment, role restrictions, first-response idempotence, and unauthenticated denial. Playwright exercises three simultaneous roles and actual Realtime delivery.

## Known limitations

The read-only team page uses the server admin client to retrieve Auth emails because emails are not duplicated into profiles. Production deployments should add rate limiting at the platform edge and enable Supabase leaked-password protection. Demo credentials are intentionally public and must be disabled outside demo environments.
