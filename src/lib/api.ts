// API client for OxyHeal backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if exists
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  getToken() {
    return this.token;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('API Error Response:', response.status, error);
        console.error('Full Error Details:', JSON.stringify(error, null, 2));
        
        // Handle validation errors (array of error objects)
        if (Array.isArray(error.detail)) {
          const errorMessages = error.detail.map((e: any) => 
            `${e.loc?.join('.') || 'field'}: ${e.msg}`
          ).join(', ');
          return { error: errorMessages };
        }
        
        return { error: error.detail || JSON.stringify(error) || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Network Error:', error); // Add logging
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name?: string) {
    // Send as JSON body
    return this.request<{ id: string; email: string }>(
      '/auth/signup',
      { 
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      }
    );
  }

  async login(email: string, password: string) {
    // OAuth2PasswordRequestForm expects form data with username/password
    const formData = new URLSearchParams();
    formData.append('username', email); // Note: OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      return { error: error.detail || 'Login failed' };
    }

    const data: { access_token: string; token_type: string } = await response.json();
    this.setToken(data.access_token);
    return { data };
  }

  async getCurrentUser() {
    return this.request<{ id: number; email: string; name: string | null; age?: number; height?: number; profile_picture?: string }>(
      '/users/me'
    );
  }

  async updateUser(data: {
    name?: string;
    email?: string;
    age?: number;
    height?: number;
  }) {
    return this.request<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/me/upload-picture`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data: { profile_picture: string } = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  // Logs endpoints
  async createLog(log: {
    type?: string;
    metrics?: Record<string, any>;
    notes?: string;
  }) {
    return this.request<{ id: number }>('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async getLogs() {
    return this.request<Array<any>>('/logs');
  }

  // Upload endpoint
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }
}

export const api = new ApiClient(API_BASE_URL);
