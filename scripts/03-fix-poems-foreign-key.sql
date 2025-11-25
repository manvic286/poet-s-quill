-- Fix: Change poems foreign key to reference auth.users instead of profiles
-- This avoids the dependency on profiles table existing for each user

-- Drop existing foreign key constraint
ALTER TABLE public.poems DROP CONSTRAINT IF EXISTS poems_user_id_fkey;

-- Add new foreign key constraint that references auth.users directly
ALTER TABLE public.poems 
  ADD CONSTRAINT poems_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
