const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN;
}

export function captureError(
  error: unknown,
  context?: { route?: string; userId?: string; tags?: Record<string, string> },
): void {
  if (!SENTRY_DSN) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const sentryKey = SENTRY_DSN.split("@")[0]?.split("//")[1] ?? "";

  void fetch(`https://sentry.io/api/${sentryKey}/store/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${sentryKey.split(":")[0]}`,
    },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: "error",
      platform: "javascript",
      message: { formatted: err.message },
      exception: {
        values: [
          {
            type: err.name,
            value: err.message,
            stacktrace: err.stack ? { frames: parseStack(err.stack) } : undefined,
          },
        ],
      },
      tags: {
        service: process.env.ACCOUNTS_SERVICE_NAME || "unknown",
        route: context?.route ?? "unknown",
        environment: process.env.NODE_ENV ?? "development",
        ...context?.tags,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      breadcrumbs: [{ message: context?.route ?? "api_error", timestamp: Date.now() / 1000 }],
    }),
  }).catch(() => {
    // Sentry unreachable — error is already in console (Vercel logs)
  });
}

function parseStack(stack: string): Array<{ filename?: string; function?: string; lineno?: number }> {
  return stack
    .split("\n")
    .slice(1)
    .map((line) => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
        line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (match) {
        return { function: match[1], filename: match[2], lineno: parseInt(match[3]) };
      }
      return {};
    })
    .filter((f) => f.filename);
}
