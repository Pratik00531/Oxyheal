// API functions for breathing exercises

import { api } from './api';
import type { BreathingExercise, ExerciseSession, ExerciseSessionResponse, BreathingStats } from '@/types/breathing';

const BREATHING_BASE = '/breathing';

export const breathingApi = {
  // Get all exercises
  async getExercises() {
    return api.request<BreathingExercise[]>(`${BREATHING_BASE}/exercises`);
  },

  // Get specific exercise
  async getExercise(id: string) {
    return api.request<BreathingExercise>(`${BREATHING_BASE}/exercises/${id}`);
  },

  // Create session
  async createSession(session: ExerciseSession) {
    return api.request<ExerciseSessionResponse>(`${BREATHING_BASE}/sessions`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // Get user sessions
  async getSessions(limit: number = 10) {
    return api.request<ExerciseSessionResponse[]>(`${BREATHING_BASE}/sessions?limit=${limit}`);
  },

  // Get user stats
  async getStats() {
    return api.request<BreathingStats>(`${BREATHING_BASE}/stats`);
  },
};
