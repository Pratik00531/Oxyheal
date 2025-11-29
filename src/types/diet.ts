// TypeScript types for Diet Plan system

export interface Meal {
  name: string;
  items: string[];
  benefits: string;
  time: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
}

export interface DietPlan {
  id: string;
  user_id: string;
  assessment_id: string;
  week_plan: DayPlan[];
  recommended_foods: string[];
  foods_to_avoid: string[];
  health_tips: string[];
  generated_for: string;
  created_at: string;
}

export interface DietEligibility {
  eligible: boolean;
  message: string;
  assessment_id: string | null;
}
