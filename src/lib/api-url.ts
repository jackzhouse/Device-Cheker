const appApiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL
  || process.env.NEXT_PUBLIC_APP_API_BASE_URL
  || ''
).replace(/\/+$/, '');

export function apiUrl(path: string) {
  if (!path.startsWith('/')) {
    throw new Error('API path must start with /');
  }

  if (!appApiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL wajib diisi untuk request auth browser');
  }

  return `${appApiBaseUrl}${path}`;
}
