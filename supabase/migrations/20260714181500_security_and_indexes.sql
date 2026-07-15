-- Advisor follow-up: trigger functions are never directly callable; cover remaining foreign keys.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.calculate_response_due_at(text,timestamptz) from public, anon;
grant execute on function public.calculate_response_due_at(text,timestamptz) to authenticated;
create index attachments_uploaded_by_idx on public.attachments (uploaded_by);
create index ticket_events_actor_idx on public.ticket_events (actor_id);
