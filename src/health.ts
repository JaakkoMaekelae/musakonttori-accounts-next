import { NextResponse } from "next/server.js";

/**
 * GET /api/health
 *
 * Built-in health check. Import and use in any service:
 *   export { GET } from "@musakonttori/accounts-next/health";
 *
 * Checks:
 *   - Service is running
 *   - DATABASE_URL is configured
 *   - Accounts API is reachable (if configured)
 */
export async function GET() {
  const checks: Record<string, string> = {
    runtime: "ok",
    database: process.env.DATABASE_URL || process.env.DIRECT_URL ? "configured" : "missing",
    accounts_api: process.env.ACCOUNTS_API_URL ? "configured" : "not set",
    service: process.env.ACCOUNTS_SERVICE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || "unknown",
  };

  const allOk = Object.values(checks).every((v) => v !== "missing");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
