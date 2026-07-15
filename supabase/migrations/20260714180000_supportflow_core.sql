-- SupportFlow core schema. All tenant-owned access is enforced by RLS and narrow RPCs.
create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'agent', 'customer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (organization_id, user_id)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  assigned_agent_id uuid references public.profiles(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 5000),
  category text not null check (category in ('technical', 'billing', 'account', 'general')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  response_due_at timestamptz not null,
  first_agent_response_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text check (body is null or char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  storage_path text unique not null,
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg', 'application/pdf', 'text/plain')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);

create table public.ticket_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  event_type text not null check (event_type in ('ticket_created', 'agent_assigned', 'status_changed', 'priority_changed', 'ticket_resolved', 'ticket_closed')),
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create index organization_members_organization_idx on public.organization_members (organization_id);
create index organization_members_user_idx on public.organization_members (user_id);
create index organization_members_role_idx on public.organization_members (role);
create index tickets_organization_idx on public.tickets (organization_id);
create index tickets_created_by_idx on public.tickets (created_by);
create index tickets_assigned_agent_idx on public.tickets (assigned_agent_id);
create index tickets_status_idx on public.tickets (status);
create index tickets_priority_idx on public.tickets (priority);
create index tickets_category_idx on public.tickets (category);
create index tickets_created_at_idx on public.tickets (created_at desc);
create index tickets_org_status_created_idx on public.tickets (organization_id, status, created_at desc);
create index comments_organization_idx on public.comments (organization_id);
create index comments_ticket_idx on public.comments (ticket_id);
create index comments_author_idx on public.comments (author_id);
create index comments_created_at_idx on public.comments (created_at);
create index attachments_organization_idx on public.attachments (organization_id);
create index attachments_ticket_idx on public.attachments (ticket_id);
create index attachments_comment_idx on public.attachments (comment_id);
create index ticket_events_organization_idx on public.ticket_events (organization_id);
create index ticket_events_ticket_idx on public.ticket_events (ticket_id);
create index ticket_events_created_at_idx on public.ticket_events (created_at);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organization_members_updated_at before update on public.organization_members for each row execute function public.set_updated_at();
create trigger tickets_updated_at before update on public.tickets for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.current_organization_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select organization_id from public.organization_members where user_id = (select auth.uid()) and is_active limit 1
$$;
create function public.current_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.organization_members where user_id = (select auth.uid()) and is_active limit 1
$$;
create function public.is_active_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.organization_members where user_id = (select auth.uid()) and is_active)
$$;
create function public.can_access_ticket(p_ticket_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tickets t
    join public.organization_members m on m.user_id = (select auth.uid()) and m.organization_id = t.organization_id and m.is_active
    where t.id = p_ticket_id and (m.role in ('admin', 'agent') or t.created_by = (select auth.uid()))
  )
$$;
create function public.can_view_profile(p_profile_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_profile_id = (select auth.uid()) or exists (
    select 1 from public.organization_members me
    where me.user_id = (select auth.uid()) and me.is_active and (
      (me.role in ('admin','agent') and exists (select 1 from public.organization_members them where them.user_id = p_profile_id and them.organization_id = me.organization_id))
      or exists (select 1 from public.tickets t where t.organization_id = me.organization_id and t.created_by = (select auth.uid()) and (t.assigned_agent_id = p_profile_id or exists (select 1 from public.comments c where c.ticket_id = t.id and c.author_id = p_profile_id)))
    )
  )
$$;
create function public.calculate_response_due_at(p_priority text, p_created_at timestamptz default now()) returns timestamptz
language sql immutable set search_path = '' as $$
  select p_created_at + case p_priority when 'urgent' then interval '4 hours' when 'high' then interval '24 hours' when 'medium' then interval '48 hours' when 'low' then interval '72 hours' else interval '48 hours' end
$$;
create function public.can_access_storage_object(p_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_org text := split_part(p_name, '/', 1); v_ticket text := split_part(p_name, '/', 2);
begin
  if v_org !~* '^[0-9a-f-]{36}$' or v_ticket !~* '^[0-9a-f-]{36}$' then return false; end if;
  return v_org::uuid = public.current_organization_id() and public.can_access_ticket(v_ticket::uuid);
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.tickets enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.ticket_events enable row level security;

create policy organizations_select_own on public.organizations for select to authenticated using (id = public.current_organization_id());
create policy profiles_select_visible on public.profiles for select to authenticated using (public.can_view_profile(id));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy members_select_allowed on public.organization_members for select to authenticated using (
  is_active and organization_id = public.current_organization_id() and (public.current_role() in ('admin','agent') or user_id = (select auth.uid()))
);
create policy tickets_select_allowed on public.tickets for select to authenticated using (
  organization_id = public.current_organization_id() and (public.current_role() in ('admin','agent') or created_by = (select auth.uid()))
);
create policy comments_select_allowed on public.comments for select to authenticated using (organization_id = public.current_organization_id() and public.can_access_ticket(ticket_id));
create policy attachments_select_allowed on public.attachments for select to authenticated using (organization_id = public.current_organization_id() and public.can_access_ticket(ticket_id));
create policy events_select_allowed on public.ticket_events for select to authenticated using (organization_id = public.current_organization_id() and public.can_access_ticket(ticket_id));

create function public.create_ticket(p_title text, p_description text, p_category text, p_priority text) returns public.tickets
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_ticket public.tickets;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.id is null then raise exception 'FORBIDDEN'; end if;
  if v_member.role <> 'customer' then raise exception 'CUSTOMER_ONLY'; end if;
  if char_length(trim(p_title)) not between 5 and 120 or char_length(trim(p_description)) not between 20 and 5000 then raise exception 'INVALID_INPUT'; end if;
  if p_category not in ('technical','billing','account','general') or p_priority not in ('low','medium','high','urgent') then raise exception 'INVALID_INPUT'; end if;
  insert into public.tickets (organization_id, created_by, title, description, category, priority, response_due_at)
  values (v_member.organization_id, (select auth.uid()), trim(p_title), trim(p_description), p_category, p_priority, public.calculate_response_due_at(p_priority)) returning * into v_ticket;
  insert into public.ticket_events (organization_id, ticket_id, actor_id, event_type, new_value) values (v_member.organization_id, v_ticket.id, (select auth.uid()), 'ticket_created', 'open');
  return v_ticket;
end;
$$;

create function public.assign_ticket(p_ticket_id uuid, p_agent_id uuid) returns public.tickets
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_ticket public.tickets; v_old uuid;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.role <> 'admin' then raise exception 'FORBIDDEN'; end if;
  select * into v_ticket from public.tickets where id = p_ticket_id and organization_id = v_member.organization_id for update;
  if v_ticket.id is null then raise exception 'NOT_FOUND'; end if;
  if p_agent_id is not null and not exists (select 1 from public.organization_members where user_id = p_agent_id and organization_id = v_member.organization_id and role = 'agent' and is_active) then raise exception 'INVALID_AGENT'; end if;
  v_old := v_ticket.assigned_agent_id;
  update public.tickets set assigned_agent_id = p_agent_id where id = p_ticket_id returning * into v_ticket;
  if v_old is distinct from p_agent_id then insert into public.ticket_events (organization_id,ticket_id,actor_id,event_type,old_value,new_value) values (v_member.organization_id,p_ticket_id,(select auth.uid()),'agent_assigned',v_old::text,p_agent_id::text); end if;
  return v_ticket;
end;
$$;

create function public.update_ticket_priority(p_ticket_id uuid, p_priority text) returns public.tickets
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_ticket public.tickets; v_old text;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.role <> 'admin' then raise exception 'FORBIDDEN'; end if;
  if p_priority not in ('low','medium','high','urgent') then raise exception 'INVALID_PRIORITY'; end if;
  select * into v_ticket from public.tickets where id = p_ticket_id and organization_id = v_member.organization_id for update;
  if v_ticket.id is null then raise exception 'NOT_FOUND'; end if;
  v_old := v_ticket.priority;
  update public.tickets set priority = p_priority where id = p_ticket_id returning * into v_ticket;
  if v_old <> p_priority then insert into public.ticket_events (organization_id,ticket_id,actor_id,event_type,old_value,new_value) values (v_member.organization_id,p_ticket_id,(select auth.uid()),'priority_changed',v_old,p_priority); end if;
  return v_ticket;
end;
$$;

create function public.update_ticket_status(p_ticket_id uuid, p_status text) returns public.tickets
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_ticket public.tickets; v_allowed boolean := false; v_event text := 'status_changed';
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.id is null then raise exception 'FORBIDDEN'; end if;
  select * into v_ticket from public.tickets where id = p_ticket_id and organization_id = v_member.organization_id for update;
  if v_ticket.id is null or (v_member.role = 'customer' and v_ticket.created_by <> (select auth.uid())) then raise exception 'NOT_FOUND'; end if;
  v_allowed := case v_member.role
    when 'admin' then (v_ticket.status, p_status) in (('open','in_progress'),('open','resolved'),('in_progress','resolved'),('resolved','in_progress'),('resolved','closed'))
    when 'agent' then (v_ticket.status, p_status) in (('open','in_progress'),('in_progress','resolved'),('resolved','in_progress'))
    when 'customer' then (v_ticket.status, p_status) = ('resolved','closed') else false end;
  if not v_allowed then raise exception 'INVALID_TRANSITION'; end if;
  if p_status = 'resolved' then v_event := 'ticket_resolved'; elsif p_status = 'closed' then v_event := 'ticket_closed'; end if;
  insert into public.ticket_events (organization_id,ticket_id,actor_id,event_type,old_value,new_value) values (v_member.organization_id,p_ticket_id,(select auth.uid()),v_event,v_ticket.status,p_status);
  update public.tickets set status = p_status where id = p_ticket_id returning * into v_ticket;
  return v_ticket;
end;
$$;

create function public.add_ticket_comment(p_ticket_id uuid, p_body text) returns public.comments
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_comment public.comments;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.id is null or not public.can_access_ticket(p_ticket_id) then raise exception 'NOT_FOUND'; end if;
  if char_length(trim(coalesce(p_body,''))) not between 1 and 3000 then raise exception 'INVALID_COMMENT'; end if;
  insert into public.comments (organization_id,ticket_id,author_id,body) values (v_member.organization_id,p_ticket_id,(select auth.uid()),trim(p_body)) returning * into v_comment;
  if v_member.role in ('admin','agent') then update public.tickets set first_agent_response_at = coalesce(first_agent_response_at, now()) where id = p_ticket_id; end if;
  return v_comment;
end;
$$;

create function public.record_attachment(p_ticket_id uuid, p_comment_id uuid, p_storage_path text, p_original_filename text, p_mime_type text, p_size_bytes bigint) returns public.attachments
language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members; v_attachment public.attachments;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.id is null or not public.can_access_ticket(p_ticket_id) then raise exception 'NOT_FOUND'; end if;
  if split_part(p_storage_path,'/',1) <> v_member.organization_id::text or split_part(p_storage_path,'/',2) <> p_ticket_id::text then raise exception 'INVALID_PATH'; end if;
  if p_comment_id is not null and not exists (select 1 from public.comments where id = p_comment_id and ticket_id = p_ticket_id) then raise exception 'INVALID_COMMENT'; end if;
  insert into public.attachments (organization_id,ticket_id,comment_id,uploaded_by,storage_path,original_filename,mime_type,size_bytes)
  values (v_member.organization_id,p_ticket_id,p_comment_id,(select auth.uid()),p_storage_path,p_original_filename,p_mime_type,p_size_bytes) returning * into v_attachment;
  return v_attachment;
end;
$$;

create function public.get_dashboard_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_member public.organization_members; v_result jsonb;
begin
  select * into v_member from public.organization_members where user_id = (select auth.uid()) and is_active;
  if v_member.id is null then raise exception 'FORBIDDEN'; end if;
  select jsonb_build_object(
    'open', count(*) filter (where status='open'),
    'inProgress', count(*) filter (where status='in_progress'),
    'resolved', count(*) filter (where status='resolved'),
    'closed', count(*) filter (where status='closed'),
    'overdue', count(*) filter (where first_agent_response_at is null and response_due_at < now()),
    'myAssigned', count(*) filter (where assigned_agent_id=(select auth.uid())),
    'myOpen', count(*) filter (where assigned_agent_id=(select auth.uid()) and status in ('open','in_progress')),
    'myOverdue', count(*) filter (where assigned_agent_id=(select auth.uid()) and first_agent_response_at is null and response_due_at < now()),
    'unassigned', count(*) filter (where assigned_agent_id is null),
    'byStatus', jsonb_build_object('open',count(*) filter(where status='open'),'in_progress',count(*) filter(where status='in_progress'),'resolved',count(*) filter(where status='resolved'),'closed',count(*) filter(where status='closed')),
    'byPriority', jsonb_build_object('low',count(*) filter(where priority='low'),'medium',count(*) filter(where priority='medium'),'high',count(*) filter(where priority='high'),'urgent',count(*) filter(where priority='urgent'))
  ) into v_result from public.tickets where organization_id=v_member.organization_id and (v_member.role in ('admin','agent') or created_by=(select auth.uid()));
  return v_result;
end;
$$;

revoke all on function public.current_organization_id() from public, anon;
revoke all on function public.current_role() from public, anon;
revoke all on function public.is_active_member() from public, anon;
revoke all on function public.can_access_ticket(uuid) from public, anon;
revoke all on function public.can_view_profile(uuid) from public, anon;
revoke all on function public.can_access_storage_object(text) from public, anon;
revoke all on function public.create_ticket(text,text,text,text) from public, anon;
revoke all on function public.assign_ticket(uuid,uuid) from public, anon;
revoke all on function public.update_ticket_priority(uuid,text) from public, anon;
revoke all on function public.update_ticket_status(uuid,text) from public, anon;
revoke all on function public.add_ticket_comment(uuid,text) from public, anon;
revoke all on function public.record_attachment(uuid,uuid,text,text,text,bigint) from public, anon;
revoke all on function public.get_dashboard_stats() from public, anon;
grant execute on function public.current_organization_id(), public.current_role(), public.is_active_member(), public.can_access_ticket(uuid), public.can_view_profile(uuid), public.can_access_storage_object(text), public.create_ticket(text,text,text,text), public.assign_ticket(uuid,uuid), public.update_ticket_priority(uuid,text), public.update_ticket_status(uuid,text), public.add_ticket_comment(uuid,text), public.record_attachment(uuid,uuid,text,text,text,bigint), public.get_dashboard_stats() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-attachments','ticket-attachments',false,5242880,array['image/png','image/jpeg','application/pdf','text/plain'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy ticket_attachments_insert on storage.objects for insert to authenticated with check (bucket_id='ticket-attachments' and public.can_access_storage_object(name));
create policy ticket_attachments_select on storage.objects for select to authenticated using (bucket_id='ticket-attachments' and public.can_access_storage_object(name));
create policy ticket_attachments_delete_own on storage.objects for delete to authenticated using (bucket_id='ticket-attachments' and owner_id=(select auth.uid()::text) and public.can_access_storage_object(name));

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='comments') then alter publication supabase_realtime add table public.comments; end if;
end $$;
