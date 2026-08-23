import { NextResponse } from "next/navigation";
import { neon } from "@neondatabase/serverless";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({
      status: "ENV_VAR_MISSING",
      message: "DATABASE_URL is not set in process.env",
      hint: "Add DATABASE_URL to Vercel Project Settings -> Environment Variables and redeploy."
    });
  }

  // Masked URL to verify presence without exposing credentials
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const sql = neon(dbUrl);
    
    // Quick test query
    const timeResult = await sql`SELECT NOW() as current_time`;
    
    // Check tables
    const tableResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({
      status: "CONNECTED_SUCCESSFULLY",
      databaseUrlConfigured: maskedUrl,
      serverTime: timeResult[0]?.current_time,
      tables: tableResult.map((t: any) => t.table_name)
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "CONNECTION_FAILED",
      databaseUrlConfigured: maskedUrl,
      errorName: err.name,
      errorMessage: err.message,
      hint: "Verify that your Neon project is active and that your connection string includes sslmode=require."
    }, { status: 200 }); // Return 200 so you can read the JSON error in the browser
  }
}
