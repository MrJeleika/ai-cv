-- Add optional personal_projects field to profiles
alter table public.profiles
  add column if not exists personal_projects jsonb default '[]'::jsonb;
