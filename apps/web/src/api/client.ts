/**
 * Thin fetch wrapper for the @acpt/api REST endpoints.
 *
 * - Reads the base URL from EXPO_PUBLIC_API_BASE_URL (set in .env.local).
 * - Throws ApiError on non-2xx so TanStack Query's onError fires consistently.
 * - Does NOT do any request validation; that lives in the per-feature hook
 *   files where the response zod schema from @acpt/shared is parsed.
 */

const API_BASE_URL = process.env['EXPO_PUBLIC_API_BASE_URL'] ?? 'http://localhost:3000/api/v1';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  override readonly name: string = 'ApiError';
  readonly status: number;
  readonly code: string;
  readonly requestId: string;
  readonly details: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.status = status;
    this.code = body.error.code;
    this.requestId = body.error.requestId;
    this.details = body.error.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...init,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({
      error: {
        code: 'UNKNOWN',
        message: response.statusText,
        requestId: '',
      },
    }))) as ApiErrorBody;
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit): Promise<T> =>
    request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
    request<T>('POST', path, body, init),
  put: <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
    request<T>('PUT', path, body, init),
  delete: <T>(path: string, init?: RequestInit): Promise<T> =>
    request<T>('DELETE', path, undefined, init),
};
