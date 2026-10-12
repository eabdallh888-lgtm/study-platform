-- الصق الملف ده كله في Supabase > SQL Editor ثم Run
-- آمن تشغّله أكتر من مرة (بيمسح السياسات القديمة ويعيد إنشاءها)
create extension if not exists pgcrypto;
create table if not exists lessons(
  id uuid primary key default gen_random_uuid(),
  title text not null, cat text default 'عام', emoji text default '📘',
  color text default '#ff8a00', descr text default '', items jsonb default '[]',
  sort int default 100, published boolean default true, created_at timestamptz default now());
create table if not exists deck_html(
  id uuid primary key default gen_random_uuid(), html text not null, created_at timestamptz default now());
alter table lessons enable row level security;
alter table deck_html enable row level security;

drop policy if exists "الطلاب يشوفوا الدروس المنشورة" on lessons;
drop policy if exists "المعلم يتحكم في الدروس" on lessons;
drop policy if exists "الكل يقرأ الديكات" on deck_html;
drop policy if exists "المعلم يتحكم في الديكات" on deck_html;
create policy "الطلاب يشوفوا الدروس المنشورة" on lessons for select to anon using (published);
create policy "المعلم يتحكم في الدروس" on lessons for all to authenticated using (true) with check (true);
create policy "الكل يقرأ الديكات" on deck_html for select to anon, authenticated using (true);
create policy "المعلم يتحكم في الديكات" on deck_html for all to authenticated using (true) with check (true);

insert into storage.buckets(id,name,public,file_size_limit) values('lesson-files','lesson-files',true,52428800)
  on conflict (id) do update set public=true, file_size_limit=52428800;
drop policy if exists "الكل يقرأ الملفات" on storage.objects;
drop policy if exists "المعلم يرفع الملفات" on storage.objects;
drop policy if exists "المعلم يحذف الملفات" on storage.objects;
create policy "الكل يقرأ الملفات" on storage.objects for select using (bucket_id='lesson-files');
create policy "المعلم يرفع الملفات" on storage.objects for insert to authenticated with check (bucket_id='lesson-files');
create policy "المعلم يحذف الملفات" on storage.objects for delete to authenticated using (bucket_id='lesson-files');
