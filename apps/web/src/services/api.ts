import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@brightloop/contracts';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeAccessToken: string | null = null;
let activeOrganizationId: string | null = null;

export function setAuthToken(token: string | null) {
  activeAccessToken = token;
}

export function setActiveOrganizationId(orgId: string | null) {
  activeOrganizationId = orgId;
}

// Request Interceptor: Attach Auth & Tenant Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (activeAccessToken) {
      config.headers.Authorization = `Bearer ${activeAccessToken}`;
    }
    if (activeOrganizationId) {
      config.headers['x-organization-id'] = activeOrganizationId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Unwrap ApiResponse envelope and handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string }>>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAuthToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        setAuthToken(null);
      }
    }

    return Promise.reject(error);
  },
);
