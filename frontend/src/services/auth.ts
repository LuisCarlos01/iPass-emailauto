import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private static TOKEN_KEY = '@iPass:token';
  private static USER_KEY = '@iPass:user';

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  }

  async logout(): Promise<void> {
    this.removeToken();
    this.removeUser();
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  getUser(): User | null {
    const user = localStorage.getItem(AuthService.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private setUser(user: User): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  private removeToken(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }

  private removeUser(): void {
    localStorage.removeItem(AuthService.USER_KEY);
  }
}

export const authService = new AuthService(); 