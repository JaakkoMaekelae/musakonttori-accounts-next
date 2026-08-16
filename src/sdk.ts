// Server-side Accounts SDK — the high-level API products import.
// Mirrors the Accounts Platform Spec §148/§151/§152:
// getCurrentUser, getOrganization(s), getMembership, can, requirePermission,
// listProducts, switchContext + standard error codes.

import { getAccountsClient, getUserToken } from "./session";
import { cookies } from "next/headers.js";
import type {
  FullUserResponse,
  Workspace,
  Membership,
  PermissionResult,
  ProductListResponse,
} from "@musakonttori/accounts-client";

// ─── Standard error codes (§152) ──────────────────────────────

export type AccountsErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "EMAIL_VERIFICATION_REQUIRED"
  | "MEMBERSHIP_REQUIRED"
  | "MEMBERSHIP_SUSPENDED"
  | "ORGANIZATION_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "PRODUCT_ACCESS_REQUIRED"
  | "ENTITLEMENT_REQUIRED";

export class AccountsError extends Error {
  readonly code: AccountsErrorCode;

  constructor(code: AccountsErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AccountsError";
    this.code = code;
  }
}

async function requireToken(): Promise<string> {
  const token = await getUserToken();
  if (!token) throw new AccountsError("AUTHENTICATION_REQUIRED");
  return token;
}

// ─── Identity ────────────────────────────────────────────────

/** Full current user (profile + memberships). Throws AUTHENTICATION_REQUIRED. */
export async function getCurrentUser(): Promise<FullUserResponse> {
  const token = await requireToken();
  return getAccountsClient().getMe(token);
}

// ─── Organizations ───────────────────────────────────────────

/** All organizations/workspaces the current user belongs to. */
export async function getOrganizations(): Promise<Workspace[]> {
  const token = await requireToken();
  return getAccountsClient().getWorkspaces(token);
}

/** One organization by id, or null. */
export async function getOrganization(
  workspaceId: string,
): Promise<Workspace | null> {
  const workspaces = await getOrganizations();
  return workspaces.find((w) => w.id === workspaceId) ?? null;
}

/** Membership for the given organization, or null. */
export async function getMembership(
  workspaceId: string,
): Promise<Membership | null> {
  const user = await getCurrentUser();
  return user.memberships.find((m) => m.workspaceId === workspaceId) ?? null;
}

// ─── Permissions ─────────────────────────────────────────────

export interface PermissionCheck {
  action?: string;
  resourceType?: string;
  resourceId?: string;
}

/** can(user, action, resource, context) — true if allowed. */
export async function can(
  product: string,
  opts?: PermissionCheck,
): Promise<boolean> {
  const token = await requireToken();
  const res = await getAccountsClient().checkPermission(token, product, opts);
  return res.allowed;
}

/** requirePermission — throws AccountsError(PERMISSION_DENIED) if not allowed. */
export async function requirePermission(
  product: string,
  opts?: PermissionCheck,
): Promise<PermissionResult> {
  const token = await requireToken();
  const res = await getAccountsClient().checkPermission(token, product, opts);
  if (!res.allowed) throw new AccountsError("PERMISSION_DENIED");
  return res;
}

// ─── Products & context ──────────────────────────────────────

/** Products the current user/org may access. */
export async function listProducts(): Promise<ProductListResponse> {
  const token = await requireToken();
  return getAccountsClient().getProducts();
}

// ─── Active workspace context (§53/§54) ───────────────────────

const WORKSPACE_COOKIE = "mk-workspace";
const WORKSPACE_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Remember the last-used organization context. This is remembered state only
 * (§53) — it is NOT authorization. Authorization always comes from
 * requirePermission/can via the token.
 */
export async function setActiveWorkspace(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, WORKSPACE_COOKIE_OPTIONS);
}

/** Read the remembered organization context, or null. */
export async function getActiveWorkspace(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(WORKSPACE_COOKIE)?.value ?? null;
}
