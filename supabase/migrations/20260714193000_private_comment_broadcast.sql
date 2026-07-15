-- Recommended Supabase Realtime architecture: private, ticket-scoped database broadcasts.
create function public.can_access_realtime_topic(p_topic text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_ticket text := split_part(p_topic, ':', 2);
begin
  if split_part(p_topic, ':', 1) <> 'ticket' or split_part(p_topic, ':', 3) <> 'comments' or v_ticket !~* '^[0-9a-f-]{36}$' then return false; end if;
  return public.can_access_ticket(v_ticket::uuid);
end;
$$;
revoke all on function public.can_access_realtime_topic(text) from public, anon;
grant execute on function public.can_access_realtime_topic(text) to authenticated;

create policy ticket_comment_broadcast_select on realtime.messages
for select to authenticated using (
  extension = 'broadcast' and public.can_access_realtime_topic((select realtime.topic()))
);

create function public.broadcast_new_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform realtime.send(to_jsonb(new), 'INSERT', 'ticket:' || new.ticket_id::text || ':comments', true);
  return null;
end;
$$;
revoke all on function public.broadcast_new_comment() from public, anon, authenticated;
create trigger comments_private_broadcast after insert on public.comments for each row execute function public.broadcast_new_comment();

alter publication supabase_realtime drop table public.comments;
