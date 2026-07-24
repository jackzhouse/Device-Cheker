'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AuthUser } from '@/lib/auth/types';
import { apiUrl } from '@/lib/api-url';
import { clearKatalisAccessToken } from '@/lib/auth/browser-token';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async (opts?: { silent?: boolean }) => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), { cache: 'no-store', credentials: 'include' });
      if (!response.ok) {
        const wasLogged = Boolean(user);
        setUser(null);
        if (!opts?.silent && response.status === 401 && wasLogged && pathname !== '/login') {
          toast.error('Sesi habis. Silakan login lagi.');
          router.replace(`/login?next=${encodeURIComponent(pathname)}&reason=expired`);
        }
        return;
      }
      const result = await response.json();
      setUser(result.data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
    clearKatalisAccessToken();
    setUser(null);
    window.location.href = '/login?reason=logout';
  };

  useEffect(() => {
    refresh({ silent: true });
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
