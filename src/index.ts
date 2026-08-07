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
export { getSession, setSessionCookie, clearSession, getAccountsClient } from "./session";

// CSRF
export { generateCsrfToken, verifyCsrf, shouldRefreshToken } from "./csrf";

// Route handlers
export { loginHandler, registerHandler, refreshHandler, logoutHandler } from "./handlers";

// Middleware
export { accountsMiddleware } from "./middleware";

// Re-export full client for advanced use
export { createAccountsClient, AccountsClient } from "@musakonttori/accounts-client";
