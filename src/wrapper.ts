import { NextResponse } from "next/server";
import { logError } from "./logger";

type RouteHandler = (req: Request, context?: unknown) => Promise<NextResponse>;

/**
 * Wrap a route handler with automatic error logging.
 * Catches all errors, logs them to console + HQ, returns a clean error response.
 *
 * Usage:
 *   export const GET = withErrorLogging(async (req) => { ... });
 *   export const POST = withErrorLogging(async (req) => { ... });
 */
export function withErrorLogging(handler: RouteHandler): RouteHandler {
  return async (req: Request, context?: unknown) => {
    try {
      return await handler(req, context);
    } catch (err) {
      const url = new URL(req.url);
      logError(err, {
        route: `${req.method} ${url.pathname}`,
        userId: req.headers.get("x-user-id") ?? undefined,
      });

      const message = err instanceof Error ? err.message : "Internal server error";
      const status =
        message.includes("not found") || message.includes("NotFound")
          ? 404
          : message.includes("unauthorized") || message.includes("forbidden") || message.includes("Unauthorized")
            ? 403
            : message.includes("validation") || message.includes("invalid") || message.includes("required")
              ? 400
              : 500;

      return NextResponse.json(
        {
          error: message,
          ...(process.env.NODE_ENV !== "production" && err instanceof Error
            ? { stack: err.stack }
            : {}),
        },
        { status },
      );
    }
  };
}
