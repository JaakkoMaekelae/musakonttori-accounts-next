import { NextResponse, type NextRequest } from "next/server";
import { shouldRefreshToken, generateCsrfToken, verifyCsrf } from "./csrf";

const COOKIE_NAME = "mk-session";

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
export function accountsMiddleware(opts: AccountsMiddlewareOptions = {}) {
  const {
    publicRoutes = [],
    protectedRoutes = [],
    csrfProtection = true,
  } = opts;

  const defaultPublic = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/refresh",
  ];

  const allPublic = [...defaultPublic, ...publicRoutes];

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next({ request });

    // CSRF protection for login endpoints
    if (
      csrfProtection &&
      request.method === "POST" &&
      allPublic.some((r) => pathname === r || pathname.startsWith(r))
    ) {
      // For login, verify CSRF
      if (pathname.includes("/login") || pathname.includes("/register")) {
        const cookieToken = request.cookies.get("mk-csrf")?.value;
        const headerToken = request.headers.get("x-csrf-token");
        if (cookieToken && headerToken && !verifyCsrf(cookieToken, headerToken)) {
          return NextResponse.json(
            { error: "CSRF-tarkistus epäonnistui" },
            { status: 403 },
          );
        }
      }
    }

    // Token refresh: check if token is close to expiry and refresh proactively
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token && shouldRefreshToken(token)) {
      try {
        const accountsUrl = process.env.ACCOUNTS_API_URL;
        if (accountsUrl) {
          const refreshRes = await fetch(`${accountsUrl}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (refreshRes.ok) {
            const { token: newToken } = await refreshRes.json();
            response.cookies.set(COOKIE_NAME, newToken, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });
          }
        }
      } catch {
        // Refresh failed silently — token will be checked by getSession()
      }
    }

    // Protected routes: redirect unauthenticated users
    const isProtected = protectedRoutes.some(
      (r) => pathname === r || pathname.startsWith(r),
    );

    if (isProtected && !token) {
      const signInUrl = new URL("/kirjaudu", request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Set CSRF cookie on GET requests to login pages (so client can read it)
    if (
      request.method === "GET" &&
      (pathname.includes("/kirjaudu") || pathname.includes("/sign-in"))
    ) {
      const { token: csrfToken } = generateCsrfToken();
      response.cookies.set("mk-csrf", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
