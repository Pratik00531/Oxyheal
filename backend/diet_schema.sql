-- Diet Plans Database Schema
-- Run this in Supabase SQL Editor

-- Diet Plans Table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES lung_cancer_assessments(id) ON DELETE CASCADE NOT NULL,
  week_plan JSONB NOT NULL, -- 7-day meal plan
  recommended_foods TEXT[] NOT NULL, -- Array of recommended foods
  foods_to_avoid TEXT[] NOT NULL, -- Array of foods to avoid
  health_tips TEXT[] NOT NULL, -- Array of health tips
  generated_for TEXT NOT NULL, -- Conditions: "inflammation, smoker, nodules" etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id 
  ON diet_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_diet_plans_assessment_id 
  ON diet_plans(assessment_id);

CREATE INDEX IF NOT EXISTS idx_diet_plans_created_at 
  ON diet_plans(created_at DESC);

-- Ensure one diet plan per assessment
CREATE UNIQUE INDEX IF NOT EXISTS idx_diet_plans_unique_assessment
  ON diet_plans(assessment_id);

-- Comments for documentation
COMMENT ON TABLE diet_plans IS 'Stores personalized diet plans based on lung cancer screening results';
COMMENT ON COLUMN diet_plans.week_plan IS '7-day meal plan with breakfast, lunch, snack, dinner for each day';
COMMENT ON COLUMN diet_plans.generated_for IS 'Conditions detected: inflammation, smoker, nodules, breathlessness, mucus, routine';
COMMENT ON COLUMN diet_plans.recommended_foods IS 'List of foods recommended for detected conditions';
COMMENT ON COLUMN diet_plans.foods_to_avoid IS 'List of foods to avoid based on conditions';
