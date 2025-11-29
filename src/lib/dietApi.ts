// API client for Diet Plan endpoints

import type { DietPlan, DietEligibility } from '@/types/diet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const dietApi = {
  /**
   * Check if user is eligible for diet plan (has completed screening)
   */
  checkEligibility: async (): Promise<ApiResponse<DietEligibility>> => {
    try {
      const response = await fetch(`${API_URL}/diet/check-eligibility`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to check eligibility' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while checking eligibility' };
    }
  },

  /**
   * Get or generate diet plan for user
   */
  getDietPlan: async (): Promise<ApiResponse<DietPlan>> => {
    try {
      const response = await fetch(`${API_URL}/diet/plan`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to get diet plan' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while fetching diet plan' };
    }
  },
};
