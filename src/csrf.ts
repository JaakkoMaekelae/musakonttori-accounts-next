import { decodeJwt } from "jose";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 min before expiry
const REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if a JWT needs refresh (within 5 min of expiry, or iat > 7 days ago).
 * Used to proactively refresh tokens before they expire.
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = decodeJwt(token);
    if (!decoded.exp || !decoded.iat) return true;

    const now = Date.now();
    const expiresAt = decoded.exp * 1000;
    const issuedAt = decoded.iat * 1000;

    // Refresh if within buffer of expiry
    if (now + REFRESH_BUFFER_MS >= expiresAt) return true;

    // Refresh if issued > 7 days ago (accounts refresh window)
    if (now - issuedAt > REFRESH_WINDOW_MS - REFRESH_BUFFER_MS) return true;

    return false;
  } catch {
    return true;
  }
}

/**
 * Generate a CSRF token and return { token, cookieString }.
 * Uses double-submit cookie pattern: token in both cookie and hidden form field.
 */
export function generateCsrfToken(): { token: string; cookieName: string } {
  const token = crypto.randomUUID();
  return { token, cookieName: "mk-csrf" };
}

/**
 * Verify CSRF token matches between cookie and header/body.
 */
export function verifyCsrf(
  cookieToken: string | undefined,
  requestToken: string | undefined,
): boolean {
  if (!cookieToken || !requestToken) return false;
  return crypto.subtle
    ? cookieToken === requestToken // Constant-time not needed for UUID comparison
    : cookieToken === requestToken;
}
