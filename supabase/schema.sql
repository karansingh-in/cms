-- Run in the Supabase SQL editor.
-- RLS is enabled with zero policies on purpose: nobody reaches these tables with the
-- anon key. The server uses the service-role key, which bypasses RLS.

create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  subject text,
  started_at timestamptz not null,
  ended_at timestamptz,
  study_day date not null
);

create index if not exists sessions_study_day on sessions (study_day);

-- At most one running session, enforced here rather than in client code.
create unique index if not exists sessions_one_running on sessions ((true)) where ended_at is null;

-- One row per captured item. Course is a name, not a foreign key, so a personal
-- task and a course task look the same in the Today list.
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course text,
  due_day date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_due_day on tasks (due_day) where done = false;

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits numeric not null default 0,
  target numeric
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  weight numeric not null default 0,
  score numeric,
  max numeric not null default 100,
  due_day date
);

create index if not exists assessments_course on assessments (course_id);

-- Spaced repetition. interval_days = 0 means the card is due again today.
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  front text not null,
  back text not null,
  course text,
  due_day date not null,
  interval_days int not null default 0,
  ease numeric not null default 2.5
);

create index if not exists cards_due_day on cards (due_day);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null default 'Study',
  link text,
  day date not null
);

create index if not exists logs_day on logs (day desc);

alter table sessions enable row level security;
alter table tasks enable row level security;
alter table courses enable row level security;
alter table assessments enable row level security;
alter table cards enable row level security;
alter table logs enable row level security;
