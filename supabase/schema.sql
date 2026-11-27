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

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null default 'Study',
  link text,
  day date not null
);

create index if not exists logs_day on logs (day desc);

-- One row per university semester; sgpa is null until the result is out.
create table if not exists semesters (
  number int primary key check (number between 1 and 8),
  credits numeric not null default 0,
  sgpa numeric check (sgpa between 0 and 10)
);

create table if not exists settings (
  key text primary key,
  value text
);

-- Courses taken for knowledge, not marks.
create table if not exists self_courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  source text not null default 'Self-study',
  link text,
  units int not null default 1,
  done int not null default 0
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idea' check (status in ('idea', 'building', 'shipped')),
  link text,
  note text
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  tag text
);

-- Syllabus sections marked done: key is "ES201:3-2".
create table if not exists sections (
  key text primary key,
  day date not null
);

-- Exam papers. modules is JSON so the syllabus shape can change without a migration.
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  year text not null default '',
  sem int not null default 0,
  credits numeric not null default 0,
  exam_date date not null,
  modules jsonb not null default '[]'::jsonb
);

-- Web push endpoints. Dead ones are deleted on the first 404/410.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null
);

alter table sessions enable row level security;
alter table tasks enable row level security;
alter table courses enable row level security;
alter table assessments enable row level security;
alter table logs enable row level security;
alter table semesters enable row level security;
alter table settings enable row level security;
alter table self_courses enable row level security;
alter table projects enable row level security;
alter table links enable row level security;
alter table sections enable row level security;
alter table subjects enable row level security;
alter table push_subscriptions enable row level security;
