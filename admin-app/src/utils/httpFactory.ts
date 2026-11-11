/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class HttpFactory {
  private axiosInstance: AxiosInstance;
  public static onSessionExpired: () => void = () => {};
  private static isRefreshing = false;
  private static failedQueue: any[] = [];

  private static processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    this.failedQueue = [];
  }

  private static resolveAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    const direct = localStorage.getItem('accessToken');
    if (direct) return direct;
    try {
      const raw = localStorage.getItem('aatmiya_admin_auth_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) return parsed.accessToken;
      }
    } catch {
      // Ignore malformed JSON
    }
    return null;
  }

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001',
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 1. Request Interceptor: Attach Tokens
    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        const token = HttpFactory.resolveAdminToken();
        if (token && !config.headers?.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error),
    );

    // 2. Response Interceptor: Handle 401 Token Refresh & Error Formatting
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._authRetry &&
          !String(originalRequest.url || '').includes('/admin/auth/login')
        ) {
          if (HttpFactory.isRefreshing) {
            return new Promise(function (resolve, reject) {
              HttpFactory.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._authRetry = true;
          HttpFactory.isRefreshing = true;

          try {
            const refreshToken =
              typeof window !== 'undefined'
                ? localStorage.getItem('refreshToken')
                : null;
            if (!refreshToken) throw new Error('No refresh token available');

            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/auth/refresh`,
              { refreshToken },
            );

            const rawPayload = response.data;
            const newTokens =
              rawPayload &&
              typeof rawPayload === 'object' &&
              'data' in rawPayload
                ? rawPayload.data
                : rawPayload;

            if (newTokens?.accessToken) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', newTokens.accessToken);
                if (newTokens.refreshToken) {
                  localStorage.setItem('refreshToken', newTokens.refreshToken);
                }
              }

              HttpFactory.processQueue(null, newTokens.accessToken);
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.axiosInstance(originalRequest);
            } else {
              HttpFactory.processQueue(new Error('Session expired'), null);
              HttpFactory.onSessionExpired();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            HttpFactory.processQueue(refreshError, null);
            HttpFactory.onSessionExpired();
            return Promise.reject(refreshError);
          } finally {
            HttpFactory.isRefreshing = false;
          }
        }

        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.message) {
            error.message = Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : errorData.message;
          } else if (errorData.error) {
            error.message = errorData.error;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  protected unwrap<T = any>(rawResult: any): T {
    if (
      rawResult &&
      typeof rawResult === 'object' &&
      'data' in rawResult
    ) {
      return rawResult.data as T;
    }
    return rawResult as T;
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async get(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }
}
