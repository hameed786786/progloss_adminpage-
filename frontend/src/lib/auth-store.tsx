import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { getAccessToken, setAccessToken } from '@/lib/api/client';

type AuthUser = { email: string; role: string };

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

function parseJwtUser(token: string): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      email: decoded.sub?.toString() ?? 'admin',
      role: decoded.role?.toString() ?? 'Super Admin',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setAccessToken(data.accessToken);
    setUser({ email, role: data.user?.role || 'Super Admin' });
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const existing = getAccessToken();
        if (existing) {
          const response = await api.refresh();
          if (response?.accessToken) {
            setAccessToken(response.accessToken);
            const parsed = parseJwtUser(response.accessToken);
            setUser(parsed ?? { email: 'admin', role: 'Super Admin' });
          } else {
            setAccessToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
