'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle, AlertCircle, Stethoscope, 
  Calendar, Trash2, Search, Clock, ShieldCheck, 
  Check, X, Edit3, Save, Eye, Plus, Pill, Lock, 
  MailWarning, Send, Users, CalendarCheck, Sparkles, HelpCircle,
  Building2, Award, UserPlus
} from 'lucide-react';

interface DoctorApp {
  id: string;
  name: string;
  email: string;
  password?: string;
  regNumber?: string;
  specialisation: string;
  qualification: string;
  experience: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DoctorProfile {
  id: string;
  name: string;
  email?: string;
  regNumber?: string;
  specialisation: string;
  qualification: string;
  experience: string;
  hospital: string;
  fee: string;
}

interface LeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
}

interface AppointmentItem {
  id: string;
  tokenNumber?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  department?: string;
  patientName: string;
  patientEmail: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  aiUrgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  aiChiefComplaint?: string;
  aiQuestions?: string[];
  status: string;
}

interface EHRRecord {
  patientKey: string;
  patientName: string;
  patientEmail: string;
  visits: Array<{
    visitId: string;
    date: string;
    doctorName: string;
    department: string;
    symptoms: string;
    clinicalNotes: string;
    prescription: {
      medication: string;
      frequencyHours: number;
      durationDays: number;
    };
    aiPostVisitSummary?: {
      patientSummary: string;
      medicationSchedule: string;
      followUpSteps: string;
    };
    invoice: { fee: string };
  }>;
}

const ALL_TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const DEFAULT_DOCTORS: DoctorProfile[] = [
  { id: 'doc-cardio-01', name: 'Dr. Aarav Sharma', email: 'aarav.sharma@primecare.in', regNumber: 'NMC-102931', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200' },
  { id: 'doc-cardio-02', name: 'Dr. Meera Kulkarni', email: 'meera.kulkarni@primecare.in', regNumber: 'NMC-839201', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400' },
  { id: 'doc-neuro-01', name: 'Dr. Priya Nair', email: 'priya.nair@primecare.in', regNumber: 'NMC-749201', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500' },
  { id: 'doc-ortho-01', name: 'Dr. Vikram Patel', email: 'vikram.patel@primecare.in', regNumber: 'NMC-629102', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000' },
  { id: 'doc-pedia-01', name: 'Dr. Ananya Deshmukh', email: 'ananya.deshmukh@primecare.in', regNumber: 'NMC-492019', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900' },
  { id: 'doc-derma-01', name: 'Dr. Rohan Mehta', email: 'rohan.mehta@primecare.in', regNumber: 'NMC-381920', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100' },
];

export default function AdminLeavesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLINICAL_DESK' | 'APPROVALS' | 'MANAGE_DOCTORS' | 'LEAVES_REGRET'>('CLINICAL_DESK');
  
  // Doctor & Applications State
  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [applications, setApplications] = useState<DoctorApp[]>([
    {
      id: 'doc-app-demo-1',
      name: 'Dr. Kavita Sen',
      email: 'kavita.sen@primecare.in',
      regNumber: 'NMC-994821',
      specialisation: 'Neurology',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: '6 Years Practice',
      status: 'PENDING',
    }
  ]);
  const [searchDoctor, setSearchDoctor] = useState('');

  // Selected Physician on Clinical Desk
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(DEFAULT_DOCTORS[0]);
  const [inspectionDate, setInspectionDate] = useState('2026-08-28');
  const [selectedPatientForInspect, setSelectedPatientForInspect] = useState<AppointmentItem | null>(null);

  // Appointments & EHR Registry
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [ehrRegistry, setEhrRegistry] = useState<EHRRecord[]>([]);

  // Leaves State
  const [leavesList, setLeavesList] = useState<LeaveRecord[]>([
    {
      id: 'leave-01',
      doctorId: 'doc-cardio-01',
      doctorName: 'Dr. Aarav Sharma',
      specialisation: 'Cardiology',
      leaveDate: '2026-08-28',
      reason: 'Annual Cardiology Summit',
    }
  ]);
  const [leaveDocId, setLeaveDocId] = useState('doc-cardio-01');
  const [leaveDate, setLeaveDate] = useState('2026-08-28');
  const [leaveReason, setLeaveReason] = useState('Emergency Clinical Absence');

  // Edit Doctor Modal State
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editSpec, setEditSpec] = useState('Cardiology');
  const [editQual, setEditQual] = useState('');
  const [editExp, setEditExp] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editFee, setEditFee] = useState('');

  // Status Reports
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [regretReport, setRegretReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    // 1. Applications
    try {
      const storedApps = localStorage.getItem('primecare_doctor_applications');
      if (storedApps) setApplications(JSON.parse(storedApps));
    } catch {}

    // 2. Doctor Profiles
    try {
      const storedRoster = localStorage.getItem('primecare_doctor_profiles');
      if (storedRoster) {
        const parsed = JSON.parse(storedRoster);
        const map = new Map<string, DoctorProfile>();
        DEFAULT_DOCTORS.forEach(d => map.set(d.id, d));
        parsed.forEach((d: any) => map.set(d.id, d));
        const list = Array.from(map.values());
        setDoctorsList(list);
        if (list.length > 0) setSelectedDoctor(list[0]);
      }
    } catch {}

    // 3. Leaves
    try {
      const storedLeaves = localStorage.getItem('primecare_leaves');
      if (storedLeaves) setLeavesList(JSON.parse(storedLeaves));
    } catch {}

    // 4. Appointments
    try {
      const storedAppts = localStorage.getItem('primecare_appointments');
      if (storedAppts) setAppointments(JSON.parse(storedAppts));
    } catch {}

    // 5. EHR
    try {
      const storedEHR = localStorage.getItem('primecare_ehr_registry');
      if (storedEHR) setEhrRegistry(JSON.parse(storedEHR));
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  // Queue of selected Doctor
  const doctorQueue = useMemo(() => {
    const cleanDoc = selectedDoctor.name.toLowerCase().replace('dr. ', '').trim();
    return appointments.filter(a => {
      const aDoc = (a.doctorName || '').toLowerCase();
      return a.doctorId === selectedDoctor.id || aDoc.includes(cleanDoc);
    });
  }, [appointments, selectedDoctor]);

  useEffect(() => {
    if (doctorQueue.length > 0) {
      setSelectedPatientForInspect(doctorQueue[0]);
    } else {
      setSelectedPatientForInspect(null);
    }
  }, [doctorQueue, selectedDoctor]);

  // Slot Availability on Inspection Date
  const slotInspection = useMemo(() => {
    const bookedMap = new Map<string, AppointmentItem>();
    doctorQueue.forEach(a => {
      if (a.date === inspectionDate && a.status === 'CONFIRMED') {
        bookedMap.set(a.timeSlot, a);
      }
    });

    const isDocOnLeaveOnDate = leavesList.some(
      l => l.doctorId === selectedDoctor.id && l.leaveDate === inspectionDate
    );

    return {
      isDocOnLeaveOnDate,
      bookedCount: bookedMap.size,
      freeCount: isDocOnLeaveOnDate ? 0 : ALL_TIME_SLOTS.length - bookedMap.size,
      slots: ALL_TIME_SLOTS.map(slot => ({
        time: slot,
        isBooked: bookedMap.has(slot),
        bookingDetails: bookedMap.get(slot) || null,
      }))
    };
  }, [doctorQueue, inspectionDate, leavesList, selectedDoctor]);

  // Prescriptions issued by selected Doctor
  const doctorPrescriptions = useMemo(() => {
    const cleanDoc = selectedDoctor.name.toLowerCase().replace('dr. ', '').trim();
    const list: Array<{ patientName: string; patientEmail: string; visit: any }> = [];
    
    ehrRegistry.forEach(p => {
      p.visits?.forEach(v => {
        if ((v.doctorName || '').toLowerCase().includes(cleanDoc)) {
          list.push({ patientName: p.patientName, patientEmail: p.patientEmail, visit: v });
        }
      });
    });
    return list;
  }, [ehrRegistry, selectedDoctor]);

  // 1. APPROVE DOCTOR SIGNUP
  const handleApproveDoctor = (appId: string) => {
    const target = applications.find(a => a.id === appId);
    if (!target) return;

    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: 'APPROVED' as const } : a);
    setApplications(updatedApps);
    localStorage.setItem('primecare_doctor_applications', JSON.stringify(updatedApps));

    const newDoc: DoctorProfile = {
      id: target.id,
      name: target.name,
      email: target.email,
      regNumber: target.regNumber || `NMC-${Math.floor(100000 + Math.random() * 900000)}`,
      specialisation: target.specialisation,
      qualification: target.qualification,
      experience: target.experience,
      hospital: 'PrimeCare Multispecialty Hospital',
      fee: '₹1,200',
    };

    const updatedRoster = [newDoc, ...doctorsList.filter(d => d.id !== target.id)];
    setDoctorsList(updatedRoster);
    localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));

    setActionSuccess(`Physician signup for ${target.name} has been APPROVED and activated onto the public directory.`);
  };

  const handleRejectDoctor = (appId: string) => {
    const updated = applications.filter(a => a.id !== appId);
    setApplications(updated);
    localStorage.setItem('primecare_doctor_applications', JSON.stringify(updated));
    setActionSuccess('Doctor application rejected.');
  };

  // 2. UPDATE / EDIT DOCTOR INFO
  const handleSaveDoctorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    const updatedDoc: DoctorProfile = {
      ...editingDoctor,
      name: editName,
      specialisation: editSpec,
      qualification: editQual,
      experience: editExp,
      hospital: editHospital,
      fee: editFee.startsWith('₹') ? editFee : `₹${editFee}`,
    };

    const updatedRoster = doctorsList.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDoctorsList(updatedRoster);
    localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));

    if (selectedDoctor.id === updatedDoc.id) {
      setSelectedDoctor(updatedDoc);
    }

    setEditingDoctor(null);
    setActionSuccess(`Profile & credentials updated for ${updatedDoc.name}.`);
  };

  // 3. REMOVE / DELETE DOCTOR
  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete ${doctorName} from the hospital directory?`)) return;

    const updatedRoster = doctorsList.filter(d => d.id !== doctorId);
    setDoctorsList(updatedRoster);
    localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));

    const updatedApps = applications.filter(a => a.id !== doctorId);
    setApplications(updatedApps);
    localStorage.setItem('primecare_doctor_applications', JSON.stringify(updatedApps));

    const updatedLeaves = leavesList.filter(l => l.doctorId !== doctorId);
    setLeavesList(updatedLeaves);
    localStorage.setItem('primecare_leaves', JSON.stringify(updatedLeaves));

    if (selectedDoctor.id === doctorId && updatedRoster.length > 0) {
      setSelectedDoctor(updatedRoster[0]);
    }

    setActionSuccess(`${doctorName} has been permanently deleted from hospital rosters.`);
  };

  // 4. LEAVE AUTHORIZATION & REGRET DISPATCH
  const affectedOnLeaveDate = useMemo(() => {
    const targetDoc = doctorsList.find(d => d.id === leaveDocId);
    if (!targetDoc) return [];
    const cleanDoc = targetDoc.name.toLowerCase().replace('dr. ', '').trim();

    return appointments.filter(a => {
      const aDoc = (a.doctorName || '').toLowerCase();
      const matchDoc = a.doctorId === leaveDocId || aDoc.includes(cleanDoc);
      return matchDoc && a.date === leaveDate && a.status === 'CONFIRMED';
    });
  }, [appointments, leaveDocId, leaveDate, doctorsList]);

  const handleApproveLeaveAndNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegretReport(null);

    const doc = doctorsList.find(d => d.id === leaveDocId);
    if (!doc) {
      setLoading(false);
      return;
    }

    const newLeave: LeaveRecord = {
      id: 'leave-' + Date.now(),
      doctorId: doc.id,
      doctorName: doc.name,
      specialisation: doc.specialisation,
      leaveDate,
      reason: leaveReason,
    };

    const updatedLeaves = [newLeave, ...leavesList];
    setLeavesList(updatedLeaves);
    localStorage.setItem('primecare_leaves', JSON.stringify(updatedLeaves));

    const affected = affectedOnLeaveDate;
    if (affected.length > 0) {
      const updatedAppts = appointments.map(a => {
        const isTarget = affected.some(aff => aff.id === a.id);
        return isTarget ? { ...a, status: 'CANCELLED_DOCTOR_LEAVE' } : a;
      });
      setAppointments(updatedAppts);
      localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppts));

      try {
        const res = await fetch('/api/admin/leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorName: doc.name,
            leaveDate,
            reason: leaveReason,
            affectedPatients: affected,
          }),
        });
        const data = await res.json();
        setRegretReport({
          affectedCount: affected.length,
          notifiedEmails: data.dispatchedEmails || affected.map(a => a.patientEmail),
        });
      } catch {
        setRegretReport({
          affectedCount: affected.length,
          notifiedEmails: affected.map(a => a.patientEmail),
        });
      }
    }

    setActionSuccess(
      `Leave authorized for ${doc.name} on ${leaveDate}. ${affected.length} booked patient(s) notified with Regret & Reschedule instructions.`
    );
    setLoading(false);
  };

  const handleRevokeLeave = (leaveId: string) => {
    const updated = leavesList.filter(l => l.id !== leaveId);
    setLeavesList(updated);
    localStorage.setItem('primecare_leaves', JSON.stringify(updated));
    setActionSuccess('Leave revoked. Doctor slot availability restored.');
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Administrative Master Governance
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Hospital Clinical Desk & Doctor Roster
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Clinical oversight desk, signup approvals, doctor profile management, and leave conflict dispatch.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('CLINICAL_DESK')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'CLINICAL_DESK' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Clinical Desk
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPROVALS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'APPROVALS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Signups ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MANAGE_DOCTORS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'MANAGE_DOCTORS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit / Remove Doctors ({doctorsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('LEAVES_REGRET')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'LEAVES_REGRET' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MailWarning className="w-3.5 h-3.5" /> Leaves & Regret Mail ({leavesList.length})
              </button>
            </div>
          </div>

          <AnimatePresence>
            {actionSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-1 shadow-2xl"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" /> Action Executed
                </div>
                <p className="text-xs text-emerald-400/90 leading-relaxed pl-7">{actionSuccess}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: DOCTOR CLINICAL DESK IN ADMIN LOGIN */}
          {activeTab === 'CLINICAL_DESK' && (
            <div className="space-y-6">
              {/* SELECT PHYSICIAN BAR */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-400" /> Viewing Doctor Clinical Desk as Administrator
                    </h3>
                    <p className="text-xs text-slate-400">Inspect any attending physician&apos;s live queue, AI triage card, free slots, and prescription history</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedDoctor.id}
                      onChange={(e) => {
                        const found = doctorsList.find(d => d.id === e.target.value);
                        if (found) setSelectedDoctor(found);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {doctorsList.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialisation})</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* KPI METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Attending Specialist</span>
                    <p className="text-base font-bold text-white truncate">{selectedDoctor.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedDoctor.specialisation}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Patient Queue</span>
                    <p className="text-xl font-bold text-blue-400">{doctorQueue.length} Active</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Free Slots on {inspectionDate}</span>
                    <p className="text-xl font-bold text-emerald-400">
                      {slotInspection.isDocOnLeaveOnDate ? '0 (On Leave)' : `${slotInspection.freeCount} Slots`}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Prescription Vault</span>
                    <p className="text-xl font-bold text-purple-400">{doctorPrescriptions.length} Records</p>
                  </div>
                </div>
              </div>

              {/* THREE-COLUMN CLINICAL DESK */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. ASSIGNED PATIENT QUEUE */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> Patient Queue ({doctorQueue.length})
                    </span>
                  </div>

                  {doctorQueue.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-950 border border-slate-800">
                      No queued consultations for {selectedDoctor.name}.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {doctorQueue.map(p => {
                        const isSelected = selectedPatientForInspect?.id === p.id;

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPatientForInspect(p)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-sm text-white">{p.patientName}</h4>
                                <p className="text-[11px] text-slate-400">{p.patientEmail}</p>
                              </div>
                              <span className="text-xs font-mono text-emerald-400 font-bold">{p.date} • {p.timeSlot}</span>
                            </div>
                            <p className="text-xs text-slate-300 truncate mt-2 italic">&quot;{p.symptoms}&quot;</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. CLINICAL INTAKE & PRE-VISIT AI SUMMARY (READ-ONLY IN ADMIN) */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Pre-Visit AI Triage Details
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin View</span>
                  </div>

                  {selectedPatientForInspect ? (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Patient Details</span>
                        <h4 className="font-bold text-white text-sm">{selectedPatientForInspect.patientName}</h4>
                        <p className="text-slate-400 font-mono text-[11px]">{selectedPatientForInspect.patientEmail}</p>
                        <p className="text-emerald-400 font-bold mt-1">Slot: {selectedPatientForInspect.date} at {selectedPatientForInspect.timeSlot}</p>
                      </div>

                      <div className="p-4 bg-blue-950/25 border border-blue-500/30 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-300 uppercase text-[10px]">Triage Urgency:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            selectedPatientForInspect.aiUrgency === 'HIGH'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {selectedPatientForInspect.aiUrgency || 'MEDIUM'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-400 uppercase text-[10px] block">Chief Complaint:</strong>
                          <p className="text-slate-200 mt-0.5">{selectedPatientForInspect.aiChiefComplaint || selectedPatientForInspect.symptoms}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <strong className="text-slate-400 uppercase text-[10px] block flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Suggested Clinical Inquiries:
                        </strong>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                          {selectedPatientForInspect.aiQuestions && selectedPatientForInspect.aiQuestions.length > 0 ? (
                            selectedPatientForInspect.aiQuestions.map((q, i) => <li key={i}>{q}</li>)
                          ) : (
                            <>
                              <li>When did symptoms first manifest?</li>
                              <li>Are symptoms aggravated during specific hours?</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-950 border border-slate-800">
                      Select a patient from the queue to inspect their clinical triage summary.
                    </div>
                  )}
                </div>

                {/* 3. FREE SLOTS & PRESCRIPTIONS */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Slot Status */}
                  <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-emerald-400" /> Slot Status ({inspectionDate})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {slotInspection.slots.map((s, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                            s.isBooked
                              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                              : 'bg-slate-950 border-slate-800 text-emerald-400'
                          }`}
                        >
                          <span className="font-mono font-bold">{s.time}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            s.isBooked ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {s.isBooked ? 'Booked' : 'Free Slot'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescriptions */}
                  <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-purple-400" /> Issued Prescriptions ({doctorPrescriptions.length})
                      </span>
                    </div>

                    {doctorPrescriptions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
                        No prescription records for this doctor.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {doctorPrescriptions.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{item.patientName}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{item.visit.date}</span>
                            </div>
                            <span className="font-serif font-bold text-emerald-400 text-[11px] block">℞ {item.visit.prescription?.medication}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPROVE DOCTOR SIGNUPS */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" /> Pending Doctor Signup Applications
                </h3>
                <span className="text-xs font-mono text-slate-400">{applications.length} applications logged</span>
              </div>

              {applications.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                  No doctor signup applications currently pending.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {applications.map((app) => {
                    const isApproved = app.status === 'APPROVED';

                    return (
                      <div
                        key={app.id}
                        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
                          isApproved ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-white">{app.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                isApproved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-400 font-semibold">{app.specialisation}</p>
                            <p className="text-[11px] text-slate-400">{app.email}</p>
                          </div>
                          {app.regNumber && (
                            <span className="text-[10px] font-mono px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {app.regNumber}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                          <p className="text-slate-300"><strong>Degrees:</strong> {app.qualification}</p>
                          <p className="text-slate-400"><strong>Experience:</strong> {app.experience}</p>
                        </div>

                        {!isApproved ? (
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleApproveDoctor(app.id)}
                              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                              <Check className="w-4 h-4" /> Approve Doctor Signup
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectDoctor(app.id)}
                              className="p-2.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl text-xs transition"
                              title="Decline Application"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Active on Hospital Roster
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT, UPDATE & REMOVE DOCTORS */}
          {activeTab === 'MANAGE_DOCTORS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                    placeholder="Search doctor to edit details or delete..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <span className="text-xs font-mono text-emerald-400">{doctorsList.length} total active physicians</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctorsList.filter(d => `${d.name} ${d.specialisation} ${d.hospital}`.toLowerCase().includes(searchDoctor.toLowerCase())).map((doc) => (
                  <div key={doc.id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-white">{doc.name}</h4>
                          <span className="text-xs font-semibold text-emerald-400">{doc.specialisation}</span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          {doc.fee}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                        <p className="text-slate-300"><strong>Degrees:</strong> {doc.qualification}</p>
                        <p className="text-slate-400"><strong>Experience:</strong> {doc.experience}</p>
                        <p className="text-slate-400"><strong>Hospital:</strong> {doc.hospital}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoctor(doc);
                          setEditName(doc.name);
                          setEditSpec(doc.specialisation);
                          setEditQual(doc.qualification);
                          setEditExp(doc.experience);
                          setEditHospital(doc.hospital);
                          setEditFee(doc.fee);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Record
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition flex items-center gap-1"
                        title="Delete Doctor"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LEAVES & REGRET MAIL DISPATCH */}
          {activeTab === 'LEAVES_REGRET' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEAVE FORM */}
              <div className="lg:col-span-5 space-y-6">
                <form onSubmit={handleApproveLeaveAndNotify} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
                    <MailWarning className="w-4 h-4 text-red-400" /> Authorize Leave & Send Regret Mail
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Select Physician</label>
                    <select
                      value={leaveDocId}
                      onChange={(e) => setLeaveDocId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    >
                      {doctorsList.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialisation})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Leave Date</label>
                    <input
                      type="date"
                      required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Reason / Justification</label>
                    <input
                      type="text"
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Clinical Conference / Personal Emergency"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  {/* AFFECTED PATIENT PREVIEW */}
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>Affected Bookings on this Date:</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                        {affectedOnLeaveDate.length} Patients
                      </span>
                    </div>

                    {affectedOnLeaveDate.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-amber-500/20 max-h-28 overflow-y-auto">
                        {affectedOnLeaveDate.map(p => (
                          <div key={p.id} className="text-[11px] text-amber-200/90 flex justify-between">
                            <span>• {p.patientName}</span>
                            <span className="font-mono text-amber-300">{p.timeSlot}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No existing patient bookings overlap with this date.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {loading ? 'Processing & Dispatching...' : (<><Send className="w-4 h-4" /> Authorize Leave & Send Regret Notices</>)}
                  </button>
                </form>
              </div>

              {/* ACTIVE APPROVED LEAVES */}
              <div className="lg:col-span-7 space-y-6">
                {regretReport && (
                  <div className="p-6 rounded-3xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs shadow-xl space-y-2">
                    <h4 className="font-bold text-sm text-blue-100 flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-400" /> Regret Email Dispatch Report
                    </h4>
                    <p className="text-blue-300">
                      Dispatched cancellation notices and reschedule links to <strong>{regretReport.affectedCount}</strong> patient inbox(es):
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-blue-200">
                      {regretReport.notifiedEmails.map((em: string, i: number) => (
                        <li key={i}>{em}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase text-slate-200">
                      Active Authorized Leaves ({leavesList.length})
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {leavesList.map(l => (
                      <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white text-sm">{l.doctorName}</h4>
                          <p className="text-emerald-400 font-semibold">{l.specialisation} • Date: {l.leaveDate}</p>
                          <p className="text-slate-400 italic text-[11px]">&quot;{l.reason}&quot;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevokeLeave(l.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT DOCTOR MODAL */}
          <AnimatePresence>
            {editingDoctor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-lg text-white">Update Physician Information</h3>
                    <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveDoctorEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department</label>
                        <input
                          type="text"
                          required
                          value={editSpec}
                          onChange={(e) => setEditSpec(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Degrees / Qualification</label>
                        <input
                          type="text"
                          required
                          value={editQual}
                          onChange={(e) => setEditQual(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Consultation Fee</label>
                        <input
                          type="text"
                          required
                          value={editFee}
                          onChange={(e) => setEditFee(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hospital / Institute</label>
                        <input
                          type="text"
                          required
                          value={editHospital}
                          onChange={(e) => setEditHospital(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Experience</label>
                        <input
                          type="text"
                          required
                          value={editExp}
                          onChange={(e) => setEditExp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingDoctor(null)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                      >
                        Save Updated Details
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
