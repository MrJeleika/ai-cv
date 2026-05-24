-- Curriculum AI — initial schema
-- Three tables (profiles, resumes, cover_letters); RLS enforces per-user ownership.

create extension if not exists "pgcrypto";

-- =========================================================================
-- profiles
-- =========================================================================
create table public.profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  title                text,
  email                text,
  phone                text,
  location             text,
  links                jsonb       default '[]'::jsonb,
  summary              text,
  skills               text[]      default '{}',
  experience           jsonb       default '[]'::jsonb,
  education            jsonb       default '[]'::jsonb,
  onboarding_complete  boolean     default false,
  updated_at           timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create an empty profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bump updated_at on every profile update.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();


-- =========================================================================
-- resumes
-- =========================================================================
create table public.resumes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  target_role       text,
  company           text,
  job_description   text,
  cv_json           jsonb,
  created_at        timestamptz default now()
);

create index resumes_user_created_idx on public.resumes (user_id, created_at desc);

alter table public.resumes enable row level security;

create policy "resumes: owner select"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "resumes: owner insert"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "resumes: owner update"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "resumes: owner delete"
  on public.resumes for delete
  using (auth.uid() = user_id);


-- =========================================================================
-- cover_letters
-- =========================================================================
create table public.cover_letters (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  company           text,
  role              text,
  job_description   text,
  body_text         text,
  edited_text       text,
  created_at        timestamptz default now()
);

create index cover_letters_user_created_idx on public.cover_letters (user_id, created_at desc);

alter table public.cover_letters enable row level security;

create policy "cover_letters: owner select"
  on public.cover_letters for select
  using (auth.uid() = user_id);

create policy "cover_letters: owner insert"
  on public.cover_letters for insert
  with check (auth.uid() = user_id);

create policy "cover_letters: owner update"
  on public.cover_letters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cover_letters: owner delete"
  on public.cover_letters for delete
  using (auth.uid() = user_id);
