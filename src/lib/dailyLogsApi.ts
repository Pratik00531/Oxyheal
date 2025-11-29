// API client for Daily Logs endpoints

import type { DailyLog, DailyLogCreate, DailyLogStats, ChartData } from '@/types/dailyLogs';

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

export const dailyLogsApi = {
  /**
   * Create or update today's daily log
   */
  saveLog: async (log: DailyLogCreate): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/daily-logs/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to save log' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while saving log' };
    }
  },

  /**
   * Get today's log if it exists
   */
  getTodayLog: async (): Promise<ApiResponse<DailyLog | null>> => {
    try {
      const response = await fetch(`${API_URL}/daily-logs/today`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to get today\'s log' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while fetching log' };
    }
  },

  /**
   * Get log history
   */
  getHistory: async (limit: number = 30): Promise<ApiResponse<DailyLog[]>> => {
    try {
      const response = await fetch(`${API_URL}/daily-logs/history?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to get history' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while fetching history' };
    }
  },

  /**
   * Get logging statistics
   */
  getStats: async (): Promise<ApiResponse<DailyLogStats>> => {
    try {
      const response = await fetch(`${API_URL}/daily-logs/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to get stats' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while fetching stats' };
    }
  },

  /**
   * Get chart data for visualization
   */
  getChartData: async (days: number = 7): Promise<ApiResponse<ChartData>> => {
    try {
      const response = await fetch(`${API_URL}/daily-logs/chart-data?days=${days}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.detail || 'Failed to get chart data' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error while fetching chart data' };
    }
  },
};
