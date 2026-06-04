export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
export const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : 'http://localhost:4000/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('progloss_access_token', token);
    else localStorage.removeItem('progloss_access_token');
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('progloss_access_token');
  }
  return accessToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const doFetch = async () => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
    const body = (await response.json()) as ApiResponse<T>;
    return { response, body } as const;
  };

  let fetched = await doFetch();

  // If auth failed, try rotating refresh token once (server sets refresh cookie on login)
  if ((fetched.response.status === 401 || fetched.body?.message === 'Invalid token') && path !== '/auth/refresh') {
    try {
      // attempt refresh using cookie
      const refreshResp = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (refreshResp.ok) {
        const refreshBody = (await refreshResp.json()) as ApiResponse<{ accessToken: string }>; // may include refreshToken
        if (refreshBody.success && refreshBody.data?.accessToken) {
          setAccessToken((refreshBody.data as any).accessToken);
          // retry original request with new token
          const newToken = getAccessToken();
          if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
          fetched = await doFetch();
        }
      } else {
        // refresh failed - clear access token
        setAccessToken(null);
      }
    } catch (e) {
      setAccessToken(null);
    }
  }

  if (!fetched.response.ok || !fetched.body.success) {
    throw new Error(fetched.body.message ?? `Request failed (${fetched.response.status})`);
  }
  return fetched.body.data as T;
}
