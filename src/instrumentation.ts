/**
 * Global error handler for API routes and server components.
 * Catches unhandled errors and logs them to console + HQ.
 *
 * Call this once in your app's instrumentation.ts or layout.tsx:
 *   import { registerGlobalErrorHandler } from "@musakonttori/accounts-next";
 *   registerGlobalErrorHandler();
 */
import { logError } from "./logger";

let registered = false;

export function registerGlobalErrorHandler(): void {
  if (registered) return;
  registered = true;

  // Catch unhandled promise rejections (async route handlers)
  process.on("unhandledRejection", (reason: unknown) => {
    logError(reason, { route: "unhandledRejection" });
  });

  // Catch uncaught exceptions (sync errors)
  process.on("uncaughtException", (error: Error) => {
    logError(error, { route: "uncaughtException" });
    // Don't exit — let the process continue for other requests
  });
}
