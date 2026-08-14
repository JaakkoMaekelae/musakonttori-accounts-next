import * as _musakonttori_accounts_client from '@musakonttori/accounts-client';
import { FullUserResponse, Membership, Workspace, ProductListResponse, PermissionResult } from '@musakonttori/accounts-client';
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
 * Get the raw user JWT from the mk-session cookie.
 * Automatically refreshes the token if it's about to expire.
 * Returns null if no valid token exists.
 */
declare function getUserToken(): Promise<string | null>;
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

type AccountsErrorCode = "AUTHENTICATION_REQUIRED" | "EMAIL_VERIFICATION_REQUIRED" | "MEMBERSHIP_REQUIRED" | "MEMBERSHIP_SUSPENDED" | "ORGANIZATION_NOT_FOUND" | "PERMISSION_DENIED" | "PRODUCT_ACCESS_REQUIRED" | "ENTITLEMENT_REQUIRED";
declare class AccountsError extends Error {
    readonly code: AccountsErrorCode;
    constructor(code: AccountsErrorCode, message?: string);
}
/** Full current user (profile + memberships). Throws AUTHENTICATION_REQUIRED. */
declare function getCurrentUser(): Promise<FullUserResponse>;
/** All organizations/workspaces the current user belongs to. */
declare function getOrganizations(): Promise<Workspace[]>;
/** One organization by id, or null. */
declare function getOrganization(workspaceId: string): Promise<Workspace | null>;
/** Membership for the given organization, or null. */
declare function getMembership(workspaceId: string): Promise<Membership | null>;
interface PermissionCheck {
    action?: string;
    resourceType?: string;
    resourceId?: string;
}
/** can(user, action, resource, context) — true if allowed. */
declare function can(product: string, opts?: PermissionCheck): Promise<boolean>;
/** requirePermission — throws AccountsError(PERMISSION_DENIED) if not allowed. */
declare function requirePermission(product: string, opts?: PermissionCheck): Promise<PermissionResult>;
/** Products the current user/org may access. */
declare function listProducts(): Promise<ProductListResponse>;
/**
 * Remember the last-used organization context. This is remembered state only
 * (§53) — it is NOT authorization. Authorization always comes from
 * requirePermission/can via the token.
 */
declare function setActiveWorkspace(workspaceId: string): Promise<void>;
/** Read the remembered organization context, or null. */
declare function getActiveWorkspace(): Promise<string | null>;

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
 * UUIDs are compared via strict equality; constant-time not needed for UUIDs.
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

/**
 * Log an error. Writes to:
 *   1. console.error → Vercel logs (permanent, searchable)
 *   2. HQ /api/errors/ingest → centralized dashboard (fire-and-forget)
 *
 * Never throws. Safe to call anywhere.
 */
declare function logError(error: unknown, context?: {
    route?: string;
    userId?: string;
}): void;
/**
 * Log a warning. Non-blocking.
 */
declare function logWarning(message: string, context?: {
    route?: string;
}): void;

declare function isSentryEnabled(): boolean;
declare function captureError(error: unknown, context?: {
    route?: string;
    userId?: string;
    tags?: Record<string, string>;
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

/**
 * GET /api/health
 *
 * Built-in health check. Import and use in any service:
 *   export { GET } from "@musakonttori/accounts-next/health";
 *
 * Checks:
 *   - Service is running
 *   - DATABASE_URL is configured
 *   - Accounts API is reachable (if configured)
 */
declare function GET$1(): Promise<NextResponse<{
    status: string;
    timestamp: string;
    checks: Record<string, string>;
}>>;

/**
 * GET /api/version
 *
 * Returns service version info. Import and use:
 *   export { GET } from "@musakonttori/accounts-next/version";
 */
declare function GET(): Promise<NextResponse<{
    service: string;
    version: string;
    node: string;
    environment: string;
    timestamp: string;
}>>;

export { AccountsError, type AccountsErrorCode, type PermissionCheck, type Session, type SessionUser, accountsMiddleware, can, captureError, clearSession, generateCsrfToken, getAccountsClient, getActiveWorkspace, getCurrentUser, getMembership, getOrganization, getOrganizations, getSession, getUserToken, GET$1 as healthHandler, isSentryEnabled, listProducts, logError, logWarning, loginHandler, logoutHandler, refreshHandler, registerGlobalErrorHandler, registerHandler, requirePermission, setActiveWorkspace, setSessionCookie, shouldRefreshToken, verifyCsrf, GET as versionHandler, withErrorLogging };
