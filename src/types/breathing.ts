// TypeScript types for breathing exercises

export interface BreathingPattern {
  inhale: number;
  hold_in?: number;
  exhale: number;
  hold_out?: number;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  pattern: BreathingPattern;
  benefits: string[];
  instructions: string;
  cycles: number;
}

export interface ExerciseSession {
  exercise_id: string;
  duration: number;
  cycles_completed: number;
  completed: boolean;
  notes?: string;
}

export interface ExerciseSessionResponse {
  id: string;
  user_id: string;
  exercise_id: string;
  duration: number;
  cycles_completed: number;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface BreathingStats {
  total_sessions: number;
  total_duration_seconds: number;
  total_cycles: number;
  completed_sessions: number;
  completion_rate: number;
  favorite_exercise?: string;
  exercise_counts: Record<string, number>;
}
