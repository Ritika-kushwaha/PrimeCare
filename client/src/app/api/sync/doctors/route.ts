import { NextResponse } from "next/navigation";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

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
      const res = await pool.query(`SELECT id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio FROM pc_doctors`);
      if (res.rows.length === 0) {
        for (const doc of DEFAULT_DOCTORS) {
          await pool.query(
            `INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [doc.id, doc.email, doc.name, doc.specialisation, doc.qualification, doc.experience, doc.hospital, doc.fee, doc.rating, doc.bio]
          );
        }
        return NextResponse.json({ success: true, doctors: DEFAULT_DOCTORS });
      }
      return NextResponse.json({ success: true, doctors: res.rows });
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
    const docs = data.doctors || (data.doctor ? [data.doctor] : []);

    if (pool && docs.length > 0) {
      for (const d of docs) {
        await pool.query(
          `INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             specialisation = EXCLUDED.specialisation,
             qualification = EXCLUDED.qualification,
             experience = EXCLUDED.experience,
             hospital = EXCLUDED.hospital,
             fee = EXCLUDED.fee,
             rating = EXCLUDED.rating,
             bio = EXCLUDED.bio`,
          [d.id, d.email, d.name, d.specialisation, d.qualification, d.experience, d.hospital, d.fee, d.rating, d.bio]
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
