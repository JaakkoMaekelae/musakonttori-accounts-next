import { createAccountsClient } from "@musakonttori/accounts-client";
import type { ServiceConfig, UserPayload } from "@musakonttori/accounts-client";
import { cookies } from "next/headers";
import { logError } from "./logger";
import { shouldRefreshToken } from "./csrf";
import { registerGlobalErrorHandler } from "./instrumentation";

// Auto-register on first import
registerGlobalErrorHandler();

export { type ServiceConfig, type UserPayload };

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface Session {
  user: SessionUser;
}

let _accounts: ReturnType<typeof createAccountsClient> | null = null;

function getAccounts() {
  if (!_accounts) {
    _accounts = createAccountsClient({
      apiUrl: process.env.ACCOUNTS_API_URL!,
      serviceName: process.env.ACCOUNTS_SERVICE_NAME!,
      privateKey: process.env.SERVICE_JWT_PRIVATE_KEY!,
    });
  }
  return _accounts;
}

const COOKIE_NAME = "mk-session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days (cookie lives longer than token; refresh extends)
};

/**
 * Get the raw user JWT from the mk-session cookie.
 * Automatically refreshes the token if it's about to expire.
 * Returns null if no valid token exists.
 */
export async function getUserToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const accounts = getAccounts();

  // Auto-refresh if token is close to expiry
  if (shouldRefreshToken(token)) {
    try {
      const { token: newToken } = await accounts.refreshToken(token);
      cookieStore.set(COOKIE_NAME, newToken, COOKIE_OPTIONS);
      return newToken;
    } catch {
      // Refresh failed — fall through to current token
    }
  }

  return token;
}

/**
 * Get the current session from the mk-session cookie.
 * Automatically refreshes the token if it's about to expire.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<Session | null> {
  const token = await getUserToken();
  if (!token) return null;

  const accounts = getAccounts();

  try {
    const user = await accounts.getMe(token);
    return { user: { id: user.id, email: user.email, name: user.name } };
  } catch (err) {
    logError(err, { route: "getSession" });
    // Token invalid — clear it
    try {
      const cookieStore = await cookies();
      cookieStore.delete(COOKIE_NAME);
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Set the session cookie with a user JWT.
 * Also sets a CSRF cookie for login endpoints.
 */
export async function setSessionCookie(
  token: string,
  opts?: { setCsrf?: boolean },
) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

  if (opts?.setCsrf) {
    const csrfToken = crypto.randomUUID();
    cookieStore.set("mk-csrf", csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false, // readable by client JS for form submission
      maxAge: 60 * 60 * 24,
    });
  }
}

/**
 * Clear the session cookie and CSRF cookie.
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete("mk-csrf");
}

/**
 * Get the raw accounts client instance (for permission checks etc).
 */
export function getAccountsClient() {
  return getAccounts();
}
