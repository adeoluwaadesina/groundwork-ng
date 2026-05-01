-- Ground Work — database schema
-- Run this in Supabase Dashboard > SQL Editor > New Query

-- ─────────────────────────────────────────────
-- FRAMEWORKS TABLE
-- ─────────────────────────────────────────────
create table if not exists frameworks (
  id text primary key,
  title text not null,
  subtitle text,
  sector text,
  date text,
  tags text[] default '{}',
  lite_content text,
  full_content text,
  views integer default 0,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists frameworks_published_idx on frameworks(published_at desc);

-- ─────────────────────────────────────────────
-- SUBSCRIBERS TABLE
-- ─────────────────────────────────────────────
create table if not exists subscribers (
  email text primary key,
  subscribed_at timestamptz default now(),
  receive_mail boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid()
);

create unique index if not exists subscribers_unsubscribe_token_key on subscribers (unsubscribe_token);

-- ─────────────────────────────────────────────
-- VIEW INCREMENT FUNCTION (atomic, race-safe)
-- ─────────────────────────────────────────────
create or replace function increment_views(framework_id text)
returns integer as $$
declare
  new_count integer;
begin
  update frameworks
    set views = views + 1
    where id = framework_id
    returning views into new_count;
  return new_count;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table frameworks enable row level security;
alter table subscribers enable row level security;

-- Anyone can read frameworks (public site)
drop policy if exists "frameworks_public_read" on frameworks;
create policy "frameworks_public_read"
  on frameworks for select
  using (true);

-- Only authenticated users can write (admin route checks email match)
drop policy if exists "frameworks_admin_write" on frameworks;
create policy "frameworks_admin_write"
  on frameworks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Subscribers: insert-only from public, read only by admin
drop policy if exists "subscribers_public_insert" on subscribers;
create policy "subscribers_public_insert"
  on subscribers for insert
  with check (true);

drop policy if exists "subscribers_admin_read" on subscribers;
create policy "subscribers_admin_read"
  on subscribers for select
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists frameworks_updated_at on frameworks;
create trigger frameworks_updated_at
  before update on frameworks
  for each row execute function set_updated_at();

-- If you created `subscribers` before receive_mail / unsubscribe_token existed, run once in SQL Editor:
-- alter table subscribers add column if not exists receive_mail boolean not null default true;
-- alter table subscribers add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
-- create unique index if not exists subscribers_unsubscribe_token_key on subscribers (unsubscribe_token);
