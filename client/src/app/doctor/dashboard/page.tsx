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
  Filter, RefreshCw, Award, Briefcase, Building2, Star, Mail, CheckCheck, CalendarX2, AlertCircle, CalendarPlus, ChevronRight
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

interface LeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
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
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [activePatient, setActivePatient] = useState<AppointmentItem | null>(null);
  const [filterMode, setFilterMode] = useState<'MY_PATIENTS' | 'ALL'>('ALL');
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
  const doctorEmail = (user?.email || 'doctor@primecare.in').toLowerCase().trim();

  // Dynamic Doctor Profile State
  const [docId, setDocId] = useState('doc-' + Date.now());
      const [docName, setDocName] = useState(() => {
    if (user?.firstName) {
      return ("Dr. " + user.firstName.trim() + " " + (user.lastName || "").trim()).trim();
    }
    return 'Dr. Specialist';
  });
    const [docSpecialty, setDocSpecialty] = useState(() => user?.specialisation || 'General Medicine');
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

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const docRes = await fetch('/api/sync/doctors', { cache: 'no-store' });
      const docData = await docRes.json();
      let roster: DoctorProfile[] = DEFAULT_DOCTORS;
      if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
        roster = docData.doctors;
      }

      let myProfile = roster.find((d: any) => (d.email || '').toLowerCase().trim() === doctorEmail);

      if (!myProfile) {
        const genName = user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : docName;
        const finalName = genName.startsWith('Dr.') ? genName : `Dr. ${genName}`;
        myProfile = {
          id: 'doc-' + Date.now(),
          email: doctorEmail,
          name: finalName,
          specialisation: user?.specialisation || docSpecialty,
          qualification: docQualification,
          experience: docExperience,
          hospital: docHospital,
          fee: docFee,
          rating: '4.9 ★',
          bio: docBio
        };
        await fetch('/api/sync/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctor: myProfile })
        });
      }

      setDocId(myProfile.id);
            if (user?.firstName) {
        setDocName(("Dr. " + user.firstName.trim() + " " + (user.lastName || "").trim()).trim());
      } else {
        setDocName(myProfile.name);
      }
            if (myProfile.specialisation) {
        setDocSpecialty(myProfile.specialisation);
      } else if (user?.specialisation) {
        setDocSpecialty(user.specialisation);
      }
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
      }
    } catch {}

    try {
      const leaveRes = await fetch('/api/sync/leaves', { cache: 'no-store' });
      const leaveData = await leaveRes.json();
      if (leaveData.success && Array.isArray(leaveData.leaves)) {
        setLeaves(leaveData.leaves);
      }
    } catch {}

    try {
      const ehrRes = await fetch('/api/sync/ehr', { cache: 'no-store' });
      const ehrData = await ehrRes.json();
      if (ehrData.success && Array.isArray(ehrData.ehrRegistry)) {
        const cleanEHR = deduplicateEHR(ehrData.ehrRegistry);
        setEhrRegistry(cleanEHR);
      }
    } catch {}

    setIsRefreshing(false);
  }, [doctorEmail, user]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Clean Name Helper
  const cleanDoctorName = (name?: string) => (name || '').toLowerCase().replace('dr. ', '').trim();

  // Handle Save Doctor Profile Edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('Saving profile to database...');

    const updatedProfile: DoctorProfile = {
      id: docId,
      email: doctorEmail,
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      specialisation: docSpecialty,
      qualification: docQualification,
      experience: docExperience,
      hospital: docHospital,
      fee: docFee,
      rating: '4.9 ★',
      bio: docBio
    };

    try {
      await fetch('/api/sync/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor: updatedProfile })
      });
            try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          u.specialisation = docSpecialty;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {}
      setProfileSuccessMsg('Doctor profile & department updated across all devices!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      setProfileSuccessMsg('Failed to update doctor profile.');
    }
  };

  // 1. ACTIVE QUEUE
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

  // 2. LEAVE AFFECTED
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
    const symp = (patient.symptoms || '').toLowerCase();
    const isHigh = symp.includes('chest') || symp.includes('severe') || symp.includes('breath') || symp.includes('heart') || symp.includes('faint');
    const isLow = symp.includes('routine') || symp.includes('checkup') || symp.includes('mild');

    try {
      const res = await fetch('/api/ai/pre-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: patient.symptoms || 'Routine Consultation' }),
      });
      const data = await res.json();
      if (data && data.chiefComplaint) {
        setPreVisitTriage(data);
      } else {
        throw new Error('AI fallback');
      }
    } catch {
      setPreVisitTriage({
        urgency: isHigh ? 'HIGH' : isLow ? 'LOW' : 'MEDIUM',
        chiefComplaint: patient.symptoms || 'General Clinical Consultation',
        suggestedQuestions: [
          'What is the precise onset time and progression of symptoms?',
          'Are there any known drug allergies or active medications?',
          'Have you noticed aggravating triggers or related discomfort?'
        ],
      });
    } finally {
      setAiTriageLoading(false);
    }
  };

  // Reschedule Slot Availability Check (strictly for assigned doctor on target date)
  const isRescheduleDoctorOnLeave = useMemo(() => {
    if (!reschedulingApt) return null;
    const docClean = cleanDoctorName(reschedulingApt.doctorName);
    const docId = reschedulingApt.doctorId;

    return leaves.find(l => {
      if (l.leaveDate !== rescheduleDate) return false;
      const lDocClean = cleanDoctorName(l.doctorName);
      return (l.doctorId && l.doctorId === docId) || (lDocClean && (lDocClean.includes(docClean) || docClean.includes(lDocClean)));
    });
  }, [reschedulingApt, rescheduleDate, leaves]);

  const getRescheduleSlotStatus = (slot: string) => {
    if (isRescheduleDoctorOnLeave) {
      return {
        available: false,
        reason: 'Doctor on Leave'
      };
    }

    if (!reschedulingApt) return { available: true, reason: 'Available' };

    const docClean = cleanDoctorName(reschedulingApt.doctorName);
    const docId = reschedulingApt.doctorId;

    const existingBooking = allAppointments.find(a => {
      if (a.id === reschedulingApt.id) return false;
      if (a.date !== rescheduleDate || a.timeSlot !== slot) return false;
      if (a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;

      const aDocClean = cleanDoctorName(a.doctorName);
      const isSameDoctor = (a.doctorId && a.doctorId === docId) || (aDocClean && aDocClean.includes(docClean));
      return isSameDoctor;
    });

    if (existingBooking) {
      return {
        available: false,
        reason: 'Already Booked'
      };
    }

    return {
      available: true,
      reason: 'Available'
    };
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt) return;

    if (isRescheduleDoctorOnLeave) {
      alert(`Cannot reschedule: Doctor is on approved leave on ${rescheduleDate}.`);
      return;
    }

    const slotStatus = getRescheduleSlotStatus(rescheduleSlot);
    if (!slotStatus.available) {
      alert(`Cannot reschedule: Selected slot (${rescheduleSlot}) is ${slotStatus.reason}. Please pick a green available slot.`);
      return;
    }

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
    await fetch('/api/sync/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointments: updatedAppts })
    });

    setReschedulingApt(null);
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
      const patientIndex = ehrRegistry.findIndex((p) => getNormalizedPatientKey(p.patientEmail, p.patientName) === canonicalKey);

      let updatedEHR: PatientEHR[];
      if (patientIndex > -1) {
        updatedEHR = [...ehrRegistry];
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
          ...ehrRegistry
        ];
      }

      const cleanedEHR = deduplicateEHR(updatedEHR);
      setEhrRegistry(cleanedEHR);
      await fetch('/api/sync/ehr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ehrRegistry: cleanedEHR })
      });
    } catch {}

    try {
      const updatedAppts = allAppointments.map(a => a.id === completedPatientId ? { ...a, status: 'COMPLETED' } : a);
      setAllAppointments(updatedAppts);
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
      (p.patientName || '').toLowerCase().includes(q) || 
      (p.patientEmail || '').toLowerCase().includes(q)
    );
  }, [ehrRegistry, searchEhr]);

  const activePatientHistory = useMemo(() => {
    if (!activePatient) return [];
    const canonicalKey = getNormalizedPatientKey(activePatient.patientEmail, activePatient.patientName);
    const matched = ehrRegistry.find(p => getNormalizedPatientKey(p.patientEmail, p.patientName) === canonicalKey);
    return matched ? matched.visits : [];
  }, [activePatient, ehrRegistry]);

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

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('CLINICAL')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                  activeTab === 'CLINICAL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Queue ({activeQueue.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LEAVE_AFFECTED')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'LEAVE_AFFECTED' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarX2 className="w-3.5 h-3.5" /> Due to Dr. on Leave ({leaveAffectedAppointments.length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('EHR'); loadData(); }}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'EHR' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Patient EHR ({ehrRegistry.length})
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('PROFILE')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
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
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
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

                    <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                      {activeQueue.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                          <Users className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="font-semibold text-slate-400">Queue is Clear</p>
                          <p className="text-[11px]">No active patient bookings in this queue.</p>
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
                                  <p className="text-[11px] text-slate-400 font-mono">{p.patientEmail}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono text-emerald-400 font-bold block">{p.timeSlot}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{p.tokenNumber}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
                                <span>Assigned Dr: <strong className="text-slate-300">{p.doctorName}</strong></span>
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

                {/* CONSULTATION & AI TRIAGE COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                  {activePatient ? (
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                      
                      {/* HEADER */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Patient Consultation</span>
                          <h3 className="font-extrabold text-xl text-white">{activePatient.patientName}</h3>
                          <p className="text-xs text-slate-400">{activePatient.patientEmail} • {activePatient.age} Yrs • {activePatient.gender}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          {activePatient.timeSlot} ({activePatient.tokenNumber})
                        </span>
                      </div>

                      {/* 1. AI PRE-VISIT SYMPTOM TRIAGE SUMMARY */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 to-slate-950 border border-blue-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span>AI Pre-Consultation Symptom Analysis</span>
                          </div>
                          {preVisitTriage && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              preVisitTriage.urgency === 'HIGH'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : preVisitTriage.urgency === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {preVisitTriage.urgency} Urgency
                            </span>
                          )}
                        </div>

                        {aiTriageLoading ? (
                          <div className="text-xs text-slate-400 animate-pulse py-2">
                            Analyzing symptoms with clinical AI model...
                          </div>
                        ) : preVisitTriage ? (
                          <div className="space-y-2 text-xs">
                            <p className="text-slate-300">
                              <strong>Reported Chief Complaint:</strong> {preVisitTriage.chiefComplaint}
                            </p>
                            <div>
                              <strong className="text-slate-400 block mb-1">Recommended Clinical Exploration Questions:</strong>
                              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                                {preVisitTriage.suggestedQuestions.map((q, idx) => (
                                  <li key={idx} className="leading-relaxed">{q}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* 2. PRIOR PATIENT ENCOUNTERS (HISTORICAL EHR) */}
                      {activePatientHistory.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" /> Past Encounter History ({activePatientHistory.length} Visits)
                          </span>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                            {activePatientHistory.map((visit, i) => (
                              <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
                                <div className="flex justify-between text-slate-400">
                                  <span>{visit.date} • {visit.doctorName}</span>
                                  <span className="text-emerald-400 font-semibold">{visit.prescription.medication}</span>
                                </div>
                                <p className="text-slate-300 italic">&quot;{visit.clinicalNotes}&quot;</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. CLINICAL NOTES & PRESCRIPTION FORM */}
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
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <span className="block text-[11px] text-slate-400 mb-1">Interval (Hours)</span>
                              <input
                                type="number"
                                required
                                value={frequencyHours}
                                onChange={(e) => setFrequencyHours(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2"
                        >
                          {loading ? 'Finalizing with AI...' : (<><Send className="w-4 h-4" /> Finalize Consultation & Synchronize EHR</>)}
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
                  <span>Appointments Shifted Due to Doctor on Leave ({leaveAffectedAppointments.length})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  These patient appointments were displaced due to an approved leave date. Click <strong>&quot;Reschedule Slot&quot;</strong> to allocate a new date and strictly available time.
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
                          // Find first available slot
                          setRescheduleSlot('10:00 AM');
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

          {/* TAB 3: LONGITUDINAL EHR REGISTRY */}
          {activeTab === 'EHR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" /> Longitudinal Patient EHR Registry
                  </h2>
                  <p className="text-xs text-slate-400">
                    Unified records synchronized from cloud database grouped by unique patient email and name.
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
                            {patient.visits.length} Encounters
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

          {/* TAB 4: EDIT DOCTOR DETAILS */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-5 text-xs">
                
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
                    <Edit3 className="w-3.5 h-3.5" /> Doctor Profile Management
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Edit Doctor Credentials & Practice Info</h3>
                  <p className="text-slate-400 mt-1">Updates will reflect immediately in the public booking registry across all devices.</p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Doctor Full Name</label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Specialisation Department</label>
                    <select
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
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
                    <label className="block text-slate-400 font-semibold mb-1">Degrees & Qualifications</label>
                    <input
                      type="text"
                      required
                      value={docQualification}
                      onChange={(e) => setDocQualification(e.target.value)}
                      placeholder="e.g. MD, DM (Cardiology - AIIMS Delhi)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Years of Clinical Experience</label>
                    <input
                      type="text"
                      required
                      value={docExperience}
                      onChange={(e) => setDocExperience(e.target.value)}
                      placeholder="e.g. 14 Years Practice"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Affiliated Hospital / Clinic</label>
                    <input
                      type="text"
                      required
                      value={docHospital}
                      onChange={(e) => setDocHospital(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Consultation Fee</label>
                    <input
                      type="text"
                      required
                      value={docFee}
                      onChange={(e) => setDocFee(e.target.value)}
                      placeholder="e.g. ₹1,200"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Physician Bio & Clinical Focus</label>
                  <textarea
                    rows={3}
                    required
                    value={docBio}
                    onChange={(e) => setDocBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save & Broadcast Doctor Profile Across Devices
                </button>
              </form>
            </div>
          )}

        </main>

        {/* MODAL: VIEW FULL EHR RECORD */}
        <AnimatePresence>
          {selectedEhrPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1 inline-block">
                      Patient Longitudinal Health Record
                    </span>
                    <h3 className="text-2xl font-bold text-white">{selectedEhrPatient.patientName}</h3>
                    <p className="text-xs text-slate-400">{selectedEhrPatient.patientEmail} • {selectedEhrPatient.age} Yrs • {selectedEhrPatient.gender}</p>
                  </div>
                  <button onClick={() => setSelectedEhrPatient(null)} className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Clinical Encounters ({selectedEhrPatient.visits.length})
                  </h4>

                  {selectedEhrPatient.visits.map((v, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-white text-sm block">{v.date}</strong>
                          <span className="text-slate-400">{v.doctorName} ({v.department})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                          {v.invoice.invoiceNumber}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                        <p><strong>Chief Symptoms:</strong> {v.symptoms}</p>
                        <p><strong>Examination Notes:</strong> {v.clinicalNotes}</p>
                        <p><strong>Prescription:</strong> <span className="text-emerald-400 font-semibold">{v.prescription.medication}</span> (Every {v.prescription.frequencyHours}h for {v.prescription.durationDays} days)</p>
                      </div>

                      {v.aiPostVisitSummary && (
                        <div className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-900">
                          {v.aiPostVisitSummary.patientSummary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEhrPatient(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Close Record
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RESCHEDULE MODAL (ONLY OFFERS VALID AVAILABLE SLOTS) */}
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
                    <p className="text-xs text-slate-400">Doctor: <strong>{reschedulingApt.doctorName}</strong> • Token {reschedulingApt.tokenNumber}</p>
                  </div>
                  <button onClick={() => setReschedulingApt(null)} className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* DOCTOR ON LEAVE WARNING */}
                {isRescheduleDoctorOnLeave && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">{reschedulingApt.doctorName} is on Leave on {rescheduleDate}</strong>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">Please pick another date to view free consultation slots.</p>
                    </div>
                  </div>
                )}

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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-400 font-semibold">Available Consultation Slots Only</label>
                      <span className="text-[10px] text-slate-500">1 patient per slot</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const status = getRescheduleSlotStatus(slot);
                        const isSelected = rescheduleSlot === slot && status.available;

                        if (!status.available) {
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled
                              className="py-2 px-2.5 rounded-xl font-bold border text-center opacity-40 bg-red-950/20 border-red-500/30 text-red-300 cursor-not-allowed flex flex-col justify-center items-center"
                            >
                              <span>{slot}</span>
                              <span className="text-[8px] text-red-400 font-normal">{status.reason}</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setRescheduleSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl font-bold border transition text-center flex flex-col justify-center items-center ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span>{slot}</span>
                            <span className={`text-[8px] ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}>Available</span>
                          </button>
                        );
                      })}
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
                      disabled={Boolean(isRescheduleDoctorOnLeave) || !getRescheduleSlotStatus(rescheduleSlot).available}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-40"
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




