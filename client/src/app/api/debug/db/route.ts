import { NextResponse } from "next/navigation";
import { Client } from "pg";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({
      success: false,
      status: "ENV_VAR_MISSING",
      error: "DATABASE_URL is not defined in Vercel Environment Variables."
    }, { status: 200 });
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    
    // Auto-create appointments table
    await client.query(`
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
    `);

    const countRes = await client.query('SELECT COUNT(*) FROM pc_appointments');
    await client.end();

    return NextResponse.json({
      success: true,
      status: "CONNECTED_SUCCESSFULLY",
      serverTime: result.rows[0]?.current_time,
      database: result.rows[0]?.db_name,
      appointmentsInDb: Number(countRes.rows[0]?.count || 0)
    }, { status: 200 });
  } catch (err: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({
      success: false,
      status: "DATABASE_CONNECTION_ERROR",
      errorMessage: err.message,
      errorStack: err.stack
    }, { status: 200 });
  }
}
