import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_DOCTORS = [
  { id: 'doc-cardio-01', email: 'ritikakushwaha62@gmail.com', name: 'Dr. Ritika Kushwaha', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS Delhi)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, diagnostic angiographies, coronary interventions, and comprehensive lipid management.' },
  { id: 'doc-cardio-02', email: 'aarav.sharma@primecare.in', name: 'Dr. Aarav Sharma', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS)', experience: '12 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease.' },
  { id: 'doc-cardio-03', email: 'meera.kulkarni@primecare.in', name: 'Dr. Meera Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400', rating: '4.8 ★', bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, and heart rhythm management.' },
  { id: 'doc-neuro-01', email: 'priya.nair@primecare.in', name: 'Dr. Priya Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500', rating: '4.9 ★', bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, and acute stroke treatment.' },
  { id: 'doc-ortho-01', email: 'vikram.patel@primecare.in', name: 'Dr. Vikram Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000', rating: '4.7 ★', bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.' },
  { id: 'doc-pedia-01', email: 'ananya.deshmukh@primecare.in', name: 'Dr. Ananya Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900', rating: '5.0 ★', bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.' },
  { id: 'doc-derma-01', email: 'rohan.mehta@primecare.in', name: 'Dr. Rohan Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100', rating: '4.8 ★', bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.' },
];

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pc_doctors (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          name VARCHAR(255) NOT NULL,
          specialisation VARCHAR(255) NOT NULL,
          qualification VARCHAR(255),
          experience VARCHAR(255),
          hospital VARCHAR(255),
          fee VARCHAR(50),
          rating VARCHAR(50) DEFAULT '5.0 ★',
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query(`
        SELECT id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio 
        FROM pc_doctors 
        ORDER BY created_at ASC
      `);

      // Merge defaults with dynamic doctors from database
      const dbDoctors = res.rows || [];
      const mergedMap = new Map<string, any>();
      
      DEFAULT_DOCTORS.forEach(d => mergedMap.set(d.email.toLowerCase(), d));
      dbDoctors.forEach(d => mergedMap.set(d.email.toLowerCase(), d));

      return NextResponse.json(
        { success: true, doctors: Array.from(mergedMap.values()) },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } catch (err: any) {
      console.error("GET doctors error:", err);
    }
  }
  return NextResponse.json({ success: true, doctors: DEFAULT_DOCTORS });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const doc = data.doctor;

    if (!doc || !doc.name || !doc.email) {
      return NextResponse.json({ success: false, error: 'Doctor details required' }, { status: 400 });
    }

    if (pool) {
      const cleanEmail = doc.email.trim().toLowerCase();
      const docId = doc.id || ('doc-' + Date.now());

      await pool.query(`
        INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          specialisation = EXCLUDED.specialisation,
          qualification = EXCLUDED.qualification,
          experience = EXCLUDED.experience,
          hospital = EXCLUDED.hospital,
          fee = EXCLUDED.fee,
          rating = EXCLUDED.rating,
          bio = EXCLUDED.bio
      `, [
        docId,
        cleanEmail,
        doc.name,
        doc.specialisation || 'General Medicine',
        doc.qualification || 'MBBS, MD',
        doc.experience || 'Practice Specialist',
        doc.hospital || 'PrimeCare Multispecialty Hospital',
        doc.fee || '₹1,000',
        doc.rating || '5.0 ★',
        doc.bio || `Specialist in ${doc.specialisation || 'General Medicine'}.`
      ]);
    }

    return NextResponse.json({ success: true, doctor: doc });
  } catch (err: any) {
    console.error("POST doctors error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
