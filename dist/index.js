"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AccountsClient: () => import_accounts_client2.AccountsClient,
  accountsMiddleware: () => accountsMiddleware,
  captureError: () => captureError,
  clearSession: () => clearSession,
  createAccountsClient: () => import_accounts_client2.createAccountsClient,
  generateCsrfToken: () => generateCsrfToken,
  getAccountsClient: () => getAccountsClient,
  getSession: () => getSession,
  healthHandler: () => GET,
  isSentryEnabled: () => isSentryEnabled,
  logError: () => logError,
  logWarning: () => logWarning,
  loginHandler: () => loginHandler,
  logoutHandler: () => logoutHandler,
  refreshHandler: () => refreshHandler,
  registerGlobalErrorHandler: () => registerGlobalErrorHandler,
  registerHandler: () => registerHandler,
  setSessionCookie: () => setSessionCookie,
  shouldRefreshToken: () => shouldRefreshToken,
  verifyCsrf: () => verifyCsrf,
  versionHandler: () => GET2,
  withErrorLogging: () => withErrorLogging
});
module.exports = __toCommonJS(src_exports);

// src/session.ts
var import_accounts_client = require("@musakonttori/accounts-client");
var import_headers = require("next/headers");

// src/sentry.ts
var SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
function isSentryEnabled() {
  return !!SENTRY_DSN;
}
function captureError(error, context) {
  if (!SENTRY_DSN) return;
  const err = error instanceof Error ? error : new Error(String(error));
  const sentryKey = SENTRY_DSN.split("@")[0]?.split("//")[1] ?? "";
  void fetch(`https://sentry.io/api/${sentryKey}/store/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${sentryKey.split(":")[0]}`
    },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: "error",
      platform: "javascript",
      message: { formatted: err.message },
      exception: {
        values: [
          {
            type: err.name,
            value: err.message,
            stacktrace: err.stack ? { frames: parseStack(err.stack) } : void 0
          }
        ]
      },
      tags: {
        service: process.env.ACCOUNTS_SERVICE_NAME || "unknown",
        route: context?.route ?? "unknown",
        environment: process.env.NODE_ENV ?? "development",
        ...context?.tags
      },
      user: context?.userId ? { id: context.userId } : void 0,
      release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      breadcrumbs: [{ message: context?.route ?? "api_error", timestamp: Date.now() / 1e3 }]
    })
  }).catch(() => {
  });
}
function parseStack(stack) {
  return stack.split("\n").slice(1).map((line) => {
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) || line.match(/at\s+(.+?):(\d+):(\d+)/);
    if (match) {
      return { function: match[1], filename: match[2], lineno: parseInt(match[3]) };
    }
    return {};
  }).filter((f) => f.filename);
}

// src/logger.ts
var SERVICE_NAME = process.env.ACCOUNTS_SERVICE_NAME || "unknown";
var HQ_ERROR_URL = process.env.ERROR_API_URL;
function sendToHq(payload) {
  if (!HQ_ERROR_URL) return;
  void fetch(`${HQ_ERROR_URL}/api/errors/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {
  });
}
function createPayload(error, context) {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : void 0,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: SERVICE_NAME,
    route: context?.route,
    userId: context?.userId
  };
}
function logError(error, context) {
  const payload = createPayload(error, context);
  console.error(
    `[${payload.service}]${payload.route ? ` ${payload.route}` : ""} ${payload.message}`,
    payload.stack ? `
${payload.stack}` : ""
  );
  sendToHq(payload);
  captureError(error, context);
}
function logWarning(message, context) {
  const payload = createPayload(new Error(message), context);
  console.warn(`[${payload.service}] ${message}`);
  sendToHq(payload);
}

// src/csrf.ts
var import_jose = require("jose");
var REFRESH_BUFFER_MS = 5 * 60 * 1e3;
var REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1e3;
function shouldRefreshToken(token) {
  try {
    const decoded = (0, import_jose.decodeJwt)(token);
    if (!decoded.exp || !decoded.iat) return true;
    const now = Date.now();
    const expiresAt = decoded.exp * 1e3;
    const issuedAt = decoded.iat * 1e3;
    if (now + REFRESH_BUFFER_MS >= expiresAt) return true;
    if (now - issuedAt > REFRESH_WINDOW_MS - REFRESH_BUFFER_MS) return true;
    return false;
  } catch {
    return true;
  }
}
function generateCsrfToken() {
  const token = crypto.randomUUID();
  return { token, cookieName: "mk-csrf" };
}
function verifyCsrf(cookieToken, requestToken) {
  if (!cookieToken || !requestToken) return false;
  return cookieToken === requestToken;
}

// src/instrumentation.ts
var registered = false;
function registerGlobalErrorHandler() {
  if (registered) return;
  registered = true;
  process.on("unhandledRejection", (reason) => {
    logError(reason, { route: "unhandledRejection" });
  });
  process.on("uncaughtException", (error) => {
    logError(error, { route: "uncaughtException" });
  });
}

// src/session.ts
registerGlobalErrorHandler();
var _accounts = null;
function getAccounts() {
  if (!_accounts) {
    _accounts = (0, import_accounts_client.createAccountsClient)({
      apiUrl: process.env.ACCOUNTS_API_URL,
      serviceName: process.env.ACCOUNTS_SERVICE_NAME,
      privateKey: process.env.SERVICE_JWT_PRIVATE_KEY
    });
  }
  return _accounts;
}
var COOKIE_NAME = "mk-session";
var COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7
  // 7 days (cookie lives longer than token; refresh extends)
};
async function getSession() {
  const cookieStore = await (0, import_headers.cookies)();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const accounts = getAccounts();
  try {
    if (shouldRefreshToken(token)) {
      try {
        const { token: newToken } = await accounts.refreshToken(token);
        cookieStore.set(COOKIE_NAME, newToken, COOKIE_OPTIONS);
        const user2 = await accounts.getMe(newToken);
        return { user: { id: user2.id, email: user2.email, name: user2.name } };
      } catch {
      }
    }
    const user = await accounts.getMe(token);
    return { user: { id: user.id, email: user.email, name: user.name } };
  } catch (err) {
    logError(err, { route: "getSession" });
    try {
      cookieStore.delete(COOKIE_NAME);
    } catch {
    }
    return null;
  }
}
async function setSessionCookie(token, opts) {
  const cookieStore = await (0, import_headers.cookies)();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  if (opts?.setCsrf) {
    const csrfToken = crypto.randomUUID();
    cookieStore.set("mk-csrf", csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      // readable by client JS for form submission
      maxAge: 60 * 60 * 24
    });
  }
}
async function clearSession() {
  const cookieStore = await (0, import_headers.cookies)();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete("mk-csrf");
}
function getAccountsClient() {
  return getAccounts();
}

// src/handlers.ts
var import_server = require("next/server");
async function loginHandler(req) {
  const csrfCookie = req.headers.get("cookie")?.match(/mk-csrf=([^;]+)/)?.[1];
  const csrfHeader = req.headers.get("x-csrf-token");
  if (csrfCookie && csrfHeader && !verifyCsrf(csrfCookie, csrfHeader)) {
    return import_server.NextResponse.json(
      { error: "CSRF-tarkistus ep\xE4onnistui" },
      { status: 403 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) {
    return import_server.NextResponse.json(
      { error: "S\xE4hk\xF6posti ja salasana vaaditaan" },
      { status: 400 }
    );
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.login({ email, password });
    const response = import_server.NextResponse.json({ user: result.user });
    response.cookies.set("mk-session", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    const { token: newCsrf } = generateCsrfToken();
    response.cookies.set("mk-csrf", newCsrf, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kirjautuminen ep\xE4onnistui";
    return import_server.NextResponse.json({ error: message }, { status: 401 });
  }
}
async function registerHandler(req) {
  const body = await req.json().catch(() => ({}));
  if (!body.email || !body.password) {
    return import_server.NextResponse.json(
      { error: "S\xE4hk\xF6posti ja salasana vaaditaan" },
      { status: 400 }
    );
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.register(body);
    const response = import_server.NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set("mk-session", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    const { token: newCsrf } = generateCsrfToken();
    response.cookies.set("mk-csrf", newCsrf, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rekister\xF6ityminen ep\xE4onnistui";
    return import_server.NextResponse.json({ error: message }, { status: 400 });
  }
}
async function refreshHandler(req) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = cookieHeader.match(/mk-session=([^;]+)/)?.[1];
  if (!token) {
    return import_server.NextResponse.json({ error: "Ei sessiota" }, { status: 401 });
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.refreshToken(token);
    const response = import_server.NextResponse.json({ token: result.token });
    response.cookies.set("mk-session", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tokenin p\xE4ivitys ep\xE4onnistui";
    return import_server.NextResponse.json({ error: message }, { status: 401 });
  }
}
async function logoutHandler() {
  const response = import_server.NextResponse.json({ success: true });
  response.cookies.set("mk-session", "", { maxAge: 0, path: "/" });
  response.cookies.set("mk-csrf", "", { maxAge: 0, path: "/" });
  return response;
}

// src/proxy.ts
var import_server2 = require("next/server");
var COOKIE_NAME2 = "mk-session";
function accountsMiddleware(opts = {}) {
  const {
    publicRoutes = [],
    protectedRoutes = [],
    csrfProtection = true
  } = opts;
  const defaultPublic = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/refresh"
  ];
  const allPublic = [...defaultPublic, ...publicRoutes];
  return async function proxy(request) {
    const { pathname } = request.nextUrl;
    const response = import_server2.NextResponse.next({ request });
    if (csrfProtection && request.method === "POST" && allPublic.some((r) => pathname === r || pathname.startsWith(r))) {
      if (pathname.includes("/login") || pathname.includes("/register")) {
        const cookieToken = request.cookies.get("mk-csrf")?.value;
        const headerToken = request.headers.get("x-csrf-token");
        if (cookieToken && headerToken && !verifyCsrf(cookieToken, headerToken)) {
          return import_server2.NextResponse.json(
            { error: "CSRF-tarkistus ep\xE4onnistui" },
            { status: 403 }
          );
        }
      }
    }
    const token = request.cookies.get(COOKIE_NAME2)?.value;
    if (token && shouldRefreshToken(token)) {
      try {
        const accountsUrl = process.env.ACCOUNTS_API_URL;
        if (accountsUrl) {
          const refreshRes = await fetch(`${accountsUrl}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });
          if (refreshRes.ok) {
            const { token: newToken } = await refreshRes.json();
            response.cookies.set(COOKIE_NAME2, newToken, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7
            });
          }
        }
      } catch {
      }
    }
    const isProtected = protectedRoutes.some(
      (r) => pathname === r || pathname.startsWith(r)
    );
    if (isProtected && !token) {
      const signInUrl = new URL("/kirjaudu", request.url);
      signInUrl.searchParams.set("next", pathname);
      return import_server2.NextResponse.redirect(signInUrl);
    }
    if (request.method === "GET" && (pathname.includes("/kirjaudu") || pathname.includes("/sign-in"))) {
      const { token: csrfToken } = generateCsrfToken();
      response.cookies.set("mk-csrf", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24
      });
    }
    return response;
  };
}

// src/index.ts
var import_accounts_client2 = require("@musakonttori/accounts-client");

// src/wrapper.ts
var import_server3 = require("next/server");
function withErrorLogging(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err) {
      const url = new URL(req.url);
      logError(err, {
        route: `${req.method} ${url.pathname}`,
        userId: req.headers.get("x-user-id") ?? void 0
      });
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message.includes("not found") || message.includes("NotFound") ? 404 : message.includes("unauthorized") || message.includes("forbidden") || message.includes("Unauthorized") ? 403 : message.includes("validation") || message.includes("invalid") || message.includes("required") ? 400 : 500;
      return import_server3.NextResponse.json(
        {
          error: message,
          ...process.env.NODE_ENV !== "production" && err instanceof Error ? { stack: err.stack } : {}
        },
        { status }
      );
    }
  };
}

// src/health.ts
var import_server4 = require("next/server");
async function GET() {
  const checks = {
    runtime: "ok",
    database: process.env.DATABASE_URL || process.env.DIRECT_URL ? "configured" : "missing",
    accounts_api: process.env.ACCOUNTS_API_URL ? "configured" : "not set",
    service: process.env.ACCOUNTS_SERVICE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || "unknown"
  };
  const allOk = Object.values(checks).every((v) => v !== "missing");
  return import_server4.NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      checks
    },
    { status: allOk ? 200 : 503 }
  );
}

// src/version.ts
var import_server5 = require("next/server");
async function GET2() {
  return import_server5.NextResponse.json({
    service: process.env.ACCOUNTS_SERVICE_NAME || "unknown",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountsClient,
  accountsMiddleware,
  captureError,
  clearSession,
  createAccountsClient,
  generateCsrfToken,
  getAccountsClient,
  getSession,
  healthHandler,
  isSentryEnabled,
  logError,
  logWarning,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerGlobalErrorHandler,
  registerHandler,
  setSessionCookie,
  shouldRefreshToken,
  verifyCsrf,
  versionHandler,
  withErrorLogging
});
//# sourceMappingURL=index.js.map