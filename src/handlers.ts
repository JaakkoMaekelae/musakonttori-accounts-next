import { NextResponse } from "next/server.js";
import type { LoginInput, RegisterInput } from "@musakonttori/accounts-client";
import { getAccountsClient, setSessionCookie, clearSession } from "./session";
import { generateCsrfToken, verifyCsrf } from "./csrf";

/**
 * Login POST handler.
 * Body: { email: string, password: string }
 * Sets mk-session cookie on success.
 * Returns { user: { id, name, email } }
 */
export async function loginHandler(req: Request): Promise<NextResponse> {
  // CSRF check
  const csrfCookie = req.headers
    .get("cookie")
    ?.match(/mk-csrf=([^;]+)/)?.[1];
  const csrfHeader = req.headers.get("x-csrf-token");
  if (csrfCookie && csrfHeader && !verifyCsrf(csrfCookie, csrfHeader)) {
    return NextResponse.json(
      { error: "CSRF-tarkistus epäonnistui" },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as LoginInput;
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Sähköposti ja salasana vaaditaan" },
      { status: 400 },
    );
  }

  try {
    const accounts = getAccountsClient();
    const result = await accounts.login({ email, password });

    const response = NextResponse.json({ user: result.user });

    // Set session cookie
    response.cookies.set("mk-session", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Rotate CSRF token after login
    const { token: newCsrf } = generateCsrfToken();
    response.cookies.set("mk-csrf", newCsrf, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kirjautuminen epäonnistui";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * Register POST handler.
 * Body: { email: string, password: string, name?: string }
 * Sets mk-session cookie on success.
 */
export async function registerHandler(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => ({}))) as RegisterInput;

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Sähköposti ja salasana vaaditaan" },
      { status: 400 },
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
      maxAge: 60 * 60 * 24 * 7,
    });

    const { token: newCsrf } = generateCsrfToken();
    response.cookies.set("mk-csrf", newCsrf, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Rekisteröityminen epäonnistui";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * Refresh POST handler.
 * Body: none (reads token from cookie)
 * Returns { token: string }
 */
export async function refreshHandler(req: Request): Promise<NextResponse> {
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Tokenin päivitys epäonnistui";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * Logout handler (GET or POST).
 * Clears mk-session cookie.
 */
export async function logoutHandler(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set("mk-session", "", { maxAge: 0, path: "/" });
  response.cookies.set("mk-csrf", "", { maxAge: 0, path: "/" });
  return response;
}
