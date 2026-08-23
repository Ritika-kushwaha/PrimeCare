'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Clock, CheckCircle2, 
  Pill, FileText, Send, Calendar, 
  Printer, Receipt, Lock, Search, History, FolderHeart, User, Users, X, 
  Edit3, Save, BadgeCheck, Sparkles, AlertTriangle, HelpCircle, Check, ArrowRight,
  Filter, RefreshCw, Award, Briefcase, Building2, Star, Mail, CheckCheck, CalendarX2, AlertCircle, CalendarPlus
} from 'lucide-react';

interface DoctorProfile {
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

interface VisitRecord {
  visitId: string;
  date: string;
  doctorName: string;
  doctorEmail: string;
  department: string;
  symptoms: string;
  clinicalNotes: string;
  prescription: {
    medication: string;
    frequencyHours: number;
    durationDays: number;
    startDateTime: string;
  };
  aiPostVisitSummary?: {
    patientSummary: string;
    medicationSchedule: string;
    followUpSteps: string;
  };
  invoice: {
    invoiceNumber: string;
    fee: string;
  };
}

interface PatientEHR {
  patientKey: string;
  patientEmail: string;
  patientName: string;
  age: number | string;
  gender: string;
  visits: VisitRecord[];
}

interface AppointmentItem {
  id: string;
  tokenNumber?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  department?: string;
  fee?: string;
  date?: string;
  timeSlot?: string;
  symptoms?: string;
  patientName?: string;
  patientEmail?: string;
  age?: string | number;
  gender?: string;
  status?: string;
  finalizedAt?: string;
  leaveReason?: string;
}

const DEFAULT_DOCTORS: DoctorProfile[] = [
  { id: 'doc-cardio-01', email: 'ritikakushwaha62@gmail.com', name: 'Dr. Ritika Kushwaha', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS Delhi)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, diagnostic angiographies, coronary interventions, and comprehensive lipid management.' },
  { id: 'doc-cardio-02', email: 'aarav.sharma@primecare.in', name: 'Dr. Aarav Sharma', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS)', experience: '12 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease.' },
  { id: 'doc-cardio-03', email: 'meera.kulkarni@primecare.in', name: 'Dr. Meera Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400', rating: '4.8 ★', bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, and heart rhythm management.' },
  { id: 'doc-neuro-01', email: 'priya.nair@primecare.in', name: 'Dr. Priya Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500', rating: '4.9 ★', bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, and acute stroke treatment.' },
  { id: 'doc-ortho-01', email: 'vikram.patel@primecare.in', name: 'Dr. Vikram Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000', rating: '4.7 ★', bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.' },
  { id: 'doc-pedia-01', email: 'ananya.deshmukh@primecare.in', name: 'Dr. Ananya Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900', rating: '5.0 ★', bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.' },
  { id: 'doc-derma-01', email: 'rohan.mehta@primecare.in', name: 'Dr. Rohan Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100', rating: '4.8 ★', bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const getNormalizedPatientKey = (email?: string, name?: string) => {
  const cleanEmail = (email || 'patient@primecare.in').trim().toLowerCase();
  const cleanName = (name || 'Patient Member').trim().toLowerCase().replace(/\s+/g, ' ');
  return cleanEmail + '::' + cleanName;
};

const deduplicateEHR = (records: PatientEHR[]): PatientEHR[] => {
  const map = new Map<string, PatientEHR>();

  records.forEach((record) => {
    if (!record) return;
    const key = getNormalizedPatientKey(record.patientEmail, record.patientName);
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      const visitMap = new Map<string, VisitRecord>();
      [...existing.visits, ...record.visits].forEach(v => {
        if (v && v.visitId) visitMap.set(v.visitId, v);
      });
      existing.visits = Array.from(visitMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      map.set(key, {
        ...record,
        patientKey: key,
        patientName: record.patientName.trim(),
        patientEmail: record.patientEmail.trim().toLowerCase(),
        visits: [...record.visits].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      });
    }
  });

  return Array.from(map.values());
};

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'LEAVE_AFFECTED' | 'EHR' | 'PROFILE'>('CLINICAL');
  const [allAppointments, setAllAppointments] = useState<AppointmentItem[]>([]);
  const [activePatient, setActivePatient] = useState<AppointmentItem | null>(null);
  const [filterMode, setFilterMode] = useState<'MY_PATIENTS' | 'ALL'>('ALL'); // Default ALL so new doctors see incoming queue instantly
  const [searchQueue, setSearchQueue] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Reschedule Modal State
  const [reschedulingApt, setReschedulingApt] = useState<AppointmentItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-29');
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM');

  // AI Triage State
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [preVisitTriage, setPreVisitTriage] = useState<{
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    chiefComplaint: string;
    suggestedQuestions: string[];
  } | null>(null);

  // EHR State
  const [ehrRegistry, setEhrRegistry] = useState<PatientEHR[]>([]);
  const [selectedEhrPatient, setSelectedEhrPatient] = useState<PatientEHR | null>(null);
  const [searchEhr, setSearchEhr] = useState('');

  // Doctor Email Binding
  const doctorEmail = (user?.email || 'ritikakushwaha62@gmail.com').toLowerCase().trim();

  // Profile Form Inputs
  const [docName, setDocName] = useState('Dr. Ritika Kushwaha');
  const [docSpecialty, setDocSpecialty] = useState('Cardiology');
  const [docQualification, setDocQualification] = useState('MD, DM (Cardiology - AIIMS Delhi)');
  const [docExperience, setDocExperience] = useState('14 Years Practice');
  const [docHospital, setDocHospital] = useState('PrimeCare Apex Heart Institute');
  const [docFee, setDocFee] = useState('₹1,200');
  const [docBio, setDocBio] = useState('Senior Interventional Cardiologist specializing in preventive heart disease, diagnostic angiographies, coronary interventions, and comprehensive lipid management.');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Clinical Consultation Form State
  const [clinicalNotes, setClinicalNotes] = useState('Patient presents with stable vitals. Initiating standard therapeutic regimen.');
  const [medication, setMedication] = useState('Amoxicillin 500mg');
  const [frequencyHours, setFrequencyHours] = useState(8);
  const [durationDays, setDurationDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<any | null>(null);
  const [printDocType, setPrintDocType] = useState<'PRESCRIPTION' | 'AI_SUMMARY' | null>(null);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const docRes = await fetch('/api/sync/doctors', { cache: 'no-store' });
      const docData = await docRes.json();
      let roster: DoctorProfile[] = DEFAULT_DOCTORS;
      if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
        roster = docData.doctors;
        localStorage.setItem('primecare_doctor_profiles', JSON.stringify(roster));
      }

      let myProfile = roster.find((d: any) => (d.email || '').toLowerCase().trim() === doctorEmail);

      if (!myProfile) {
        const genName = user ? 'Dr. ' + (user.firstName || '') + ' ' + (user.lastName || '') : 'Dr. Ritika Kushwaha';
        const finalName = genName.trim().startsWith('Dr.') ? genName.trim() : 'Dr. ' + genName.trim();
        myProfile = {
          id: 'doc-' + Date.now(),
          email: doctorEmail,
          name: finalName,
          specialisation: user?.specialisation || 'Cardiology',
          qualification: 'MD, DM (Cardiology - AIIMS Delhi)',
          experience: '14 Years Practice',
          hospital: 'PrimeCare Apex Heart Institute',
          fee: '₹1,200',
          rating: '4.9 ★',
          bio: 'Senior Clinical Specialist specializing in cardiovascular disease and outpatient care.'
        };
        roster = [myProfile, ...roster];
        await fetch('/api/sync/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctor: myProfile })
        });
      }

      setDocName(myProfile.name);
      setDocSpecialty(myProfile.specialisation);
      setDocQualification(myProfile.qualification);
      setDocExperience(myProfile.experience);
      setDocHospital(myProfile.hospital);
      setDocFee(myProfile.fee);
      setDocBio(myProfile.bio);
    } catch {}

    try {
      const apptRes = await fetch('/api/sync/appointments', { cache: 'no-store' });
      const apptData = await apptRes.json();
      if (apptData.success && Array.isArray(apptData.appointments)) {
        setAllAppointments(apptData.appointments);
        localStorage.setItem('primecare_appointments', JSON.stringify(apptData.appointments));
      }
    } catch {}

    try {
      const ehrRes = await fetch('/api/sync/ehr', { cache: 'no-store' });
      const ehrData = await ehrRes.json();
      if (ehrData.success && Array.isArray(ehrData.ehrRegistry)) {
        const cleanEHR = deduplicateEHR(ehrData.ehrRegistry);
        setEhrRegistry(cleanEHR);
        localStorage.setItem('primecare_ehr_registry', JSON.stringify(cleanEHR));
      }
    } catch {}

    setIsRefreshing(false);
  }, [doctorEmail, user]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000); // 5s fast polling for real-time cross-device updates
    return () => clearInterval(timer);
  }, [loadData]);

  // 1. ACTIVE QUEUE: Excludes COMPLETED, CANCELLED, and LEAVE_CANCELLED
  const activeQueue = useMemo(() => {
    const query = searchQueue.toLowerCase().trim();
    const cleanDocName = docName.toLowerCase().replace('dr. ', '').trim();

    return allAppointments.filter((a) => {
      if (!a || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;
      const matchSearch = ((a.patientName || '') + ' ' + (a.patientEmail || '') + ' ' + (a.doctorName || '') + ' ' + (a.department || '')).toLowerCase().includes(query);
      if (!matchSearch) return false;

      if (filterMode === 'MY_PATIENTS') {
        const isMyDocEmail = (a.doctorEmail || '').toLowerCase().trim() === doctorEmail;
        const isMyDocName = (a.doctorName || '').toLowerCase().includes(cleanDocName);
        return isMyDocEmail || isMyDocName;
      }
      return true;
    });
  }, [allAppointments, filterMode, docName, doctorEmail, searchQueue]);

  // 2. LEAVE AFFECTED SECTION
  const leaveAffectedAppointments = useMemo(() => {
    const cleanDocName = docName.toLowerCase().replace('dr. ', '').trim();

    return allAppointments.filter((a) => {
      if (!a || a.status !== 'LEAVE_CANCELLED') return false;
      if (filterMode === 'MY_PATIENTS') {
        const isMyDocEmail = (a.doctorEmail || '').toLowerCase().trim() === doctorEmail;
        const isMyDocName = (a.doctorName || '').toLowerCase().includes(cleanDocName);
        return isMyDocEmail || isMyDocName;
      }
      return true;
    });
  }, [allAppointments, filterMode, docName, doctorEmail]);

  useEffect(() => {
    if (activeQueue.length > 0 && (!activePatient || !activeQueue.some(p => p.id === activePatient.id))) {
      handleSelectPatient(activeQueue[0]);
    } else if (activeQueue.length === 0) {
      setActivePatient(null);
    }
  }, [activeQueue, activePatient]);

  const handleSelectPatient = async (patient: AppointmentItem) => {
    setActivePatient(patient);
    setCompletedRecord(null);

    setAiTriageLoading(true);
    try {
      const res = await fetch('/api/ai/pre-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: patient.symptoms || '' }),
      });
      const data = await res.json();
      setPreVisitTriage(data);
    } catch {
      const symp = (patient.symptoms || '').toLowerCase();
      setPreVisitTriage({
        urgency: symp.includes('chest') || symp.includes('severe') ? 'HIGH' : 'MEDIUM',
        chiefComplaint: patient.symptoms || 'Clinical Evaluation',
        suggestedQuestions: [
          'What is the precise onset time and progression of symptoms?',
          'Are there any known drug allergies or active medications?',
          'Have you noticed aggravating triggers or shortness of breath?'
        ],
      });
    } finally {
      setAiTriageLoading(false);
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt) return;

    const updatedAppts = allAppointments.map(a => {
      if (a.id === reschedulingApt.id) {
        return {
          ...a,
          date: rescheduleDate,
          timeSlot: rescheduleSlot,
          status: 'CONFIRMED',
          leaveReason: undefined
        };
      }
      return a;
    });

    setAllAppointments(updatedAppts);
    localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppts));
    await fetch('/api/sync/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointments: updatedAppts })
    });

    setReschedulingApt(null);
    setProfileSuccessMsg('Appointment successfully rescheduled & synced across devices!');
    setTimeout(() => setProfileSuccessMsg(''), 5000);
  };

  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setLoading(true);

    const pName = (activePatient.patientName || 'Patient Member').trim().replace(/\s+/g, ' ');
    const pEmail = (activePatient.patientEmail || 'patient@primecare.in').toLowerCase().trim();
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const completedPatientId = activePatient.id;

    let aiPostVisit = {
      patientSummary: 'Diagnosis: ' + clinicalNotes + '. Targeted outpatient clinical therapy initiated.',
      medicationSchedule: 'Take ' + medication + ' every ' + frequencyHours + ' hours for ' + durationDays + ' days.',
      followUpSteps: 'Maintain hydration, complete the entire prescribed therapeutic course, and return if symptoms persist.',
    };

    try {
      const aiRes = await fetch('/api/ai/post-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalNotes,
          medication,
          frequencyHours,
          durationDays,
          patientName: pName,
          patientEmail: pEmail,
          doctorName: docName,
          department: docSpecialty,
          invoiceNumber,
          fee: docFee
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.patientSummary) aiPostVisit = aiData;
    } catch {}

    const visitEntry: VisitRecord = {
      visitId: 'VST-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      doctorName: docName,
      doctorEmail: doctorEmail,
      department: docSpecialty,
      symptoms: activePatient.symptoms || 'General Consultation',
      clinicalNotes,
      prescription: {
        medication,
        frequencyHours: Number(frequencyHours),
        durationDays: Number(durationDays),
        startDateTime: new Date().toISOString(),
      },
      aiPostVisitSummary: aiPostVisit,
      invoice: {
        invoiceNumber,
        fee: docFee,
      },
    };

    const canonicalKey = getNormalizedPatientKey(pEmail, pName);

    try {
      const storedEHR: PatientEHR[] = JSON.parse(localStorage.getItem('primecare_ehr_registry') || '[]');
      const patientIndex = storedEHR.findIndex((p) => getNormalizedPatientKey(p.patientEmail, p.patientName) === canonicalKey);

      let updatedEHR: PatientEHR[];
      if (patientIndex > -1) {
        updatedEHR = [...storedEHR];
        updatedEHR[patientIndex] = {
          ...updatedEHR[patientIndex],
          patientName: pName,
          patientEmail: pEmail,
          visits: [visitEntry, ...updatedEHR[patientIndex].visits]
        };
      } else {
        updatedEHR = [
          {
            patientKey: canonicalKey,
            patientEmail: pEmail,
            patientName: pName,
            age: activePatient.age || 21,
            gender: activePatient.gender || 'Member',
            visits: [visitEntry],
          },
          ...storedEHR
        ];
      }

      const cleanedEHR = deduplicateEHR(updatedEHR);
      setEhrRegistry(cleanedEHR);
      localStorage.setItem('primecare_ehr_registry', JSON.stringify(cleanedEHR));
      await fetch('/api/sync/ehr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ehrRegistry: cleanedEHR })
      });
    } catch {}

    try {
      const updatedAppts = allAppointments.map(a => a.id === completedPatientId ? { ...a, status: 'COMPLETED' } : a);
      setAllAppointments(updatedAppts);
      localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppts));
      await fetch('/api/sync/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: updatedAppts })
      });
    } catch {}

    setCompletedRecord({
      patient: activePatient,
      clinicalNotes,
      prescription: visitEntry.prescription,
      aiSummary: aiPostVisit,
      invoice: visitEntry.invoice,
    });

    setLoading(false);
  };

  const filteredEhr = useMemo(() => {
    const q = searchEhr.toLowerCase().trim();
    return ehrRegistry.filter(p => 
      p.patientName.toLowerCase().includes(q) || 
      p.patientEmail.toLowerCase().includes(q)
    );
  }, [ehrRegistry, searchEhr]);

  return (
    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        
        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-2">
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Workspace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {docName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {docSpecialty} Specialist • {docHospital}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('CLINICAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'CLINICAL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Queue ({activeQueue.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LEAVE_AFFECTED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'LEAVE_AFFECTED' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarX2 className="w-3.5 h-3.5" /> Due to Dr. on Leave ({leaveAffectedAppointments.length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('EHR'); loadData(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'EHR' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Patient EHR ({ehrRegistry.length})
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('PROFILE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'PROFILE' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Dr. Details
              </button>
            </div>
          </div>

          {/* TAB 1: ACTIVE CLINICAL QUEUE & AI TRIAGE */}
          {activeTab === 'CLINICAL' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* QUEUE COLUMN */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" /> Live Outpatient Queue ({activeQueue.length})
                      </span>
                      <button
                        type="button"
                        onClick={loadData}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Cloud
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setFilterMode('ALL')}
                        className={`py-1.5 rounded-lg transition ${
                          filterMode === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Booked Patients ({allAppointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.status !== 'LEAVE_CANCELLED').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('MY_PATIENTS')}
                        className={`py-1.5 rounded-lg transition ${
                          filterMode === 'MY_PATIENTS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        My Assigned Only
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={searchQueue}
                        onChange={(e) => setSearchQueue(e.target.value)}
                        placeholder="Search patient name, email, or token..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {activeQueue.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                          <Users className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="font-semibold text-slate-400">Queue is Clear</p>
                          <p className="text-[11px]">No active patient bookings found in the database.</p>
                        </div>
                      ) : (
                        activeQueue.map((p) => {
                          const isSelected = activePatient?.id === p.id;

                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectPatient(p)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                    {p.patientName}
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                  </h4>
                                  <p className="text-[11px] text-slate-400">{p.patientEmail}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono text-emerald-400 font-bold block">{p.timeSlot}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{p.tokenNumber}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
                                <span>Assisting Dr: <strong className="text-slate-300">{p.doctorName}</strong></span>
                                <span>{p.date}</span>
                              </div>

                              <p className="text-xs text-slate-300 truncate mt-1 italic">&quot;{p.symptoms}&quot;</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* CONSULTATION COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                  {activePatient ? (
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Patient Consultation</span>
                          <h3 className="font-extrabold text-xl text-white">{activePatient.patientName}</h3>
                          <p className="text-xs text-slate-400">{activePatient.patientEmail} • Scheduled with {activePatient.doctorName}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          {activePatient.timeSlot} ({activePatient.tokenNumber})
                        </span>
                      </div>

                      {/* CLINICAL NOTES FORM */}
                      <form onSubmit={handleFinalizeConsultation} className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" /> Clinical Examination Notes
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-4 h-4" /> Prescription (℞)
                          </span>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="block text-[11px] text-slate-400 mb-1">Medication</span>
                              <input
                                type="text"
                                required
                                value={medication}
                                onChange={(e) => setMedication(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                              />
                            </div>
                            <div>
                              <span className="block text-[11px] text-slate-400 mb-1">Interval (Hours)</span>
                              <input
                                type="number"
                                required
                                value={frequencyHours}
                                onChange={(e) => setFrequencyHours(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2"
                        >
                          {loading ? 'Finalizing...' : (<><Send className="w-4 h-4" /> Finalize Consultation & Remove from Queue</>)}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-16 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                      <Users className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="font-semibold text-slate-300 text-sm">No Active Patient Selected</p>
                      <p className="text-xs text-slate-500">Pick an active patient from the queue on the left to start consultation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DUE TO DR ON LEAVE */}
          {activeTab === 'LEAVE_AFFECTED' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <CalendarX2 className="w-5 h-5" />
                  <span>Considered Appointments Shifted Due to Doctor on Leave ({leaveAffectedAppointments.length})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  These patient appointments were displaced due to an approved leave date. Click <strong>&quot;Reschedule Slot&quot;</strong> to allocate a new date and time.
                </p>
              </div>

              {leaveAffectedAppointments.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No Shifted Appointments</p>
                  <p className="text-xs text-slate-500">None of your scheduled patients are currently affected by an active leave date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {leaveAffectedAppointments.map((a) => (
                    <div key={a.id} className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mb-1 inline-block">
                              Shifted • Token {a.tokenNumber}
                            </span>
                            <h3 className="text-lg font-bold text-white">{a.patientName}</h3>
                            <p className="text-[11px] text-slate-400 font-mono">{a.patientEmail}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-400 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
                            {a.fee || '₹1,200'}
                          </span>
                        </div>

                        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Assigned Doctor:</span>
                            <strong className="text-slate-200">{a.doctorName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Original Slot:</span>
                            <strong className="text-amber-300">{a.date} ({a.timeSlot})</strong>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-400">
                            <span>Leave Reason:</span>
                            <span className="text-amber-400 font-medium">{a.leaveReason || 'Doctor Duty Leave'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingApt(a);
                          setRescheduleDate(a.date || '2026-08-29');
                          setRescheduleSlot(a.timeSlot || '10:00 AM');
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                      >
                        <CalendarPlus className="w-4 h-4" /> Reschedule Slot & Restore to Queue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EHR */}
          {activeTab === 'EHR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" /> Longitudinal Patient EHR Registry
                  </h2>
                  <p className="text-xs text-slate-400">
                    Unified records synchronized from cloud database.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchEhr}
                    onChange={(e) => setSearchEhr(e.target.value)}
                    placeholder="Search patient name or email..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {filteredEhr.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <FolderHeart className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">No medical records found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEhr.map((patient) => (
                    <div key={patient.patientKey} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-base text-white">{patient.patientName}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {patient.visits.length} Visits
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{patient.patientEmail}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEhrPatient(patient)}
                        className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <History className="w-3.5 h-3.5" /> View Encounters ({patient.visits.length})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>

        {/* RESCHEDULE MODAL */}
        <AnimatePresence>
          {reschedulingApt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase mb-1">
                      <CalendarPlus className="w-3 h-3" /> Reschedule Shifted Slot
                    </div>
                    <h3 className="text-xl font-bold text-white">{reschedulingApt.patientName}</h3>
                    <p className="text-xs text-slate-400">{reschedulingApt.patientEmail} • Token {reschedulingApt.tokenNumber}</p>
                  </div>
                  <button onClick={() => setReschedulingApt(null)} className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Select New Date</label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Select New Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleSlot(slot)}
                          className={`py-2 px-2.5 rounded-xl font-bold border transition text-center ${
                            rescheduleSlot === slot
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setReschedulingApt(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      Confirm Reschedule & Restore
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}
