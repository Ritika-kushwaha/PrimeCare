import { NextResponse } from "next/navigation";
import { getDb, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasEnv = !!process.env.DATABASE_URL;
  let connectionStatus = "NOT_ATTEMPTED";
  let tableCount = 0;
  let appointmentsInDb = 0;
  let errorMsg = null;

  try {
    const sql = getDb();
    if (!sql) {
      connectionStatus = "DATABASE_URL_MISSING_IN_ENV";
    } else {
      await initDb();
      const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
      tableCount = tables.length;
      
      const appts = await sql`SELECT COUNT(*) AS count FROM pc_appointments`;
      appointmentsInDb = Number(appts[0]?.count || 0);
      connectionStatus = "CONNECTED_SUCCESSFULLY";
    }
  } catch (err: any) {
    connectionStatus = "CONNECTION_FAILED";
    errorMsg = err.message;
  }

  return NextResponse.json({
    hasEnv,
    connectionStatus,
    tableCount,
    appointmentsInDb,
    error: errorMsg
  });
}
