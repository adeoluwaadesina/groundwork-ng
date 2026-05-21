-- Ground Work — Neon PostgreSQL schema (no Supabase RLS; auth enforced in the app)

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

create index if not exists frameworks_published_idx on frameworks (published_at desc);

create table if not exists subscribers (
  email text primary key,
  subscribed_at timestamptz default now(),
  receive_mail boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid()
);

create unique index if not exists subscribers_unsubscribe_token_key on subscribers (unsubscribe_token);

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
