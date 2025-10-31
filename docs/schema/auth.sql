create table if not exists role (
  id text primary key, label text not null
);
insert into role (id,label) values
('owner','Owner'),('admin','Admin'),('staff','Staff'),('viewer','Viewer')
on conflict do nothing;

create table if not exists profile (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id text references role(id) default 'viewer',
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profile enable row level security;
create policy "profiles self-read or admin" on profile for select using (
  auth.uid() = id or exists (select 1 from profile p where p.id = auth.uid() and p.role_id in ('admin','owner'))
);
create policy "profiles self-update" on profile for update using (auth.uid() = id);
create index if not exists idx_profile_role on profile(role_id);
