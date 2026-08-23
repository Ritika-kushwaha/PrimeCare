import { Pool } from '@neondatabase/serverless';

export interface DoctorRecord {
  id: string;
  email: string;
  name: string;
  specialisation: string;
  qualification: string;
  experience: string;
  hospital: string;
  fee: string;
  rating?: string;
  bio: string;
}

export interface AppointmentRecord {
  id: string;
  tokenNumber?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  department?: string;
  fee?: string;
  hospital?: string;
  date?: string;
  timeSlot?: string;
  symptoms?: string;
  patientName?: string;
  patientEmail?: string;
  age?: string | number;
  gender?: string;
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'LEAVE_CANCELLED';
  finalizedAt?: string;
  leaveReason?: string;
}

export interface EHRRecord {
  patientKey: string;
  patientEmail: string;
  patientName: string;
  age: number | string;
  gender: string;
  visits: any[];
}

export interface LeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
}

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pc_doctors (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
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

      CREATE TABLE IF NOT EXISTS pc_ehr (
        patient_key VARCHAR(255) PRIMARY KEY,
        patient_email VARCHAR(255),
        patient_name VARCHAR(255),
        age VARCHAR(50),
        gender VARCHAR(50),
        visits JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    `);
  } catch (err) {
    console.error("Neon DB Init Error:", err);
  }
}
