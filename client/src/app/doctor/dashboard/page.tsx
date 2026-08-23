'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Clock, CheckCircle2, 
  Pill, FileText, Send, Calendar, 
  Printer, Receipt, Lock, Search, History, FolderHeart, User, Users, X, 
  Edit3, Save, BadgeCheck, Sparkles, AlertTriangle, HelpCircle, Check, ArrowRight,
  Filter, RefreshCw, Award, Briefcase, Building2, Star, ShieldAlert
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
  patientKey?: string;
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
  aiUrgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  aiChiefComplaint?: string;
  aiQuestions?: string[];
  status?: string;
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

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLINICAL' | 'EHR' | 'PROFILE'>('CLINICAL');
  const [allAppointments, setAllAppointments] = useState<AppointmentItem[]>([]);
  const [activePatient, setActivePatient] = useState<AppointmentItem | null>(null);
  const [filterMode, setFilterMode] = useState<'MY_PATIENTS' | 'ALL'>('MY_PATIENTS');
  const [searchQueue, setSearchQueue] = useState('');
  
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

  // Doctor Email Binding
  const doctorEmail = (user?.email || 'ritikakushwaha62@gmail.com').toLowerCase().trim();

  // Profile Form Inputs (Strictly Scoped to Current Doctor's Email)
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

  const loadData = () => {
    try {
      const storedRoster = localStorage.getItem('primecare_doctor_profiles');
      let roster: DoctorProfile[] = storedRoster ? JSON.parse(storedRoster) : DEFAULT_DOCTORS;

      // Find or auto-create doctor profile for the current logged-in email
      let myProfile = roster.find(d => (d.email || '').toLowerCase().trim() === doctorEmail);

      if (!myProfile) {
        const generatedName = user ? `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Dr. Ritika Kushwaha';
        myProfile = {
          id: `doc-${Date.now()}`,
          email: doctorEmail,
          name: generatedName.startsWith('Dr.') ? generatedName : `Dr. ${generatedName}`,
          specialisation: user?.specialisation || 'Cardiology',
          qualification: 'MD, DM (Cardiology - AIIMS Delhi)',
          experience: '14 Years Practice',
          hospital: 'PrimeCare Apex Heart Institute',
          fee: '₹1,200',
          rating: '4.9 ★',
          bio: 'Senior Clinical Specialist specializing in cardiovascular disease and outpatient care.'
        };
        roster = [myProfile, ...roster];
        localStorage.setItem('primecare_doctor_profiles', JSON.stringify(roster));
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
      const stored = localStorage.getItem('primecare_appointments');
      if (stored) {
        setAllAppointments(JSON.parse(stored));
      }
    } catch {}

    try {
      const storedEHR = localStorage.getItem('primecare_ehr_registry');
      if (storedEHR) {
        setEhrRegistry(JSON.parse(storedEHR));
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [user]);

  // SAVE DOCTOR DETAILS & CASCADE NAME UPDATES GLOBALLY
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');

    try {
      const formattedName = docName.trim().startsWith('Dr.') ? docName.trim() : `Dr. ${docName.trim()}`;
      const formattedFee = docFee.trim().startsWith('₹') ? docFee.trim() : `₹${docFee.trim()}`;

      // 1. Update Roster for THIS doctor email
      const storedRoster: DoctorProfile[] = JSON.parse(localStorage.getItem('primecare_doctor_profiles') || JSON.stringify(DEFAULT_DOCTORS));
      const myIndex = storedRoster.findIndex(d => (d.email || '').toLowerCase().trim() === doctorEmail);

      const updatedDoctorData: DoctorProfile = {
        id: myIndex > -1 ? storedRoster[myIndex].id : `doc-${Date.now()}`,
        email: doctorEmail,
        name: formattedName,
        specialisation: docSpecialty,
        qualification: docQualification,
        experience: docExperience,
        hospital: docHospital,
        fee: formattedFee,
        rating: '4.9 ★',
        bio: docBio
      };

      let newRoster: DoctorProfile[];
      if (myIndex > -1) {
        newRoster = [...storedRoster];
        newRoster[myIndex] = updatedDoctorData;
      } else {
        newRoster = [updatedDoctorData, ...storedRoster];
      }
      localStorage.setItem('primecare_doctor_profiles', JSON.stringify(newRoster));

      // 2. Cascade Name & Info to ALL Appointments linked to this doctor's email / previous name
      const storedAppointments: AppointmentItem[] = JSON.parse(localStorage.getItem('primecare_appointments') || '[]');
      const oldNameClean = docName.toLowerCase().trim();

      const updatedAppointments = storedAppointments.map(a => {
        const isMyAppointment = 
          ((a.doctorEmail || '').toLowerCase().trim() === doctorEmail) ||
          ((a.doctorName || '').toLowerCase().trim() === oldNameClean) ||
          ((a.doctorId || '') === updatedDoctorData.id);

        if (isMyAppointment) {
          return {
            ...a,
            doctorId: updatedDoctorData.id,
            doctorEmail: doctorEmail,
            doctorName: formattedName,
            department: docSpecialty,
            fee: formattedFee
          };
        }
        return a;
      });

      localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppointments));
      setAllAppointments(updatedAppointments);

      setDocName(formattedName);
      setDocFee(formattedFee);
      setProfileSuccessMsg('Doctor identity & clinical records updated everywhere! All patients now reflect your updated practitioner details.');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch {
      alert('Failed to update details. Please try again.');
    }
  };

  // Compute Queue (Strictly checks doctorEmail OR assigned doctorName)
  const displayedQueue = useMemo(() => {
    const query = searchQueue.toLowerCase().trim();
    const cleanDocName = docName.toLowerCase().replace('dr. ', '').trim();

    return allAppointments.filter((a) => {
      if (!a) return false;
      const matchSearch = `${a.patientName || ''} ${a.patientEmail || ''} ${a.doctorName || ''} ${a.department || ''}`.toLowerCase().includes(query);
      if (!matchSearch) return false;

      if (filterMode === 'MY_PATIENTS') {
        const isMyDocEmail = (a.doctorEmail || '').toLowerCase().trim() === doctorEmail;
        const isMyDocName = (a.doctorName || '').toLowerCase().includes(cleanDocName);
        return isMyDocEmail || isMyDocName;
      }
      return true;
    });
  }, [allAppointments, filterMode, docName, doctorEmail, searchQueue]);

  useEffect(() => {
    if (displayedQueue.length > 0 && (!activePatient || !displayedQueue.some(p => p.id === activePatient.id))) {
      handleSelectPatient(displayedQueue[0]);
    }
  }, [displayedQueue]);

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

  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setLoading(true);

    const pName = activePatient.patientName || 'Patient Member';
    const pEmail = (activePatient.patientEmail || 'patient@primecare.in').toLowerCase();

    let aiPostVisit = {
      patientSummary: `Diagnosis: ${clinicalNotes}. Targeted clinical therapy initiated.`,
      medicationSchedule: `Take ${medication} every ${frequencyHours} hours for ${durationDays} days.`,
      followUpSteps: 'Maintain hydration, monitor symptom resolution, and return if condition does not improve.',
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
        invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        fee: docFee,
      },
    };

    const patientKey = `${pEmail}_${pName.toLowerCase().replace(/\s+/g, '')}`;

    try {
      const storedEHR: PatientEHR[] = JSON.parse(localStorage.getItem('primecare_ehr_registry') || '[]');
      const patientIndex = storedEHR.findIndex((p) => p.patientKey === patientKey);

      if (patientIndex > -1) {
        storedEHR[patientIndex].visits.unshift(visitEntry);
      } else {
        storedEHR.unshift({
          patientKey,
          patientEmail: pEmail,
          patientName: pName,
          age: 21,
          gender: 'Member',
          visits: [visitEntry],
        });
      }

      localStorage.setItem('primecare_ehr_registry', JSON.stringify(storedEHR));
      setEhrRegistry(storedEHR);
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

  const triggerPrint = (type: 'PRESCRIPTION' | 'AI_SUMMARY') => {
    setPrintDocType(type);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* PRINTABLE SLIP */}
        {completedRecord && printDocType && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            {printDocType === 'AI_SUMMARY' ? (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black">PrimeCare Health Care Plan</h1>
                    <p className="text-sm font-semibold">{docName} • {docSpecialty}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-black text-emerald-800 uppercase">AI Post-Visit Summary</h2>
                    <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border border-gray-300 p-4 rounded bg-gray-50 text-xs">
                  <strong>Patient:</strong> {completedRecord.patient.patientName} ({completedRecord.patient.patientEmail})
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">1. Plain-Language Diagnosis</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.patientSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">2. Medication Regimen</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.medicationSchedule}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase">3. Follow-up Steps</h3>
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    {completedRecord.aiSummary.followUpSteps}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black">PrimeCare Multispecialty Hospital</h1>
                    <p className="text-sm font-semibold">{docName}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">OFFICIAL PRESCRIPTION (℞)</h2>
                  </div>
                </div>
                <div className="p-4 border border-gray-300 text-xs">
                  <p><strong>Patient:</strong> {completedRecord.patient.patientName}</p>
                  <p><strong>Rx:</strong> {completedRecord.prescription.medication} every {completedRecord.prescription.frequencyHours} hours for {completedRecord.prescription.durationDays} days</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          
          {/* TOP HEADER */}
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

            {/* TAB SELECTORS */}
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('CLINICAL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'CLINICAL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Patient Queue ({displayedQueue.length})
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

          {/* TAB 1: CLINICAL QUEUE & AI TRIAGE */}
          {activeTab === 'CLINICAL' && (
            <div className="space-y-6">
              <AnimatePresence>
                {completedRecord && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                          <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-emerald-100">
                            Prescription & AI Care Plan Ready for {completedRecord.patient.patientName}
                          </h3>
                          <p className="text-xs text-emerald-400">Diagnosis converted to plain language instructions.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerPrint('AI_SUMMARY')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/25"
                        >
                          <Sparkles className="w-4 h-4" /> Print AI Care Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerPrint('PRESCRIPTION')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                        >
                          <Printer className="w-4 h-4" /> Print ℞ Rx
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* QUEUE COLUMN */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" /> Active Queue ({displayedQueue.length})
                      </span>
                      <button
                        type="button"
                        onClick={loadData}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setFilterMode('MY_PATIENTS')}
                        className={`py-1.5 rounded-lg transition ${
                          filterMode === 'MY_PATIENTS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Assigned to Me ({docName})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('ALL')}
                        className={`py-1.5 rounded-lg transition ${
                          filterMode === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Clinic Patients
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={searchQueue}
                        onChange={(e) => setSearchQueue(e.target.value)}
                        placeholder="Search patient name or symptom..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {displayedQueue.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                          <Users className="w-8 h-8 mx-auto text-slate-600" />
                          <p>No patients currently assigned to {docName}.</p>
                          <button
                            onClick={() => setFilterMode('ALL')}
                            className="text-emerald-400 hover:underline block mx-auto"
                          >
                            View All Clinic Patients
                          </button>
                        </div>
                      ) : (
                        displayedQueue.map((p) => {
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

                {/* CONSULTATION & PRE-VISIT AI TRIAGE */}
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

                      {/* PRE-VISIT AI SYMPTOM ANALYSIS */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/30 border border-blue-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                            <Sparkles className="w-4 h-4 text-blue-400" /> AI Pre-Visit Symptom Analysis
                          </div>

                          {preVisitTriage && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              preVisitTriage.urgency === 'HIGH'
                                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                : preVisitTriage.urgency === 'MEDIUM'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            }`}>
                              Urgency: {preVisitTriage.urgency}
                            </span>
                          )}
                        </div>

                        {aiTriageLoading ? (
                          <div className="text-xs text-slate-400 italic py-2 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" /> Analyzing patient symptoms & formulating clinical inquiries...
                          </div>
                        ) : preVisitTriage ? (
                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold block text-[10px] uppercase">AI Chief Complaint:</span>
                              <p className="text-slate-200 font-medium">{preVisitTriage.chiefComplaint}</p>
                            </div>

                            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                              <span className="text-blue-300 font-bold block text-[11px] flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Suggested Inquiries for Clinical Interview:
                              </span>
                              <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc">
                                {preVisitTriage.suggestedQuestions.map((q, idx) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}
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
                          {loading ? 'Generating AI Patient Care Plan...' : (<><Sparkles className="w-4 h-4" /> Finalize Consultation & Generate AI Patient Summary</>)}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40">
                      Select a patient from the queue to start consultation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LONGITUDINAL EHR */}
          {activeTab === 'EHR' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ehrRegistry.map((patient, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{patient.patientName}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{patient.patientEmail}</p>
                      <p className="text-xs text-emerald-400 mt-2 font-bold">{patient.visits.length} Encounters</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEhrPatient(patient)}
                      className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs transition"
                    >
                      View Encounters & AI Summaries
                    </button>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedEhrPatient && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
                    >
                      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedEhrPatient.patientName}</h3>
                          <p className="text-xs text-slate-400">{selectedEhrPatient.patientEmail}</p>
                        </div>
                        <button onClick={() => setSelectedEhrPatient(null)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {selectedEhrPatient.visits.map((v, i) => (
                          <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                              <span><strong>Attending:</strong> {v.doctorName}</span>
                              <span>{v.date}</span>
                            </div>
                            <p><strong>Clinical Notes:</strong> {v.clinicalNotes}</p>
                            <p className="text-emerald-400 font-serif"><strong>Rx:</strong> ℞ {v.prescription.medication}</p>

                            {v.aiPostVisitSummary && (
                              <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1.5">
                                <span className="text-purple-300 font-bold block flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> AI Patient Care Plan:
                                </span>
                                <p className="text-slate-300">{v.aiPostVisitSummary.patientSummary}</p>
                                <p className="text-slate-400"><strong>Schedule:</strong> {v.aiPostVisitSummary.medicationSchedule}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: EDIT DR. DETAILS (EMAIL-BOUND) */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
                
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
                    <BadgeCheck className="w-3.5 h-3.5" /> Bound to Account: {doctorEmail}
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Edit Practitioner Details</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Updating your details here will automatically synchronize and update all your assigned patient appointments and public directory profiles.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-2xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" /> Practitioner Name
                      </label>
                      <input
                        type="text"
                        required
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Dr. Full Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> Specialisation Department
                      </label>
                      <select
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-400" /> Qualifications
                      </label>
                      <input
                        type="text"
                        required
                        value={docQualification}
                        onChange={(e) => setDocQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD, DM"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Experience
                      </label>
                      <input
                        type="text"
                        required
                        value={docExperience}
                        onChange={(e) => setDocExperience(e.target.value)}
                        placeholder="e.g. 14 Years Practice"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Hospital Affiliation
                      </label>
                      <input
                        type="text"
                        required
                        value={docHospital}
                        onChange={(e) => setDocHospital(e.target.value)}
                        placeholder="e.g. PrimeCare Apex Hospital"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Consultation Fee
                      </label>
                      <input
                        type="text"
                        required
                        value={docFee}
                        onChange={(e) => setDocFee(e.target.value)}
                        placeholder="e.g. ₹1,200"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Professional Bio & Specialties
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={docBio}
                      onChange={(e) => setDocBio(e.target.value)}
                      placeholder="Write your clinical focus..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save & Update Everywhere
                  </button>
                </form>

              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
