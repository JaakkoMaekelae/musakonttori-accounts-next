// Types
export type {
  SessionUser,
  Session,
  ServiceConfig,
  UserPayload,
} from "./session";

export type {
  LoginInput,
  RegisterInput,
  LoginResponse,
  RegisterResponse,
  PermissionResult,
  WorkspacePermission,
  FullUserResponse,
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteInput,
} from "@musakonttori/accounts-client";

// Session management
export { getSession, getUserToken, setSessionCookie, clearSession, getAccountsClient } from "./session";

// Server-side SDK (spec §148/§151/§152)
export {
  getCurrentUser,
  getOrganizations,
  getOrganization,
  getMembership,
  can,
  requirePermission,
  listProducts,
  setActiveWorkspace,
  getActiveWorkspace,
  AccountsError,
} from "./sdk";
export type { AccountsErrorCode, PermissionCheck } from "./sdk";

// CSRF
export { generateCsrfToken, verifyCsrf, shouldRefreshToken } from "./csrf";

// Route handlers
export { loginHandler, registerHandler, refreshHandler, logoutHandler } from "./handlers";

// Middleware
export { accountsMiddleware } from "./proxy";

// Re-export full client for advanced use
export { createAccountsClient, AccountsClient } from "@musakonttori/accounts-client";

// Logger
export { logError, logWarning } from "./logger";

// Sentry
export { captureError, isSentryEnabled } from "./sentry";

// Error wrapper
export { withErrorLogging } from "./wrapper";

// Global error handler
export { registerGlobalErrorHandler } from "./instrumentation";

// Built-in route handlers
export { GET as healthHandler } from "./health";
export { GET as versionHandler } from "./version";
