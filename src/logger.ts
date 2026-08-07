const SERVICE_NAME = process.env.ACCOUNTS_SERVICE_NAME || "unknown";
const HQ_ERROR_URL = process.env.ERROR_API_URL;

function sendToHq(payload: Record<string, unknown>): void {
  if (!HQ_ERROR_URL) return;
  void fetch(`${HQ_ERROR_URL}/api/errors/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function logError(error: unknown, context?: { route?: string; userId?: string }): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    route: context?.route,
    userId: context?.userId,
  };
  console.error(`[${payload.service}] ${payload.message}`, payload.stack ? `\n${payload.stack}` : "");
  sendToHq(payload);
}

export function logWarning(message: string, context?: { route?: string }): void {
  const payload = {
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    route: context?.route,
  };
  console.warn(`[${payload.service}] ${message}`);
  sendToHq(payload);
}
