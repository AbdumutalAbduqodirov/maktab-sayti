-- =====================================================
-- MAKTAB WEB SAYTI — Supabase SQL sxemasi
-- Supabase > SQL Editor ga to'liq joylab, "Run" bosing
-- =====================================================

-- 1) O'QITUVCHILAR ------------------------------------
create table if not exists public.teachers (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  subject          text not null,              -- fan (filtr uchun)
  position         text,                       -- lavozimi: "Oliy toifali o'qituvchi"
  experience_years smallint check (experience_years >= 0),
  bio              text,
  photo_url        text,
  email            text,
  phone            text,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists teachers_subject_idx on public.teachers (subject);

-- 2) YUTUQLAR -----------------------------------------
create table if not exists public.achievements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  student_name text,                           -- o'quvchi ismi
  year         smallint not null check (year between 1990 and 2100),
  subject      text not null,                  -- fan
  level        text not null check (level in
                 ('maktab','tuman','viloyat','respublika','xalqaro')),
  place        text,                           -- "1-o'rin", "Diplom" ...
  image_url    text,
  teacher_id   uuid references public.teachers(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists achievements_filter_idx
  on public.achievements (year, subject, level);
create index if not exists achievements_teacher_idx
  on public.achievements (teacher_id);

-- 3) YANGILIKLAR --------------------------------------
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,           -- /yangiliklar/[slug]
  summary      text,                           -- qisqa mazmun (kartochka uchun)
  content      text not null,
  cover_url    text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists news_published_idx
  on public.news (is_published, published_at desc);

-- 3.1) YANGILIK GALEREYASI ----------------------------
create table if not exists public.news_images (
  id         uuid primary key default gen_random_uuid(),
  news_id    uuid not null references public.news(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0
);
create index if not exists news_images_news_idx on public.news_images (news_id);

-- 4) DARS JADVALI -------------------------------------
create table if not exists public.schedule (
  id            uuid primary key default gen_random_uuid(),
  class_name    text not null,                 -- "5-A", "9-B"
  weekday       smallint not null check (weekday between 1 and 6), -- 1=Dushanba ... 6=Shanba
  lesson_number smallint not null check (lesson_number between 1 and 10),
  subject       text not null,
  teacher_id    uuid references public.teachers(id) on delete set null,
  room          text,                          -- xona
  start_time    time,
  end_time      time,
  unique (class_name, weekday, lesson_number)
);
create index if not exists schedule_class_idx on public.schedule (class_name, weekday);

-- =====================================================
-- XAVFSIZLIK (Row Level Security)
-- Hamma o'qiy oladi; faqat kirgan admin yoza oladi
-- =====================================================
alter table public.teachers      enable row level security;
alter table public.achievements  enable row level security;
alter table public.news          enable row level security;
alter table public.news_images   enable row level security;
alter table public.schedule      enable row level security;

-- Ochiq o'qish
create policy "teachers_read"     on public.teachers     for select using (true);
create policy "achievements_read" on public.achievements for select using (true);
create policy "schedule_read"     on public.schedule     for select using (true);
create policy "news_read"         on public.news         for select
  using (is_published = true or auth.role() = 'authenticated');
create policy "news_images_read"  on public.news_images  for select using (true);

-- Faqat admin (authenticated) yozadi
create policy "teachers_write"     on public.teachers     for all to authenticated using (true) with check (true);
create policy "achievements_write" on public.achievements for all to authenticated using (true) with check (true);
create policy "news_write"         on public.news         for all to authenticated using (true) with check (true);
create policy "news_images_write"  on public.news_images  for all to authenticated using (true) with check (true);
create policy "schedule_write"     on public.schedule     for all to authenticated using (true) with check (true);

-- =====================================================
-- RASMLAR UCHUN STORAGE (bucket)
-- =====================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

create policy "media_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');

create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- =====================================================
-- NAMUNA MA'LUMOT (ixtiyoriy — sinab ko'rish uchun)
-- =====================================================
-- insert into public.teachers (full_name, subject, position, experience_years)
-- values ('Abdumutal Abduqodirov', 'Informatika', 'Informatika va robototexnika o''qituvchisi', 5);
