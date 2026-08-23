import { neon } from '@neondatabase/serverless';

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

let isInitPromise: Promise<void> | null = null;

export async function initDb(): Promise<void> {
  const sql = getDb();
  if (!sql) return;

  if (!isInitPromise) {
    isInitPromise = (async () => {
      try {
        await sql`
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
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS pc_doctors (
            id VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255),
            name VARCHAR(255) NOT NULL,
            specialisation VARCHAR(255),
            qualification VARCHAR(255),
            experience VARCHAR(255),
            hospital VARCHAR(255),
            fee VARCHAR(50),
            rating VARCHAR(50),
            bio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS pc_leaves (
            id VARCHAR(255) PRIMARY KEY,
            doctor_id VARCHAR(255),
            doctor_name VARCHAR(255),
            specialisation VARCHAR(255),
            leave_date VARCHAR(50),
            reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
      } catch (e) {
        console.error("Database schema init error:", e);
      }
    })();
  }
  return isInitPromise;
}
