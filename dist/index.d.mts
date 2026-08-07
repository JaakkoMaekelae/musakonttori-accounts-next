import * as _musakonttori_accounts_client from '@musakonttori/accounts-client';
export { AccountsClient, CreateWorkspaceInput, FullUserResponse, InviteInput, LoginInput, LoginResponse, PermissionResult, RegisterInput, RegisterResponse, ServiceConfig, UpdateWorkspaceInput, UserPayload, Workspace, WorkspacePermission, createAccountsClient } from '@musakonttori/accounts-client';
import { NextResponse, NextRequest } from 'next/server';

interface SessionUser {
    id: string;
    email: string;
    name: string | null;
}
interface Session {
    user: SessionUser;
}
/**
 * Get the current session from the mk-session cookie.
 * Automatically refreshes the token if it's about to expire.
 * Returns null if no valid session exists.
 */
declare function getSession(): Promise<Session | null>;
/**
 * Set the session cookie with a user JWT.
 * Also sets a CSRF cookie for login endpoints.
 */
declare function setSessionCookie(token: string, opts?: {
    setCsrf?: boolean;
}): Promise<void>;
/**
 * Clear the session cookie and CSRF cookie.
 */
declare function clearSession(): Promise<void>;
/**
 * Get the raw accounts client instance (for permission checks etc).
 */
declare function getAccountsClient(): _musakonttori_accounts_client.AccountsClient;

/**
 * Check if a JWT needs refresh (within 5 min of expiry, or iat > 7 days ago).
 * Used to proactively refresh tokens before they expire.
 */
declare function shouldRefreshToken(token: string): boolean;
/**
 * Generate a CSRF token and return { token, cookieString }.
 * Uses double-submit cookie pattern: token in both cookie and hidden form field.
 */
declare function generateCsrfToken(): {
    token: string;
    cookieName: string;
};
/**
 * Verify CSRF token matches between cookie and header/body.
 */
declare function verifyCsrf(cookieToken: string | undefined, requestToken: string | undefined): boolean;

/**
 * Login POST handler.
 * Body: { email: string, password: string }
 * Sets mk-session cookie on success.
 * Returns { user: { id, name, email } }
 */
declare function loginHandler(req: Request): Promise<NextResponse>;
/**
 * Register POST handler.
 * Body: { email: string, password: string, name?: string }
 * Sets mk-session cookie on success.
 */
declare function registerHandler(req: Request): Promise<NextResponse>;
/**
 * Refresh POST handler.
 * Body: none (reads token from cookie)
 * Returns { token: string }
 */
declare function refreshHandler(req: Request): Promise<NextResponse>;
/**
 * Logout handler (GET or POST).
 * Clears mk-session cookie.
 */
declare function logoutHandler(): Promise<NextResponse>;

interface AccountsMiddlewareOptions {
    /** Routes that DON'T require auth. Default: public pages + auth endpoints */
    publicRoutes?: string[];
    /** Routes that ALWAYS require auth. Default: none */
    protectedRoutes?: string[];
    /** Enable CSRF protection on login/register POST. Default: true */
    csrfProtection?: boolean;
}
/**
 * Next.js middleware for Musakonttori Accounts.
 *
 * Features:
 * - Proactive token refresh (refreshes before expiry)
 * - CSRF protection on login/register endpoints
 * - Cookie touch on every request (extends session lifetime)
 *
 * Usage:
 *   export default accountsMiddleware({ protectedRoutes: ["/dashboard(.*)"] });
 */
declare function accountsMiddleware(opts?: AccountsMiddlewareOptions): (request: NextRequest) => Promise<NextResponse<unknown>>;

declare function logError(error: unknown, context?: {
    route?: string;
    userId?: string;
}): void;
declare function logWarning(message: string, context?: {
    route?: string;
}): void;

type RouteHandler = (req: Request, context?: unknown) => Promise<NextResponse>;
/**
 * Wrap a route handler with automatic error logging.
 * Catches all errors, logs them to console + HQ, returns a clean error response.
 *
 * Usage:
 *   export const GET = withErrorLogging(async (req) => { ... });
 *   export const POST = withErrorLogging(async (req) => { ... });
 */
declare function withErrorLogging(handler: RouteHandler): RouteHandler;

declare function registerGlobalErrorHandler(): void;

export { type Session, type SessionUser, accountsMiddleware, clearSession, generateCsrfToken, getAccountsClient, getSession, logError, logWarning, loginHandler, logoutHandler, refreshHandler, registerGlobalErrorHandler, registerHandler, setSessionCookie, shouldRefreshToken, verifyCsrf, withErrorLogging };
