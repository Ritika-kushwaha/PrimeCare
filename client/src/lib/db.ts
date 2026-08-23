// Centralized Cloud / Server Database Bridge
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
  tokenNumber: string;
  doctorId: string;
  doctorName: string;
  doctorEmail?: string;
  department: string;
  fee: string;
  hospital?: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  patientName: string;
  patientEmail: string;
  age?: string | number;
  gender?: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'LEAVE_CANCELLED';
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

// Global In-Memory Shared Cache across Serverless instances
declare global {
  var __PC_DB_DOCTORS: DoctorRecord[] | undefined;
  var __PC_DB_APPOINTMENTS: AppointmentRecord[] | undefined;
  var __PC_DB_EHR: EHRRecord[] | undefined;
  var __PC_DB_LEAVES: LeaveRecord[] | undefined;
}

const DEFAULT_DOCTORS: DoctorRecord[] = [
  { id: 'doc-cardio-01', email: 'ritikakushwaha62@gmail.com', name: 'Dr. Ritika Kushwaha', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS Delhi)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, diagnostic angiographies, coronary interventions, and comprehensive lipid management.' },
  { id: 'doc-cardio-02', email: 'aarav.sharma@primecare.in', name: 'Dr. Aarav Sharma', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS)', experience: '12 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease.' },
  { id: 'doc-cardio-03', email: 'meera.kulkarni@primecare.in', name: 'Dr. Meera Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400', rating: '4.8 ★', bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, and heart rhythm management.' },
  { id: 'doc-neuro-01', email: 'priya.nair@primecare.in', name: 'Dr. Priya Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500', rating: '4.9 ★', bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, and acute stroke treatment.' },
  { id: 'doc-ortho-01', email: 'vikram.patel@primecare.in', name: 'Dr. Vikram Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000', rating: '4.7 ★', bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.' },
  { id: 'doc-pedia-01', email: 'ananya.deshmukh@primecare.in', name: 'Dr. Ananya Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900', rating: '5.0 ★', bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.' },
  { id: 'doc-derma-01', email: 'rohan.mehta@primecare.in', name: 'Dr. Rohan Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100', rating: '4.8 ★', bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.' },
];

export function getDbDoctors(): DoctorRecord[] {
  if (!global.__PC_DB_DOCTORS) global.__PC_DB_DOCTORS = DEFAULT_DOCTORS;
  return global.__PC_DB_DOCTORS;
}

export function saveDbDoctors(doctors: DoctorRecord[]): void {
  global.__PC_DB_DOCTORS = doctors;
}

export function getDbAppointments(): AppointmentRecord[] {
  if (!global.__PC_DB_APPOINTMENTS) global.__PC_DB_APPOINTMENTS = [];
  return global.__PC_DB_APPOINTMENTS;
}

export function saveDbAppointments(appts: AppointmentRecord[]): void {
  global.__PC_DB_APPOINTMENTS = appts;
}

export function getDbEHR(): EHRRecord[] {
  if (!global.__PC_DB_EHR) global.__PC_DB_EHR = [];
  return global.__PC_DB_EHR;
}

export function saveDbEHR(ehrs: EHRRecord[]): void {
  global.__PC_DB_EHR = ehrs;
}

export function getDbLeaves(): LeaveRecord[] {
  if (!global.__PC_DB_LEAVES) global.__PC_DB_LEAVES = [];
  return global.__PC_DB_LEAVES;
}

export function saveDbLeaves(leaves: LeaveRecord[]): void {
  global.__PC_DB_LEAVES = leaves;
}
