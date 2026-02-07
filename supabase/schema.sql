-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text unique,
  full_name text,
  title text,
  bio text,
  avatar_url text,
  resume_url text,
  social_links jsonb default '{}'::jsonb, -- Store { github, linkedin, website, leetcode }
  skills text[] default array[]::text[],
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- EXPERIENCES TABLE
create table public.experiences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company text not null,
  position text not null,
  location text,
  start_date date,
  end_date date, -- null typically means 'Present'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.experiences enable row level security;

create policy "Experiences are viewable by everyone."
  on public.experiences for select
  using ( true );

create policy "Users can insert their own experiences."
  on public.experiences for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own experiences."
  on public.experiences for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own experiences."
  on public.experiences for delete
  using ( auth.uid() = user_id );

-- PROJECTS TABLE
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  url text,
  github_url text,
  tags text[] default array[]::text[],
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone."
  on public.projects for select
  using ( true );

create policy "Users can insert their own projects."
  on public.projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own projects."
  on public.projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own projects."
  on public.projects for delete
  using ( auth.uid() = user_id );

-- EDUCATIONS TABLE
create table public.educations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  school text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  grade text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.educations enable row level security;

create policy "Educations are viewable by everyone."
  on public.educations for select
  using ( true );

create policy "Users can insert their own educations."
  on public.educations for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own educations."
  on public.educations for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own educations."
  on public.educations for delete
  using ( auth.uid() = user_id );

-- FUNCTION to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ADMIN POLICIES (Example: Allow admins to do everything)
-- For simplicity, assume admin check is done via role field in profiles
-- In real app, consider using custom claims in JWT.

create policy "Admins can view all profiles."
  on public.profiles for select
  using ( role = 'admin' );

create policy "Admins can update all profiles."
  on public.profiles for update
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Same for other tables if needed.

-- ACHIEVEMENTS TABLE
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  issuer text,
  date date,
  description text,
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;

create policy "Achievements are viewable by everyone."
  on public.achievements for select
  using ( true );

create policy "Users can insert their own achievements."
  on public.achievements for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own achievements."
  on public.achievements for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own achievements."
  on public.achievements for delete
  using ( auth.uid() = user_id );
