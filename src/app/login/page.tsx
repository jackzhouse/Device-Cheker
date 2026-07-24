'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertTriangle, Eye, EyeOff, Info, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api-url';
import { setKatalisAccessToken } from '@/lib/auth/browser-token';
import { useAuth } from '@/components/auth/AuthProvider';

type ExternalAuthConfig = {
  loginBaseUrl: string;
  loginPath: string;
  validationBaseUrl: string;
  credentialCheckPath: string;
};

function appUrl(path: string) {
  try {
    return apiUrl(path);
  } catch {
    return path;
  }
}

function buildExternalUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

async function parseExternalResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeBearerToken(token?: unknown) {
  return typeof token === 'string' ? token.replace(/^Bearer\s+/i, '').trim() || undefined : undefined;
}

function readTokenFromResult(result: any) {
  if (typeof result === 'string') return normalizeBearerToken(result);
  return normalizeBearerToken(
    result?.data?.token
    || result?.data?.access_token
    || result?.data?.accessToken
    || result?.data?.bearerToken
    || result?.data
    || result?.token
    || result?.access_token
    || result?.accessToken
    || result?.bearerToken
  );
}

function readResponseToken(response: Response, result: any) {
  return normalizeBearerToken(response.headers.get('authorization')) || readTokenFromResult(result);
}

function readExternalError(result: any, fallback: string) {
  if (!result || typeof result !== 'object') return fallback;
  if (Array.isArray(result.errors)) return result.errors.join(', ');
  return result.errors || result.message || result.error || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [externalConfig, setExternalConfig] = useState<ExternalAuthConfig | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const reason = searchParams.get('reason');
  const infoMessage = useMemo(() => {
    if (reason === 'expired') return 'Sesi Anda habis. Silakan login ulang.';
    if (reason === 'logout') return 'Anda sudah keluar dari workspace.';
    if (reason === 'auth') return 'Silakan login dulu untuk membuka halaman ini.';
    return '';
  }, [reason]);

  useEffect(() => {
    fetch(appUrl('/api/auth/external-config'), { cache: 'no-store', credentials: 'include' })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) throw new Error(result.error || 'Konfigurasi auth external tidak tersedia');
        setExternalConfig(result.data);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Konfigurasi auth external tidak tersedia';
        setErrorMessage(message);
        toast.error(message);
      });
  }, []);

  useEffect(() => {
    if (infoMessage) toast.info(infoMessage);
  }, [infoMessage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (!externalConfig) {
        throw new Error('Konfigurasi auth external belum siap');
      }

      const loginResponse = await fetch(buildExternalUrl(externalConfig.loginBaseUrl, externalConfig.loginPath), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        cache: 'no-store',
      });
      const loginResult = await parseExternalResponse(loginResponse);
      const loginToken = readResponseToken(loginResponse, loginResult);
      if (!loginResponse.ok || !loginToken) {
        throw new Error(readExternalError(loginResult, 'Login Katalis gagal atau token tidak ditemukan'));
      }

      const credentialResponse = await fetch(buildExternalUrl(externalConfig.validationBaseUrl, externalConfig.credentialCheckPath), {
        method: 'GET',
        headers: { Authorization: `Bearer ${loginToken}` },
        cache: 'no-store',
      });
      const credentialResult = await parseExternalResponse(credentialResponse);
      const credentialToken = readResponseToken(credentialResponse, credentialResult);
      if (!credentialResponse.ok || !credentialToken) {
        throw new Error(readExternalError(credentialResult, 'Credential check Katalis gagal atau token final tidak ditemukan'));
      }

      const response = await fetch(appUrl('/api/auth/sso'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentialToken}`,
        },
        body: JSON.stringify({ external_token: credentialToken }),
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'SSO gagal. User belum valid untuk aplikasi.');
      }
      setKatalisAccessToken(credentialToken);
      await refresh({ silent: true });
      toast.success('Login berhasil');
      router.push(searchParams.get('next') || '/dashboard');
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login gagal';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-panel">
        <div className="login-brand-row">
          <div className="login-brand-mark">
            <Image src="/tki-logo.svg" alt="TKI" width={58} height={28} priority />
          </div>
          <div className="login-brand-name">Device Checking</div>
        </div>

        <Card className="login-card">
          <CardHeader className="login-card-header">
            <CardTitle className="login-heading">Masuk ke Device Checking</CardTitle>
            {infoMessage && (
              <div className="login-message login-message-info">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="login-message login-message-error">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="login-card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="login-label">Username</label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" disabled={loading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="login-label">Password</label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading} className="pr-11" />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="login-submit" disabled={loading || !username || !password || !externalConfig}>
                {loading ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Memproses...</span> : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
