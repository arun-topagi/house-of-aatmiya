import HttpFactory from '@/utils/httpFactory';
import axios from 'axios';

export interface AdminProfile {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  admin: AdminProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  /**
   * Authenticates admin credentials with the NestJS backend auth service.
   */
  async login(
    emailOrCredentials: string | LoginCredentials,
    maybePassword?: string,
  ): Promise<LoginResponse> {
    const credentials =
      typeof emailOrCredentials === 'string'
        ? { email: emailOrCredentials, password: maybePassword ?? '' }
        : emailOrCredentials;

    const response = await this.post('/admin/auth/login', credentials);
    const data = this.unwrap<Record<string, unknown>>(response) || {};

    const token =
      (data.accessToken as string) || (data.access_token as string) || '';
    const adminProfile = (data.admin as AdminProfile) ||
      (data.user as AdminProfile) || {
        id: '',
        email: credentials.email,
        name: 'Aatmiya Admin',
        role: 'ADMIN',
      };

    return {
      accessToken: token,
      refreshToken: data.refreshToken as string | undefined,
      admin: adminProfile,
    };
  }

  /**
   * Logs out the admin by invalidating the refresh token directly.
   */
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/auth/logout`,
        { refreshToken },
      );
    } catch {
      // Ignore logout network error
    }
  }
}

export const authService = new AuthService();
export default authService;
