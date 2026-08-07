const SERVICE_NAME = process.env.ACCOUNTS_SERVICE_NAME || "unknown";
const HQ_ERROR_URL = process.env.ERROR_API_URL;

/**
 * Send error to HQ aggregation endpoint.
 * Non-blocking — failure is silent so the local log always works.
 */
function sendToHq(payload: Record<string, unknown>): void {
  if (!HQ_ERROR_URL) return;
  void fetch(`${HQ_ERROR_URL}/api/errors/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // HQ unreachable — error is already in console (Vercel logs)
  });
}

function createPayload(error: unknown, context?: { route?: string; userId?: string }) {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    route: context?.route,
    userId: context?.userId,
  };
}

/**
 * Log an error. Writes to:
 *   1. console.error → Vercel logs (permanent, searchable)
 *   2. HQ /api/errors/ingest → centralized dashboard (fire-and-forget)
 *
 * Never throws. Safe to call anywhere.
 */
export function logError(error: unknown, context?: { route?: string; userId?: string }): void {
  const payload = createPayload(error, context);

  // Primary: console (Vercel logs persist even if HQ is unreachable)
  console.error(
    `[${payload.service}]${payload.route ? ` ${payload.route}` : ""} ${payload.message}`,
    payload.stack ? `\n${payload.stack}` : "",
  );

  // Secondary: HQ aggregation (best-effort)
  sendToHq(payload);
}

/**
 * Log a warning. Non-blocking.
 */
export function logWarning(message: string, context?: { route?: string }): void {
  const payload = createPayload(new Error(message), context);
  console.warn(`[${payload.service}] ${message}`);
  sendToHq(payload);
}
