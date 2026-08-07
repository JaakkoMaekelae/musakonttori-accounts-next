import { NextResponse } from "next/server";

/**
 * GET /api/version
 *
 * Returns service version info. Import and use:
 *   export { GET } from "@musakonttori/accounts-next/version";
 */
export async function GET() {
  return NextResponse.json({
    service: process.env.ACCOUNTS_SERVICE_NAME || "unknown",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
}
