import { NextResponse } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  let maskedUrl = "NONE";
  if (dbUrl) {
    maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
  }

  let dbConnectionResult = "NOT_TESTED";
  let errorMessage: string | null = null;
  let dbTables: string[] = [];

  if (dbUrl) {
    try {
      // Dynamic import inside try-catch to avoid bundle-level boot crashes
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);
      const rows = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      dbTables = rows.map((r: any) => r.table_name);
      dbConnectionResult = "CONNECTED_SUCCESSFULLY";
    } catch (err: any) {
      dbConnectionResult = "QUERY_FAILED";
      errorMessage = err?.message || String(err);
    }
  } else {
    dbConnectionResult = "DATABASE_URL_MISSING_IN_ENV";
  }

  return NextResponse.json({
    status: "OK",
    nodeVersion: process.version,
    hasDatabaseUrl: Boolean(dbUrl),
    databaseUrlMasked: maskedUrl,
    dbConnectionResult,
    dbTables,
    errorMessage
  });
}
