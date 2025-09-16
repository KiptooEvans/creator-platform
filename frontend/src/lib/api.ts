import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  accountType: 'fan' | 'creator' | 'admin' | 'moderator';
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  emailVerified: boolean;
  ageVerified: boolean;
  subscriptionPrice?: number;
  profileImageUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  accountType: 'fan' | 'creator';
  agreeToTerms: boolean;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshToken = this.getStoredRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data.data!.tokens;
              this.storeToken(accessToken);
              original.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(original);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vipconnect_access_token');
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vipconnect_refresh_token');
  }

  private storeToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vipconnect_access_token', token);
  }

  private storeRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vipconnect_refresh_token', token);
  }

  public storeTokens(tokens: AuthTokens): void {
    this.storeToken(tokens.accessToken);
    this.storeRefreshToken(tokens.refreshToken);
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('vipconnect_access_token');
    localStorage.removeItem('vipconnect_refresh_token');
  }

  public isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  // Authentication endpoints
  async login(data: LoginData): Promise<AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>>> {
    return this.api.post('/auth/login', data);
  }

  async register(data: RegisterData): Promise<AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>>> {
    return this.api.post('/auth/register', data);
  }

  async logout(): Promise<AxiosResponse<ApiResponse>> {
    const refreshToken = this.getStoredRefreshToken();
    const response = await this.api.post('/auth/logout', { refreshToken });
    this.clearTokens();
    return response;
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<ApiResponse<{ tokens: AuthTokens }>>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async getCurrentUser(): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.api.get('/auth/me');
  }

  async verifyEmail(token: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/auth/verify-email', { token });
  }

  async forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/auth/reset-password', { token, newPassword, confirmPassword });
  }

  // User endpoints
  async getUserProfile(userId: string): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.api.get(`/users/${userId}`);
  }

  async updateProfile(data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.api.put('/users/me', data);
  }

  // Content endpoints
  async getContentFeed(params?: { page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<any[]>>> {
    return this.api.get('/content', { params });
  }

  async getContentById(contentId: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.api.get(`/content/${contentId}`);
  }

  async createContent(data: FormData): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.api.post('/content', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Generic request method
  async request<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.request({
      method,
      url,
      data,
    });
  }
}

export const apiService = new ApiService();
export default apiService;