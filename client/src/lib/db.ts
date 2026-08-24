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
        working_hours_start VARCHAR(50) DEFAULT '09:00',
        working_hours_end VARCHAR(50) DEFAULT '17:00',
        slot_duration_min INT DEFAULT 30,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE pc_doctors ADD COLUMN IF NOT EXISTS working_hours_start VARCHAR(50) DEFAULT '09:00';
      ALTER TABLE pc_doctors ADD COLUMN IF NOT EXISTS working_hours_end VARCHAR(50) DEFAULT '17:00';
      ALTER TABLE pc_doctors ADD COLUMN IF NOT EXISTS slot_duration_min INT DEFAULT 30;

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

    // Auto-seed default doctors into pc_doctors if not present
    try {
      await p.query(`
        INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio, working_hours_start, working_hours_end, slot_duration_min)
        VALUES 
          ('doc-cardio-01', 'ritikakushwaha62@gmail.com', 'Dr. Ritika Kushwaha', 'Cardiology', 'MBBS, MD, DM (Cardiology)', '12 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,200', '5.0 ★', 'Senior Consultant Cardiologist specialising in interventional cardiology and cardiac triage.', '09:00', '17:00', 30),
          ('doc-cardio-02', 'aarav.sharma@primecare.in', 'Dr. Aarav Sharma', 'Cardiology', 'MBBS, MD (Cardiology)', '10 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,000', '4.9 ★', 'Consultant Cardiologist specialising in preventative care.', '09:00', '17:00', 30),
          ('doc-cardio-03', 'meera.kulkarni@primecare.in', 'Dr. Meera Kulkarni', 'Cardiology', 'MBBS, DNB (Cardiology)', '8 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹950', '4.8 ★', 'Specialist in non-invasive cardiology and echocardiography.', '09:00', '17:00', 30),
          ('doc-neuro-01', 'priya.nair@primecare.in', 'Dr. Priya Nair', 'Neurology', 'MBBS, DM (Neurology)', '11 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,500', '4.9 ★', 'Senior Neurologist specialising in stroke care and neuromuscular disorders.', '09:00', '17:00', 30),
          ('doc-ortho-01', 'vikram.patel@primecare.in', 'Dr. Vikram Patel', 'Orthopedics', 'MBBS, MS (Orthopedics)', '14 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,100', '4.9 ★', 'Orthopedic surgeon specializing in joint replacements and sports trauma.', '09:00', '17:00', 30),
          ('doc-peds-01', 'ananya.deshmukh@primecare.in', 'Dr. Ananya Deshmukh', 'Pediatrics', 'MBBS, MD (Pediatrics)', '9 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹900', '4.9 ★', 'Pediatric specialist focused on child growth, immunizations, and developmental care.', '09:00', '17:00', 30),
          ('doc-derma-01', 'rohan.mehta@primecare.in', 'Dr. Rohan Mehta', 'Dermatology', 'MBBS, MD (Dermatology)', '7 Years Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,000', '4.8 ★', 'Consultant Dermatologist specializing in clinical dermatology and laser treatments.', '09:00', '17:00', 30)
        ON CONFLICT (id) DO NOTHING;
      `);
    } catch {}

    isInit = true;
  } catch (err) {
    console.error("Database schema init error:", err);
  }
}
