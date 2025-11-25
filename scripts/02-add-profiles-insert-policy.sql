-- Add missing INSERT policy for profiles table to allow new user registration
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
