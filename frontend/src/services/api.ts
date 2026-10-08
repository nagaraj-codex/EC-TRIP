const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  status?: number;
  data?: any;
  user?: any;
  sessionInfo?: any;
  accessToken?: any;
  resetToken?: any;
} & T;

export async function apiRequest<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure HTTP-only cookies are sent and received
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
        errors: data.errors,
        status: response.status,
      } as unknown as ApiResponse<T>;
    }

    return {
      success: true,
      ...data,
    } as unknown as ApiResponse<T>;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error. Please check your connection.',
    } as unknown as ApiResponse<T>;
  }
}
