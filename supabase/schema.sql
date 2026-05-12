-- 全国墙体广告执行坐标系统 Supabase 正式数据结构
-- 在 Supabase Dashboard -> SQL Editor 中整段运行。
-- 当前首版试用策略为匿名可读写，便于 H5 快速联调；正式长期公网使用前必须改成登录和角色权限。

create extension if not exists "uuid-ossp";

create table if not exists projects (
  id text primary key,
  name text not null,
  client text,
  month text,
  color text,
  hidden boolean default false,
  archived boolean default false,
  material_rules jsonb default '["现场照片"]'::jsonb,
  updated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists workers (
  id text primary key,
  code text unique not null,
  worker_key text,
  slug text,
  access_token text unique,
  name text not null,
  phone text,
  car_no text,
  team_type text default 'install',
  team_type_name text,
  project_id text,
  project_name text,
  enabled boolean default true,
  online boolean default false,
  lng numeric,
  lat numeric,
  accuracy numeric,
  speed numeric default 0,
  heading numeric,
  moving boolean default false,
  stopped_seconds integer default 0,
  last_seen_at timestamptz,
  last_online_at timestamptz,
  last_offline_at timestamptz,
  last_location_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists wall_points (
  id text primary key,
  title text not null,
  address text,
  city text,
  landlord_name text,
  landlord_phone text,
  captain_name text,
  captain_phone text,
  scout_name text,
  scout_phone text,
  k_code text,
  project_name text,
  status text default '待派单',
  tags text,
  lng numeric,
  lat numeric,
  completed_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists dispatch_tasks (
  id text primary key,
  worker_id text references workers(id) on delete cascade,
  point_id text references wall_points(id) on delete cascade,
  status text default '已派单',
  assigned_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists point_photos (
  id text primary key,
  point_id text references wall_points(id) on delete cascade,
  worker_id text references workers(id) on delete set null,
  url text not null,
  file_name text,
  kind text default '现场照片',
  media_kind text,
  content_type text,
  storage_path text,
  created_at timestamptz default now()
);

create table if not exists track_logs (
  id text primary key,
  worker_id text references workers(id) on delete cascade,
  worker_name text,
  event text,
  speed numeric,
  stop_minutes integer default 0,
  lng numeric,
  lat numeric,
  project_name text,
  recorded_at timestamptz,
  created_at timestamptz default now()
);

alter table projects add column if not exists client text;
alter table projects add column if not exists month text;
alter table projects add column if not exists color text;
alter table projects add column if not exists hidden boolean default false;
alter table projects add column if not exists archived boolean default false;
alter table projects add column if not exists material_rules jsonb default '["现场照片"]'::jsonb;
alter table projects add column if not exists updated_at timestamptz;

alter table workers add column if not exists worker_key text;
alter table workers add column if not exists slug text;
alter table workers add column if not exists access_token text;
alter table workers add column if not exists team_type text default 'install';
alter table workers add column if not exists team_type_name text;
alter table workers add column if not exists project_id text;
alter table workers add column if not exists project_name text;
alter table workers add column if not exists enabled boolean default true;
alter table workers add column if not exists online boolean default false;
alter table workers add column if not exists lng numeric;
alter table workers add column if not exists lat numeric;
alter table workers add column if not exists accuracy numeric;
alter table workers add column if not exists speed numeric default 0;
alter table workers add column if not exists heading numeric;
alter table workers add column if not exists moving boolean default false;
alter table workers add column if not exists stopped_seconds integer default 0;
alter table workers add column if not exists last_seen_at timestamptz;
alter table workers add column if not exists last_online_at timestamptz;
alter table workers add column if not exists last_offline_at timestamptz;
alter table workers add column if not exists last_location_at timestamptz;
alter table workers add column if not exists updated_at timestamptz;

alter table wall_points add column if not exists city text;
alter table wall_points add column if not exists captain_name text;
alter table wall_points add column if not exists captain_phone text;
alter table wall_points add column if not exists scout_name text;
alter table wall_points add column if not exists scout_phone text;
alter table wall_points add column if not exists tags text;
alter table wall_points add column if not exists updated_at timestamptz;

alter table dispatch_tasks add column if not exists assigned_at timestamptz default now();
alter table dispatch_tasks add column if not exists completed_at timestamptz;

alter table point_photos add column if not exists media_kind text;
alter table point_photos add column if not exists content_type text;
alter table point_photos add column if not exists storage_path text;

create unique index if not exists idx_workers_access_token on workers(access_token);
create index if not exists idx_workers_code on workers(code);
create index if not exists idx_workers_slug on workers(slug);
create index if not exists idx_wall_points_project on wall_points(project_name);
create index if not exists idx_wall_points_status on wall_points(status);
create index if not exists idx_dispatch_tasks_worker on dispatch_tasks(worker_id);
create index if not exists idx_dispatch_tasks_point on dispatch_tasks(point_id);
create index if not exists idx_point_photos_point on point_photos(point_id);
create index if not exists idx_track_logs_worker on track_logs(worker_id);

alter table projects enable row level security;
alter table workers enable row level security;
alter table wall_points enable row level security;
alter table dispatch_tasks enable row level security;
alter table point_photos enable row level security;
alter table track_logs enable row level security;

drop policy if exists "test projects all" on projects;
create policy "test projects all" on projects for all using (true) with check (true);

drop policy if exists "test workers all" on workers;
create policy "test workers all" on workers for all using (true) with check (true);

drop policy if exists "test points all" on wall_points;
create policy "test points all" on wall_points for all using (true) with check (true);

drop policy if exists "test tasks all" on dispatch_tasks;
create policy "test tasks all" on dispatch_tasks for all using (true) with check (true);

drop policy if exists "test photos all" on point_photos;
create policy "test photos all" on point_photos for all using (true) with check (true);

drop policy if exists "test track logs all" on track_logs;
create policy "test track logs all" on track_logs for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('point-media', 'point-media', true)
on conflict (id) do update set public = true;

drop policy if exists "test point media all" on storage.objects;
create policy "test point media all"
on storage.objects for all
using (bucket_id = 'point-media')
with check (bucket_id = 'point-media');
