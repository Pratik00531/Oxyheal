-- Fix RLS policies for OxyHeal
-- Run this in Supabase SQL Editor to fix the signup issue

-- Disable RLS on users table (since we handle auth with JWT)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on log_entries table (we check user_id in backend)
ALTER TABLE log_entries DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- (Comment out the DISABLE commands above and uncomment below)

/*
-- Allow anyone to insert new users (for signup)
DROP POLICY IF EXISTS "Allow public signup" ON users;
CREATE POLICY "Allow public signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- For log_entries - allow insert/select/update/delete for own logs
DROP POLICY IF EXISTS "Users can insert own logs" ON log_entries;
CREATE POLICY "Users can insert own logs"
  ON log_entries FOR INSERT
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can view own logs" ON log_entries;
CREATE POLICY "Users can view own logs"
  ON log_entries FOR SELECT
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can update own logs" ON log_entries;
CREATE POLICY "Users can update own logs"
  ON log_entries FOR UPDATE
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can delete own logs" ON log_entries;
CREATE POLICY "Users can delete own logs"
  ON log_entries FOR DELETE
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
*/
