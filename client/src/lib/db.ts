import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export function getDb() {
  return getDbPool();
}

let isInit = false;

export async function initDb(): Promise<void> {
  if (isInit) return;
  const p = getDbPool();
  if (!p) return;

  try {
    await p.query(`
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

      CREATE TABLE IF NOT EXISTS pc_doctor_applications (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        reg_number VARCHAR(255),
        specialisation VARCHAR(255),
        qualification VARCHAR(255),
        experience VARCHAR(255),
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pc_leaves (
        id VARCHAR(255) PRIMARY KEY,
        doctor_id VARCHAR(255),
        doctor_name VARCHAR(255),
        specialisation VARCHAR(255),
        leave_date VARCHAR(50),
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pc_ehr (
        patient_key VARCHAR(255) PRIMARY KEY,
        patient_email VARCHAR(255),
        patient_name VARCHAR(255),
        age VARCHAR(50),
        gender VARCHAR(50),
        visits JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isInit = true;
  } catch (err) {
    console.error("Database schema init error:", err);
  }
}
