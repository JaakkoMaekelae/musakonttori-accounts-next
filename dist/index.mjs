var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/@musakonttori+accounts-client@https+++codeload.github.com+JaakkoMaekelae+musakonttori-a_0467c0b47a7c33f173d1376fb93c30f5/node_modules/@musakonttori/accounts-client/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/@musakonttori+accounts-client@https+++codeload.github.com+JaakkoMaekelae+musakonttori-a_0467c0b47a7c33f173d1376fb93c30f5/node_modules/@musakonttori/accounts-client/dist/index.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export(src_exports, {
      AccountsClient: () => AccountsClient2,
      createAccountsClient: () => createAccountsClient3
    });
    module.exports = __toCommonJS(src_exports);
    var import_jose2 = __require("jose");
    var import_jose22 = __require("jose");
    var ACCOUNTS_ISSUER = "accounts.musakonttori.fi";
    var SERVICE_EXPIRY = "5m";
    async function importKey(pem) {
      return (0, import_jose22.importPKCS8)(pem, "RS256");
    }
    var AccountsClient2 = class {
      apiUrl;
      serviceName;
      privateKey;
      _keyPromise = null;
      constructor(config) {
        this.apiUrl = config.apiUrl.replace(/\/$/, "");
        this.serviceName = config.serviceName;
        this.privateKey = config.privateKey;
      }
      async getKey() {
        if (!this._keyPromise) {
          this._keyPromise = importKey(this.privateKey);
        }
        return this._keyPromise;
      }
      async createServiceToken() {
        const key = await this.getKey();
        return new import_jose2.SignJWT({ sub: this.serviceName }).setProtectedHeader({ alg: "RS256" }).setIssuedAt().setExpirationTime(SERVICE_EXPIRY).setIssuer(this.serviceName).setAudience(ACCOUNTS_ISSUER).sign(key);
      }
      async headers(userToken) {
        const serviceToken = await this.createServiceToken();
        return {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceToken}`,
          "X-User-Token": `Bearer ${userToken}`
        };
      }
      async request(path, options) {
        const { userToken, ...init } = options;
        const headers = {
          "Content-Type": "application/json",
          ...init.headers
        };
        if (userToken) {
          const serviceToken = await this.createServiceToken();
          headers["Authorization"] = `Bearer ${serviceToken}`;
          headers["X-User-Token"] = `Bearer ${userToken}`;
        }
        const res = await fetch(`${this.apiUrl}${path}`, { ...init, headers });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            `Accounts API error ${res.status}: ${body.error ?? res.statusText}`
          );
        }
        return res.json();
      }
      async login(input) {
        return this.request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(input)
        });
      }
      async register(input) {
        return this.request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(input)
        });
      }
      async refreshToken(userToken) {
        return this.request("/api/auth/refresh", {
          method: "POST",
          userToken,
          body: JSON.stringify({})
        });
      }
      async getMe(userToken) {
        return this.request("/api/me", {
          userToken
        });
      }
      async getWorkspaces(userToken) {
        return this.request("/api/me/workspaces", {
          userToken
        });
      }
      async checkPermission(userToken, product, opts) {
        return this.request("/api/permissions/check", {
          method: "POST",
          userToken,
          body: JSON.stringify({ product, ...opts })
        });
      }
      async listPermissions(userToken, product) {
        return this.request("/api/permissions/list", {
          method: "POST",
          userToken,
          body: JSON.stringify({ product })
        });
      }
      async getWorkspaceMembers(userToken, workspaceId) {
        return this.request(`/api/workspaces/${workspaceId}/members`, {
          userToken
        });
      }
      async createWorkspace(userToken, input) {
        return this.request("/api/workspaces", {
          method: "POST",
          userToken,
          body: JSON.stringify(input)
        });
      }
      async updateWorkspace(userToken, slug, input) {
        return this.request(`/api/workspaces/${slug}`, {
          method: "PATCH",
          userToken,
          body: JSON.stringify(input)
        });
      }
      async inviteToWorkspace(userToken, slug, input) {
        return this.request(`/api/workspaces/${slug}/invitations`, {
          method: "POST",
          userToken,
          body: JSON.stringify(input)
        });
      }
    };
    function createAccountsClient3(config) {
      return new AccountsClient2(config);
    }
  }
});

// src/session.ts
var import_accounts_client = __toESM(require_dist());
import { cookies } from "next/headers";

// src/csrf.ts
import { decodeJwt } from "jose";
var REFRESH_BUFFER_MS = 5 * 60 * 1e3;
var REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1e3;
function shouldRefreshToken(token) {
  try {
    const decoded = decodeJwt(token);
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
  return crypto.subtle ? cookieToken === requestToken : cookieToken === requestToken;
}

// src/session.ts
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
  const cookieStore = await cookies();
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
  } catch {
    try {
      cookieStore.delete(COOKIE_NAME);
    } catch {
    }
    return null;
  }
}
async function setSessionCookie(token, opts) {
  const cookieStore = await cookies();
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
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete("mk-csrf");
}
function getAccountsClient() {
  return getAccounts();
}

// src/handlers.ts
import { NextResponse } from "next/server";
async function loginHandler(req) {
  const csrfCookie = req.headers.get("cookie")?.match(/mk-csrf=([^;]+)/)?.[1];
  const csrfHeader = req.headers.get("x-csrf-token");
  if (csrfCookie && csrfHeader && !verifyCsrf(csrfCookie, csrfHeader)) {
    return NextResponse.json(
      { error: "CSRF-tarkistus ep\xE4onnistui" },
      { status: 403 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "S\xE4hk\xF6posti ja salasana vaaditaan" },
      { status: 400 }
    );
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.login({ email, password });
    const response = NextResponse.json({ user: result.user });
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
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
async function registerHandler(req) {
  const body = await req.json().catch(() => ({}));
  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "S\xE4hk\xF6posti ja salasana vaaditaan" },
      { status: 400 }
    );
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.register(body);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
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
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
async function refreshHandler(req) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = cookieHeader.match(/mk-session=([^;]+)/)?.[1];
  if (!token) {
    return NextResponse.json({ error: "Ei sessiota" }, { status: 401 });
  }
  try {
    const accounts = getAccountsClient();
    const result = await accounts.refreshToken(token);
    const response = NextResponse.json({ token: result.token });
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
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
async function logoutHandler() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("mk-session", "", { maxAge: 0, path: "/" });
  response.cookies.set("mk-csrf", "", { maxAge: 0, path: "/" });
  return response;
}

// src/middleware.ts
import { NextResponse as NextResponse2 } from "next/server";
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
  return async function middleware(request) {
    const { pathname } = request.nextUrl;
    const response = NextResponse2.next({ request });
    if (csrfProtection && request.method === "POST" && allPublic.some((r) => pathname === r || pathname.startsWith(r))) {
      if (pathname.includes("/login") || pathname.includes("/register")) {
        const cookieToken = request.cookies.get("mk-csrf")?.value;
        const headerToken = request.headers.get("x-csrf-token");
        if (cookieToken && headerToken && !verifyCsrf(cookieToken, headerToken)) {
          return NextResponse2.json(
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
      return NextResponse2.redirect(signInUrl);
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
var import_accounts_client2 = __toESM(require_dist());
var export_AccountsClient = import_accounts_client2.AccountsClient;
var export_createAccountsClient = import_accounts_client2.createAccountsClient;
export {
  export_AccountsClient as AccountsClient,
  accountsMiddleware,
  clearSession,
  export_createAccountsClient as createAccountsClient,
  generateCsrfToken,
  getAccountsClient,
  getSession,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  setSessionCookie,
  shouldRefreshToken,
  verifyCsrf
};
//# sourceMappingURL=index.mjs.map