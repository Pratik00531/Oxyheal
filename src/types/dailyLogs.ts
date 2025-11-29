// TypeScript types for Daily Logs system

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: 'great' | 'okay' | 'not_good';
  breathing_quality: number; // 1-10
  cough_frequency: number;
  water_intake: number;
  steps: number;
  energy_level: number; // 1-10
  sleep_quality: number; // 1-10
  symptoms: string[];
  medications_taken: string[];
  notes: string | null;
  created_at: string;
}

export interface DailyLogCreate {
  mood: 'great' | 'okay' | 'not_good';
  breathing_quality: number;
  cough_frequency: number;
  water_intake: number;
  steps: number;
  energy_level: number;
  sleep_quality: number;
  symptoms?: string[];
  medications_taken?: string[];
  notes?: string;
}

export interface DailyLogStats {
  total_logs: number;
  current_streak: number;
  avg_breathing_quality: number;
  avg_water_intake: number;
  avg_steps: number;
  most_common_mood: string;
  recent_trends: {
    breathing_trend: 'improving' | 'stable' | 'declining';
    water_trend: 'improving' | 'stable' | 'declining';
    mood_trend: 'improving' | 'stable' | 'declining';
    avg_breathing_last_7: number;
    avg_water_last_7: number;
  };
}

export interface ChartData {
  dates: string[];
  breathing_quality: number[];
  cough_frequency: number[];
  water_intake: number[];
  steps: number[];
  energy_level: number[];
  sleep_quality: number[];
}
