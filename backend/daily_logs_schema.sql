-- Daily Logs Database Schema
-- Run this in Supabase SQL Editor

-- Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'okay', 'not_good')),
  breathing_quality INTEGER NOT NULL CHECK (breathing_quality BETWEEN 1 AND 10),
  cough_frequency INTEGER NOT NULL CHECK (cough_frequency >= 0),
  water_intake INTEGER NOT NULL CHECK (water_intake >= 0),
  steps INTEGER NOT NULL CHECK (steps >= 0),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  symptoms TEXT[] DEFAULT '{}',
  medications_taken TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id 
  ON daily_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date 
  ON daily_logs(log_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date 
  ON daily_logs(user_id, log_date DESC);

-- Ensure one log per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_logs_unique_user_date
  ON daily_logs(user_id, log_date);

-- Comments for documentation
COMMENT ON TABLE daily_logs IS 'Stores daily health metrics and wellness tracking data';
COMMENT ON COLUMN daily_logs.mood IS 'User mood: great, okay, or not_good';
COMMENT ON COLUMN daily_logs.breathing_quality IS 'Self-rated breathing quality from 1 (poor) to 10 (excellent)';
COMMENT ON COLUMN daily_logs.cough_frequency IS 'Number of cough episodes during the day';
COMMENT ON COLUMN daily_logs.water_intake IS 'Number of glasses of water consumed';
COMMENT ON COLUMN daily_logs.steps IS 'Number of steps walked';
COMMENT ON COLUMN daily_logs.energy_level IS 'Energy level from 1 (exhausted) to 10 (energetic)';
COMMENT ON COLUMN daily_logs.sleep_quality IS 'Sleep quality from 1 (poor) to 10 (excellent)';
COMMENT ON COLUMN daily_logs.symptoms IS 'Array of symptoms experienced: cough, breathlessness, fatigue, chest_pain, etc.';
COMMENT ON COLUMN daily_logs.medications_taken IS 'Array of medications taken during the day';
