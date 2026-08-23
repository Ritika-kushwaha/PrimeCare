import { NextResponse } from "next/navigation";
import { queryNeon, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  let maskedUrl = "NONE";
  if (dbUrl) {
    try {
      maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    } catch {}
  }

  let dbConnectionResult = "NOT_TESTED";
  let appointmentsInDb = 0;
  let tables: string[] = [];

  if (dbUrl) {
    try {
      await initDb();
      const tableRows = await queryNeon(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
      tables = tableRows.map((t: any) => t.table_name);

      const countRows = await queryNeon(`SELECT COUNT(*) AS count FROM pc_appointments`);
      appointmentsInDb = Number(countRows[0]?.count || 0);

      dbConnectionResult = "CONNECTED_SUCCESSFULLY";
    } catch (err: any) {
      dbConnectionResult = "QUERY_FAILED: " + (err?.message || String(err));
    }
  } else {
    dbConnectionResult = "DATABASE_URL_MISSING_IN_ENV";
  }

  return NextResponse.json({
    status: "OK",
    hasDatabaseUrl: Boolean(dbUrl),
    databaseUrlMasked: maskedUrl,
    dbConnectionResult,
    appointmentsInDb,
    tables
  });
}
