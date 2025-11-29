-- Breathing Exercise Sessions Database Schema
-- Run this in Supabase SQL Editor

-- Breathing Sessions Table
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in seconds
  cycles_completed INTEGER NOT NULL,
  completion_status TEXT DEFAULT 'incomplete', -- 'completed', 'incomplete', 'abandoned'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id 
  ON breathing_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_exercise_id 
  ON breathing_sessions(exercise_id);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_created_at 
  ON breathing_sessions(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE breathing_sessions IS 'Stores user breathing exercise sessions and completion data';
COMMENT ON COLUMN breathing_sessions.duration IS 'Actual duration of the session in seconds';
COMMENT ON COLUMN breathing_sessions.cycles_completed IS 'Number of breathing cycles completed during the session';
COMMENT ON COLUMN breathing_sessions.completion_status IS 'Status: completed, incomplete, or abandoned';
