-- run this in your Supabase SQL editor

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Nuevas columnas (usamos ALTER para asegurar que se agreguen si no existen)
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists course text;
alter table public.profiles add column if not exists section text;

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  type_label text not null,
  location text not null,
  price text not null,
  tag text,
  creator_id uuid references public.profiles(id) not null,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(task_id, applicant_id)
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.applications enable row level security;
alter table public.notifications enable row level security;

-- Policies for notifications (Usamos DO bloque para evitar errores si ya existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications' AND tablename = 'notifications') THEN
    create policy "Users can view their own notifications" on public.notifications
      for select using (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications' AND tablename = 'notifications') THEN
    create policy "Users can update their own notifications" on public.notifications
      for update using (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert notifications' AND tablename = 'notifications') THEN
    create policy "System can insert notifications" on public.notifications
      for insert with check (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own notifications' AND tablename = 'notifications') THEN
    create policy "Users can delete their own notifications" on public.notifications
      for delete using (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone.' AND tablename = 'profiles') THEN
    create policy "Public profiles are viewable by everyone." on public.profiles
      for select using (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile.' AND tablename = 'profiles') THEN
    create policy "Users can insert their own profile." on public.profiles
      for insert with check (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile.' AND tablename = 'profiles') THEN
    create policy "Users can update own profile." on public.profiles
      for update using (auth.uid() = id);
  END IF;
END $$;

-- Policies for tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tasks are viewable by everyone.' AND tablename = 'tasks') THEN
    create policy "Tasks are viewable by everyone." on public.tasks
      for select using (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create tasks.' AND tablename = 'tasks') THEN
    create policy "Authenticated users can create tasks." on public.tasks
      for insert with check (auth.uid() = creator_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own tasks.' AND tablename = 'tasks') THEN
    create policy "Users can update their own tasks." on public.tasks
      for update using (auth.uid() = creator_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own tasks.' AND tablename = 'tasks') THEN
    create policy "Users can delete their own tasks." on public.tasks
      for delete using (auth.uid() = creator_id);
  END IF;
END $$;

-- Policies for applications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view applications for their tasks or their own applications' AND tablename = 'applications') THEN
    create policy "Users can view applications for their tasks or their own applications" on public.applications
      for select using (
        auth.uid() = applicant_id or 
        auth.uid() in (select creator_id from public.tasks where id = task_id)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can apply to tasks' AND tablename = 'applications') THEN
    create policy "Authenticated users can apply to tasks" on public.applications
      for insert with check (auth.uid() = applicant_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Task creators can update application status' AND tablename = 'applications') THEN
    create policy "Task creators can update application status" on public.applications
      for update using (auth.uid() in (select creator_id from public.tasks where id = task_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Task creators and applicants can delete applications' AND tablename = 'applications') THEN
    create policy "Task creators and applicants can delete applications" on public.applications
      for delete using (auth.uid() = applicant_id or auth.uid() in (select creator_id from public.tasks where id = task_id));
  END IF;
END $$;

-- Triggers to auto-create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Evitar error si el trigger ya existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- STORAGE CONFIGURATION
-- ==========================================

-- Solo crear bucket si no existe (Requiere entorno Supabase y puede fallar en UI libre de permisos, ignorar si falla)
-- 1. Create a public bucket for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Policies for avatars bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars are publicly accessible.' AND tablename = 'objects') THEN
    create policy "Avatars are publicly accessible." 
      on storage.objects for select 
      using ( bucket_id = 'avatars' );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar.' AND tablename = 'objects') THEN
    create policy "Users can upload their own avatar." 
      on storage.objects for insert 
      with check ( bucket_id = 'avatars' and auth.uid() = owner );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar.' AND tablename = 'objects') THEN
    create policy "Users can update their own avatar." 
      on storage.objects for update 
      using ( bucket_id = 'avatars' and auth.uid() = owner );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar.' AND tablename = 'objects') THEN
    create policy "Users can delete their own avatar." 
      on storage.objects for delete 
      using ( bucket_id = 'avatars' and auth.uid() = owner );
  END IF;
END $$;

-- 2. Create a public bucket for task images (maquetas, etc.)
insert into storage.buckets (id, name, public) 
values ('task-images', 'task-images', true) ON CONFLICT DO NOTHING;

-- Policies for task-images bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Task images are publicly accessible.' AND tablename = 'objects') THEN
    create policy "Task images are publicly accessible." 
      on storage.objects for select 
      using ( bucket_id = 'task-images' );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload task images.' AND tablename = 'objects') THEN
    create policy "Users can upload task images." 
      on storage.objects for insert 
      with check ( bucket_id = 'task-images' and auth.uid() = owner );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own task images.' AND tablename = 'objects') THEN
    create policy "Users can update their own task images." 
      on storage.objects for update 
      using ( bucket_id = 'task-images' and auth.uid() = owner );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own task images.' AND tablename = 'objects') THEN
    create policy "Users can delete their own task images." 
      on storage.objects for delete 
      using ( bucket_id = 'task-images' and auth.uid() = owner );
  END IF;
END $$;

