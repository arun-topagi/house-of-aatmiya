/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import HttpFactory from '@/utils/httpFactory';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  headers?: any;
}

export interface AxiosBaseQueryError {
  status?: number;
  data?: any;
}

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const sharedHttpFactory = new HttpFactory(defaultBaseUrl);

export const axiosBaseQuery = (
  { baseUrl }: { baseUrl?: string } = {},
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> => {
  const http = baseUrl ? new HttpFactory(baseUrl) : sharedHttpFactory;

  return async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const upperMethod = method.toUpperCase();
      let rawResult: any;

      if (upperMethod === 'GET') {
        rawResult = await http.get(url, { params, headers });
      } else if (upperMethod === 'POST') {
        rawResult = await http.post(url, data, { params, headers });
      } else if (upperMethod === 'PUT') {
        rawResult = await http.put(url, data, { params, headers });
      } else if (upperMethod === 'DELETE') {
        rawResult = await http.delete(url, { params, headers });
      } else if (upperMethod === 'PATCH') {
        rawResult = await http.patch(url, data, { params, headers });
      } else {
        rawResult = await http.post(url, data, { params, headers });
      }

      const unwrappedData =
        rawResult &&
        typeof rawResult === 'object' &&
        'data' in rawResult &&
        'message' in rawResult
          ? rawResult.data
          : rawResult;

      return { data: unwrappedData };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status,
          data:
            axiosError.response?.data?.message ||
            axiosError.message ||
            'An unexpected error occurred',
        },
      };
    }
  };
};

export default axiosBaseQuery;
