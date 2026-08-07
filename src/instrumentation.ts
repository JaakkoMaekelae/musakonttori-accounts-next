/**
 * Global error handler for API routes and server components.
 * Catches unhandled errors and logs them to:
 *   1. console.error → Vercel logs (always works, even if HQ is down)
 *   2. HQ aggregation endpoint (if ERROR_API_URL is set)
 *
 * Auto-registered when any module imports from @musakonttori/accounts-next.
 */
import { logError } from "./logger";

let registered = false;

export function registerGlobalErrorHandler(): void {
  if (registered) return;
  registered = true;

  process.on("unhandledRejection", (reason: unknown) => {
    logError(reason, { route: "unhandledRejection" });
  });

  process.on("uncaughtException", (error: Error) => {
    logError(error, { route: "uncaughtException" });
  });
}
