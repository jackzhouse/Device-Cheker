export const KATALIS_ACCESS_TOKEN_KEY = 'katalis_access_token';

export function getKatalisAccessToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KATALIS_ACCESS_TOKEN_KEY)?.replace(/^Bearer\s+/i, '').trim() || null;
}

export function setKatalisAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  const normalized = token.replace(/^Bearer\s+/i, '').trim();
  if (normalized) sessionStorage.setItem(KATALIS_ACCESS_TOKEN_KEY, normalized);
}

export function clearKatalisAccessToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KATALIS_ACCESS_TOKEN_KEY);
}
