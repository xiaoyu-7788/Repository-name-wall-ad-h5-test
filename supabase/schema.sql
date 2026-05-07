-- 墙体广告执行 H5 测试版数据库结构
-- 在 Supabase Dashboard → SQL Editor 里粘贴运行

create extension if not exists "uuid-ossp";

create table if not exists workers (
  id text primary key,
  code text unique not null,
  name text not null,
  phone text,
  car_no text,
  created_at timestamptz default now()
);

create table if not exists wall_points (
  id text primary key,
  title text not null,
  address text,
  landlord_name text,
  landlord_phone text,
  k_code text,
  project_name text,
  status text default '待施工',
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
  status text default '已派发',
  created_at timestamptz default now()
);

create table if not exists point_photos (
  id text primary key,
  point_id text references wall_points(id) on delete cascade,
  worker_id text references workers(id) on delete set null,
  url text not null,
  file_name text,
  -- kind 可写入：现场照片 / 现场视频 / 水印图片 / 720全景 / 全景视频 / Kimi分类结果
  kind text default '现场照片',
  created_at timestamptz default now()
);

create index if not exists idx_workers_code on workers(code);
create index if not exists idx_wall_points_project on wall_points(project_name);
create index if not exists idx_wall_points_status on wall_points(status);
create index if not exists idx_dispatch_tasks_worker on dispatch_tasks(worker_id);
create index if not exists idx_dispatch_tasks_point on dispatch_tasks(point_id);
create index if not exists idx_point_photos_point on point_photos(point_id);

alter table workers enable row level security;
alter table wall_points enable row level security;
alter table dispatch_tasks enable row level security;
alter table point_photos enable row level security;

-- H5测试期宽松策略：匿名可读写。正式上线前必须改为登录后按角色/师傅ID限制。
drop policy if exists "test workers all" on workers;
create policy "test workers all" on workers for all using (true) with check (true);

drop policy if exists "test points all" on wall_points;
create policy "test points all" on wall_points for all using (true) with check (true);

drop policy if exists "test tasks all" on dispatch_tasks;
create policy "test tasks all" on dispatch_tasks for all using (true) with check (true);

drop policy if exists "test photos all" on point_photos;
create policy "test photos all" on point_photos for all using (true) with check (true);

-- Storage:
-- 运行本脚本会创建测试 bucket，并放开匿名读写，方便 H5 和真实手机端测试。
-- 正式上线前请改为登录鉴权或签名链接。
insert into storage.buckets (id, name, public)
values ('point-media', 'point-media', true)
on conflict (id) do update set public = true;

drop policy if exists "test point media all" on storage.objects;
create policy "test point media all"
on storage.objects for all
using (bucket_id = 'point-media')
with check (bucket_id = 'point-media');
