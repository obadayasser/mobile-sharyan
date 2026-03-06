import { API_BASE_URL } from '@/constants/config';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

class ApiClient {
  private deviceId: string | null = null;
  private userType: string | null = null;
  private adminToken: string | null = null;

  setDeviceAuth(deviceId: string, userType: string) {
    this.deviceId = deviceId;
    this.userType = userType;
  }

  setAdminToken(token: string | null) {
    this.adminToken = token;
  }

  clearAuth() {
    this.deviceId = null;
    this.userType = null;
    this.adminToken = null;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = `${API_BASE_URL}${endpoint}`;
    if (!params) return url;
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return qs ? `${url}?${qs}` : url;
  }

  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.deviceId) {
      headers['X-Device-ID'] = this.deviceId;
    }
    if (this.userType) {
      headers['X-User-Type'] = this.userType;
    }
    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers, params } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method,
      headers: this.buildHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      throw {
        statusCode: json.statusCode || response.status,
        message: json.message || 'An error occurred',
        error: json.error || 'Error',
        timestamp: json.timestamp || new Date().toISOString(),
      };
    }

    // Unwrap standard response format: { statusCode, data, timestamp }
    return json.data !== undefined ? json.data : json;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  del<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
