import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  let maskedUrl = "NONE";
  let host = "NONE";
  let user = "NONE";
  let database = "NONE";

  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      host = parsed.host;
      user = parsed.username;
      database = parsed.pathname.replace(/^\//, '');
      maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    } catch (e: any) {
      maskedUrl = "INVALID_URL_FORMAT: " + e.message;
    }
  }

  // Test Neon HTTP query endpoint
  let httpQueryResult = "NOT_ATTEMPTED";
  let appointmentsCount = 0;
  let tables: string[] = [];

  if (dbUrl && host !== "NONE") {
    try {
      const endpoint = `https://${host}/sql`;
      const parsed = new URL(dbUrl);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsed.password}`,
          'Neon-Connection-String': dbUrl,
        },
        body: JSON.stringify({ 
          query: `
            CREATE TABLE IF NOT EXISTS pc_appointments (
              id VARCHAR(255) PRIMARY KEY,
              token_number VARCHAR(100),
              doctor_id VARCHAR(255),
              doctor_name VARCHAR(255),
              doctor_email VARCHAR(255),
              department VARCHAR(255),
              fee VARCHAR(50),
              hospital VARCHAR(255),
              date VARCHAR(50),
              time_slot VARCHAR(50),
              symptoms TEXT,
              patient_name VARCHAR(255),
              patient_email VARCHAR(255),
              age VARCHAR(50),
              gender VARCHAR(50),
              status VARCHAR(50) DEFAULT 'CONFIRMED',
              finalized_at VARCHAR(100),
              leave_reason TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            SELECT COUNT(*) AS count FROM pc_appointments;
          ` 
        }),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        httpQueryResult = "SUCCESS_CONNECTED_TO_NEON";
        if (Array.isArray(data)) {
          const countRow = data[data.length - 1];
          appointmentsCount = Number(countRow?.rows?.[0]?.count || 0);
        } else if (data?.rows) {
          appointmentsCount = Number(data.rows[0]?.count || 0);
        }
      } else {
        const errText = await res.text();
        httpQueryResult = `NEON_HTTP_FAILED (${res.status}): ${errText}`;
      }
    } catch (err: any) {
      httpQueryResult = "FETCH_EXCEPTION: " + err.message;
    }
  }

  return NextResponse.json({
    status: "DIAGNOSTIC_READY",
    hasDatabaseUrl: Boolean(dbUrl),
    databaseUrlMasked: maskedUrl,
    host,
    user,
    database,
    httpQueryResult,
    appointmentsCount
  });
}
