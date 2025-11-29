-- Add profile columns to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age > 0 AND age < 150),
ADD COLUMN IF NOT EXISTS height INTEGER CHECK (height > 0 AND height < 300),
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment
COMMENT ON COLUMN users.age IS 'User age in years';
COMMENT ON COLUMN users.height IS 'User height in centimeters';
COMMENT ON COLUMN users.profile_picture IS 'URL or path to profile picture';
