-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create poems table
create table public.poems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create poem_shares table for tracking image exports
create table public.poem_shares (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  shared_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.poem_shares enable row level security;

-- Profiles RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Poems RLS policies
create policy "Users can view their own poems"
  on public.poems for select
  using (auth.uid() = user_id);

create policy "Users can create poems"
  on public.poems for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own poems"
  on public.poems for update
  using (auth.uid() = user_id);

create policy "Users can delete their own poems"
  on public.poems for delete
  using (auth.uid() = user_id);

-- Poem shares RLS policies
create policy "Anyone can read poem shares"
  on public.poem_shares for select
  using (true);

create policy "Users can create shares for their poems"
  on public.poem_shares for insert
  with check (
    exists (
      select 1 from public.poems
      where poems.id = poem_shares.poem_id
      and poems.user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index poems_user_id_idx on public.poems(user_id);
create index poems_created_at_idx on public.poems(created_at);
create index poem_shares_poem_id_idx on public.poem_shares(poem_id);
