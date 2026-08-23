'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Calendar, Clock, User, CheckCircle2, 
  AlertCircle, Search, Trash2, Check, X, 
  Stethoscope, Users, RefreshCw, Award, Filter, ArrowRight,
  CheckCheck, Archive, FileText, BadgeCheck, CalendarX2,
  Edit3, UserX, Building2, Briefcase, DollarSign, Save, AlertTriangle
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

interface DoctorApplication {
  id: string;
  name: string;
  email: string;
  regNumber: string;
  specialisation: string;
  qualification: string;
  experience: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  finalizedAt?: string;
}

interface LeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
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

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CONSULTATIONS' | 'DONE' | 'DOCTORS' | 'LEAVES'>('CONSULTATIONS');
  
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctorProfiles, setDoctorProfiles] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Admin Doctor Editor State
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorProfile | null>(null);

  // Leave Form State
  const [leaveDoctorName, setLeaveDoctorName] = useState('Dr. Ritika Kushwaha');
  const [leaveDoctorSpec, setLeaveDoctorSpec] = useState('Cardiology');
  const [leaveDate, setLeaveDate] = useState('2026-08-28');
  const [leaveReason, setLeaveReason] = useState('Medical Conference');

  const loadData = () => {
    try {
      const storedAppts = localStorage.getItem('primecare_appointments');
      if (storedAppts) setAppointments(JSON.parse(storedAppts));
    } catch {}

    try {
      const storedRoster = localStorage.getItem('primecare_doctor_profiles');
      if (storedRoster) {
        setDoctorProfiles(JSON.parse(storedRoster));
      } else {
        localStorage.setItem('primecare_doctor_profiles', JSON.stringify(DEFAULT_DOCTORS));
        setDoctorProfiles(DEFAULT_DOCTORS);
      }
    } catch {
      setDoctorProfiles(DEFAULT_DOCTORS);
    }

    try {
      const storedApps = localStorage.getItem('primecare_doctor_applications');
      if (storedApps) setDoctorApplications(JSON.parse(storedApps));
    } catch {}

    try {
      const storedLeaves = localStorage.getItem('primecare_leaves');
      if (storedLeaves) setLeaves(JSON.parse(storedLeaves));
    } catch {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [user]);

  // Section 1: Active Consultations
  const activeConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(a => {
      if (!a || a.status === 'COMPLETED') return false;
      return `${a.patientName || ''} ${a.patientEmail || ''} ${a.doctorName || ''} ${a.department || ''} ${a.tokenNumber || ''}`.toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  // Section 2: Finalized / Done Consultations
  const doneConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(a => {
      if (!a || a.status !== 'COMPLETED') return false;
      return `${a.patientName || ''} ${a.patientEmail || ''} ${a.doctorName || ''} ${a.department || ''} ${a.tokenNumber || ''}`.toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  // Section 3: Filtered Doctors
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return doctorProfiles.filter(d => 
      `${d.name || ''} ${d.specialisation || ''} ${d.email || ''} ${d.hospital || ''}`.toLowerCase().includes(q)
    );
  }, [doctorProfiles, searchQuery]);

  // Admin Manual Action: Mark as Done
  const handleMarkAsDone = (aptId: string) => {
    try {
      const updated = appointments.map(a => {
        if (a.id === aptId) {
          return {
            ...a,
            status: 'COMPLETED' as const,
            finalizedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
        }
        return a;
      });

      localStorage.setItem('primecare_appointments', JSON.stringify(updated));
      setAppointments(updated);
      setActionSuccessMsg('Consultation marked as Done and moved to Finalized Archive.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update status.');
    }
  };

  // ADMIN ACTION: SAVE EDITED DOCTOR DETAILS
  const handleSaveDoctorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      const updatedRoster = doctorProfiles.map(d => d.id === editingDoctor.id ? editingDoctor : d);
      localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));
      setDoctorProfiles(updatedRoster);

      // Cascade updated name/fee to all active appointments for this doctor
      const updatedAppointments = appointments.map(a => {
        if (a.doctorId === editingDoctor.id || a.doctorEmail?.toLowerCase() === editingDoctor.email?.toLowerCase()) {
          return {
            ...a,
            doctorName: editingDoctor.name,
            department: editingDoctor.specialisation,
            fee: editingDoctor.fee
          };
        }
        return a;
      });
      localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);

      setEditingDoctor(null);
      setActionSuccessMsg(`Doctor profile for ${editingDoctor.name} updated successfully.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update doctor details.');
    }
  };

  // ADMIN ACTION: PERMANENTLY REMOVE DOCTOR ACCOUNT
  const handlePermanentDoctorRemoval = (doctor: DoctorProfile) => {
    try {
      const docEmailClean = (doctor.email || '').toLowerCase().trim();
      const docId = doctor.id;

      // 1. Remove from live doctor roster
      const updatedRoster = doctorProfiles.filter(d => d.id !== docId && (d.email || '').toLowerCase().trim() !== docEmailClean);
      localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));
      setDoctorProfiles(updatedRoster);

      // 2. Remove onboarding applications & registered user authentication entry
      const storedApps: DoctorApplication[] = JSON.parse(localStorage.getItem('primecare_doctor_applications') || '[]');
      const filteredApps = storedApps.filter(a => (a.email || '').toLowerCase().trim() !== docEmailClean);
      localStorage.setItem('primecare_doctor_applications', JSON.stringify(filteredApps));
      setDoctorApplications(filteredApps);

      const storedUsers = JSON.parse(localStorage.getItem('primecare_registered_users') || '[]');
      const filteredUsers = storedUsers.filter((u: any) => (u.email || '').toLowerCase().trim() !== docEmailClean);
      localStorage.setItem('primecare_registered_users', JSON.stringify(filteredUsers));

      // 3. Purge doctor authentication credentials
      localStorage.removeItem(`role_pwd_doctor_${docEmailClean}`);
      localStorage.removeItem(`role_pwd_ADMIN_${docEmailClean}`);

      // 4. Clean up doctor leaves
      const updatedLeaves = leaves.filter(l => l.doctorId !== docId && l.doctorName.toLowerCase() !== doctor.name.toLowerCase());
      localStorage.setItem('primecare_leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves);

      setDoctorToDelete(null);
      setActionSuccessMsg(`Doctor account for ${doctor.name} (${doctor.email}) has been permanently deleted.`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
    } catch {
      alert('Failed to delete doctor account.');
    }
  };

  // Doctor Application Approval
  const handleApproveDoctor = (app: DoctorApplication) => {
    try {
      const updatedApps = doctorApplications.map(a => a.id === app.id ? { ...a, status: 'APPROVED' as const } : a);
      localStorage.setItem('primecare_doctor_applications', JSON.stringify(updatedApps));
      setDoctorApplications(updatedApps);

      const newDocProfile: DoctorProfile = {
        id: app.id,
        email: app.email,
        name: app.name,
        specialisation: app.specialisation,
        qualification: app.qualification,
        experience: app.experience,
        hospital: 'PrimeCare Multispecialty Hospital',
        fee: '₹1,200',
        rating: '5.0 ★',
        bio: `Verified Clinical Specialist in ${app.specialisation}. NMC/MCI Reg: ${app.regNumber}`
      };
      const updatedRoster = [newDocProfile, ...doctorProfiles];
      localStorage.setItem('primecare_doctor_profiles', JSON.stringify(updatedRoster));
      setDoctorProfiles(updatedRoster);

      setActionSuccessMsg(`Physician ${app.name} approved and granted directory access.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {}
  };

  const handleRejectDoctor = (appId: string) => {
    const updatedApps = doctorApplications.map(a => a.id === appId ? { ...a, status: 'REJECTED' as const } : a);
    localStorage.setItem('primecare_doctor_applications', JSON.stringify(updatedApps));
    setDoctorApplications(updatedApps);
  };

  // Leave Management
    const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMsg('Recording leave & notifying affected patients...');

    const docClean = leaveDoctorName.toLowerCase().replace('dr. ', '').trim();

    // 1. Find doctor ID from roster
    const matchedDoc = doctorProfiles.find(d => 
      d.name.toLowerCase().replace('dr. ', '').trim() === docClean ||
      d.name.toLowerCase().includes(docClean)
    );

    const docId = matchedDoc ? matchedDoc.id : 'doc-auto';

    const newLeave: LeaveRecord = {
      id: 'leave-' + Date.now(),
      doctorId: docId,
      doctorName: leaveDoctorName.startsWith('Dr.') ? leaveDoctorName : \Dr. \\,
      specialisation: leaveDoctorSpec,
      leaveDate,
      reason: leaveReason
    };

    const updatedLeaves = [newLeave, ...leaves];
    localStorage.setItem('primecare_leaves', JSON.stringify(updatedLeaves));
    setLeaves(updatedLeaves);

    // 2. Identify affected patients booked on this date for this doctor
    const affected = appointments.filter(a => {
      if (a.date !== leaveDate || a.status === 'COMPLETED' || a.status === 'CANCELLED') return false;
      const aDoc = (a.doctorName || '').toLowerCase().replace('dr. ', '').trim();
      return (a.doctorId && a.doctorId === docId) || aDoc.includes(docClean);
    });

    // 3. Mark affected appointments as CANCELLED / RESCHEDULE REQUIRED
    if (affected.length > 0) {
      const updatedAppts = appointments.map(a => {
        const isAffected = affected.some(aff => aff.id === a.id);
        return isAffected ? { ...a, status: 'CANCELLED' as const } : a;
      });
      localStorage.setItem('primecare_appointments', JSON.stringify(updatedAppts));
      setAppointments(updatedAppts);
    }

    // 4. Dispatch Email Reschedule Notices via API
    try {
      const res = await fetch('/api/admin/leave-reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: newLeave.doctorName,
          specialisation: leaveDoctorSpec,
          leaveDate,
          reason: leaveReason,
          affectedAppointments: affected
        })
      });
      const data = await res.json();
      setActionSuccessMsg(data.message || \Leave recorded. Reschedule notices sent to \ patient(s).\);
    } catch {
      setActionSuccessMsg(\Leave recorded. Affected \ appointment(s) flagged for reschedule.\);
    }

    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const handleDeleteLeave = (id: string) => {
    const updated = leaves.filter(l => l.id !== id);
    localStorage.setItem('primecare_leaves', JSON.stringify(updated));
    setLeaves(updated);
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
          
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrative Management Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Clinic Operations & Doctor Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full authority to track consultations, verify doctors, edit physician details, or permanently delete accounts.
              </p>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('CONSULTATIONS')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'CONSULTATIONS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Active Queue ({activeConsultations.length})
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('DONE')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'DONE' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" /> Finalized ({doneConsultations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('DOCTORS')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'DOCTORS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Directory ({doctorProfiles.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LEAVES')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'LEAVES' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarX2 className="w-3.5 h-3.5" /> Doctor Leaves ({leaves.length})
              </button>
            </div>
          </div>

          {/* ACTION NOTIFICATION */}
          <AnimatePresence>
            {actionSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-2xl flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{actionSuccessMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, doctor, specialty, or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={loadData}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold self-end sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
            </button>
          </div>

          {/* TAB 1: ACTIVE CONSULTATIONS */}
          {activeTab === 'CONSULTATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Active Outpatient Queue ({activeConsultations.length})
                </h2>
                <span className="text-xs text-slate-400">Mark as Done manually or wait for Doctor finalization</span>
              </div>

              {activeConsultations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">Active Queue is Clear</p>
                  <p className="text-xs text-slate-500">All appointments have been completed or moved to the Done archive.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeConsultations.map((a) => (
                    <div key={a.id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                              Active • Token {a.tokenNumber}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-0.5">{a.patientName}</h3>
                            <p className="text-[11px] text-slate-400 font-mono">{a.patientEmail}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            {a.fee || '₹1,200'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Attending Doctor:</span>
                            <strong className="text-slate-200">{a.doctorName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Specialisation:</span>
                            <span className="text-emerald-400">{a.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Scheduled:</span>
                            <span className="text-slate-300">{a.date} at {a.timeSlot}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Chief Complaint:</span>
                          <p className="text-xs text-slate-300 italic line-clamp-2">&quot;{a.symptoms}&quot;</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkAsDone(a.id)}
                        className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Consultation as Done
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FINALIZED CONSULTATIONS (DONE) */}
          {activeTab === 'DONE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" /> Finalized & Done Consultations ({doneConsultations.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Consultations completed by physicians or marked as done by administrators.
                  </p>
                </div>
              </div>

              {doneConsultations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <Archive className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">No Finalized Consultations Yet</p>
                  <p className="text-xs text-slate-500">When doctors finalize consultations or click 'Mark as Done', records move here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {doneConsultations.map((a) => (
                    <div key={a.id} className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1">
                              <CheckCircle2 className="w-3 h-3" /> Done • Token {a.tokenNumber}
                            </div>
                            <h3 className="text-lg font-bold text-white">{a.patientName}</h3>
                            <p className="text-[11px] text-slate-400 font-mono">{a.patientEmail}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            {a.fee || '₹1,200'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Attending Doctor:</span>
                            <strong className="text-slate-200">{a.doctorName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Department:</span>
                            <span className="text-emerald-400 font-semibold">{a.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Consultation Date:</span>
                            <span className="text-slate-300">{a.date} • {a.timeSlot}</span>
                          </div>
                          {a.finalizedAt && (
                            <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                              <span>Finalized At:</span>
                              <span className="text-emerald-300 font-mono">{a.finalizedAt}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Chief Complaint:</span>
                          <p className="text-xs text-slate-300 italic">&quot;{a.symptoms}&quot;</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <BadgeCheck className="w-3.5 h-3.5" /> Care Plan Dispatched
                        </span>
                        <span className="font-mono text-slate-500">{a.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCTOR DIRECTORY & PERMANENT ACCOUNT DELETION */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-6">
              
              {/* SECTION A: PENDING ONBOARDING APPLICATIONS */}
              {doctorApplications.filter(a => a.status === 'PENDING').length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Pending Doctor Verification Applications ({doctorApplications.filter(a => a.status === 'PENDING').length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctorApplications.filter(a => a.status === 'PENDING').map(app => (
                      <div key={app.id} className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-white">{app.name}</h4>
                            <p className="text-slate-400 font-mono">{app.email}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
                            Pending
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <p><strong>NMC/MCI ID:</strong> <span className="text-blue-400 uppercase font-mono">{app.regNumber}</span></p>
                          <p><strong>Specialisation:</strong> {app.specialisation}</p>
                          <p><strong>Qualification:</strong> {app.qualification}</p>
                          <p><strong>Experience:</strong> {app.experience}</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveDoctor(app)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDoctor(app.id)}
                            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold rounded-xl text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: ACTIVE REGISTERED DOCTOR ROSTER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Active Doctor Roster ({filteredDoctors.length})
                  </h3>
                  <span className="text-xs text-slate-400">Admins can edit credentials or permanently remove accounts</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDoctors.map((doc) => (
                    <div key={doc.id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-base text-white">{doc.name}</h4>
                            <span className="text-xs font-semibold text-emerald-400">{doc.specialisation}</span>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.email}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            {doc.fee}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                          <p><strong>Qualification:</strong> {doc.qualification}</p>
                          <p><strong>Experience:</strong> {doc.experience}</p>
                          <p><strong>Hospital:</strong> {doc.hospital}</p>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 italic">
                          &quot;{doc.bio}&quot;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingDoctor(doc)}
                          className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Details
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setDoctorToDelete(doc)}
                          className="py-2 px-3 bg-red-950/30 hover:bg-red-900/50 border border-red-500/40 text-red-400 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                          title="Permanently remove doctor account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: DOCTOR LEAVES */}
          {activeTab === 'LEAVES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <form onSubmit={handleAddLeave} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <CalendarX2 className="w-4 h-4 text-amber-400" /> Record Doctor Leave
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      required
                      value={leaveDoctorName}
                      onChange={(e) => setLeaveDoctorName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Specialisation</label>
                    <select
                      value={leaveDoctorSpec}
                      onChange={(e) => setLeaveDoctorSpec(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Leave Date</label>
                    <input
                      type="date"
                      required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason / Note</label>
                    <input
                      type="text"
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Lock Doctor Availability on Date
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-bold text-base text-white">Active Approved Leaves ({leaves.length})</h3>
                {leaves.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/40">
                    No doctor leaves currently scheduled.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                    {leaves.map((l) => (
                      <div key={l.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white text-sm block">{l.doctorName}</strong>
                          <span className="text-emerald-400">{l.specialisation}</span>
                          <span className="text-slate-400 ml-2">• Date: <strong className="text-amber-300">{l.leaveDate}</strong></span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{l.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(l.id)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* MODAL 1: ADMIN EDIT DOCTOR DETAILS */}
        <AnimatePresence>
          {editingDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Admin: Edit Doctor Profile</h3>
                    <p className="text-xs text-slate-400">Modifying credentials for {editingDoctor.email}</p>
                  </div>
                  <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveDoctorEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Doctor Name</label>
                      <input
                        type="text"
                        required
                        value={editingDoctor.name}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Specialisation</label>
                      <select
                        value={editingDoctor.specialisation}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, specialisation: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
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
                      <label className="block text-slate-400 font-semibold mb-1">Qualifications</label>
                      <input
                        type="text"
                        required
                        value={editingDoctor.qualification}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Experience</label>
                      <input
                        type="text"
                        required
                        value={editingDoctor.experience}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Affiliated Hospital</label>
                      <input
                        type="text"
                        required
                        value={editingDoctor.hospital}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, hospital: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Consultation Fee</label>
                      <input
                        type="text"
                        required
                        value={editingDoctor.fee}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, fee: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Physician Bio & Clinical Specialties</label>
                    <textarea
                      rows={3}
                      required
                      value={editingDoctor.bio}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingDoctor(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      Save Doctor Details
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: CONFIRM PERMANENT DOCTOR ACCOUNT REMOVAL */}
        <AnimatePresence>
          {doctorToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/40 shadow-2xl space-y-5"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <UserX className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Permanently Remove Doctor?</h3>
                    <p className="text-xs text-red-400">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  Are you sure you want to delete <strong className="text-white">{doctorToDelete.name}</strong> (<span className="text-slate-400">{doctorToDelete.email}</span>)?
                  This will revoke their login access, remove their clinical profile, and remove them from all public appointment booking schedules.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDoctorToDelete(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePermanentDoctorRemoval(doctorToDelete)}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-red-600/30"
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}


