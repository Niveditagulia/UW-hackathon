-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists profiles (
  id text primary key, name text not null, age integer not null,
  gender text not null, language text not null default 'en',
  contact_type text not null, contact text not null, passport text,
  created_at text not null
);
create table if not exists sessions (
  id text primary key, user_id text not null, date text not null,
  game integer not null, accuracy integer not null, speed integer not null, level integer not null
);
create index if not exists sessions_user_date on sessions(user_id, date);
create table if not exists calibrations (
  user_id text primary key, levels text not null, stages text not null, completed_at text not null
);
create table if not exists local_accounts (
  id text primary key, username text not null unique, email text not null,
  role text not null check (role in ('resident', 'staff')), salt text not null,
  password_hash text not null, attempts integer not null default 0, window_start bigint not null default 0
);
create table if not exists local_sessions (
  token_hash text primary key, user_id text not null references local_accounts(id) on delete cascade,
  expires_at bigint not null
);
create index if not exists local_sessions_user on local_sessions(user_id);

-- The app uses only the server-side service role key. Do not put it in browser code.
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table calibrations enable row level security;
alter table local_accounts enable row level security;
alter table local_sessions enable row level security;
