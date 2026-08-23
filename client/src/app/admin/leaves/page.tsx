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
  CheckCheck, Archive, FileText, BadgeCheck, CalendarX2
} from 'lucide-react';

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
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  finalizedAt?: string;
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

interface LeaveRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CONSULTATIONS' | 'DONE' | 'DOCTORS' | 'LEAVES'>('CONSULTATIONS');
  
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Leave Form State
  const [leaveDoctorName, setLeaveDoctorName] = useState('Dr. Ritika Kushwaha');
  const [leaveDoctorSpec, setLeaveDoctorSpec] = useState('Cardiology');
  const [leaveDate, setLeaveDate] = useState('2026-08-28');
  const [leaveReason, setLeaveReason] = useState('Medical Conference');

  const loadData = () => {
    try {
      const storedAppts = localStorage.getItem('primecare_appointments');
      if (storedAppts) {
        setAppointments(JSON.parse(storedAppts));
      }
    } catch {}

    try {
      const storedApps = localStorage.getItem('primecare_doctor_applications');
      if (storedApps) {
        setDoctorApplications(JSON.parse(storedApps));
      }
    } catch {}

    try {
      const storedLeaves = localStorage.getItem('primecare_leaves');
      if (storedLeaves) {
        setLeaves(JSON.parse(storedLeaves));
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [user]);

  // Section 1: Active Consultations (Pending / Confirmed)
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

  // Admin Manual Action: Mark as Done / Finalize Consultation
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
      setActionSuccessMsg('Consultation finalized and moved to "Done / Finalized Consultations" section.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update status.');
    }
  };

  // Doctor Approval
  const handleApproveDoctor = (app: DoctorApplication) => {
    try {
      const updatedApps = doctorApplications.map(a => a.id === app.id ? { ...a, status: 'APPROVED' as const } : a);
      localStorage.setItem('primecare_doctor_applications', JSON.stringify(updatedApps));
      setDoctorApplications(updatedApps);

      const storedRoster = JSON.parse(localStorage.getItem('primecare_doctor_profiles') || '[]');
      const newDocProfile = {
        id: app.id,
        email: app.email,
        name: app.name,
        specialisation: app.specialisation,
        qualification: app.qualification,
        experience: app.experience,
        hospital: 'PrimeCare Multispecialty Hospital',
        fee: '₹1,200',
        rating: '5.0 ★',
        bio: `Verified Specialist in ${app.specialisation}. NMC/MCI Reg: ${app.regNumber}`
      };
      localStorage.setItem('primecare_doctor_profiles', JSON.stringify([newDocProfile, ...storedRoster]));
      setActionSuccessMsg(`Physician ${app.name} approved and added to live roster.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {}
  };

  // Leave Management
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave: LeaveRecord = {
      id: 'leave-' + Date.now(),
      doctorId: 'doc-auto',
      doctorName: leaveDoctorName,
      specialisation: leaveDoctorSpec,
      leaveDate,
      reason: leaveReason
    };
    const updated = [newLeave, ...leaves];
    localStorage.setItem('primecare_leaves', JSON.stringify(updated));
    setLeaves(updated);
    setActionSuccessMsg(`Leave recorded for ${leaveDoctorName} on ${leaveDate}.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
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
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrative Management Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Clinic Operations & Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time consultation tracking, doctor verification, and duty scheduling.
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
                <CheckCheck className="w-3.5 h-3.5" /> Finalized Consultations ({doneConsultations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('DOCTORS')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'DOCTORS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Verification ({doctorApplications.filter(a => a.status === 'PENDING').length})
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

          {/* SUCCESS BANNER */}
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
                placeholder="Search by patient, doctor, token, or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={loadData}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold self-end sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Dashboard Data
            </button>
          </div>

          {/* TAB 1: ACTIVE CONSULTATIONS (AWAITING DOCTOR) */}
          {activeTab === 'CONSULTATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Active Outpatient Queue ({activeConsultations.length})
                </h2>
                <span className="text-xs text-slate-400">Mark as Done manually or via Doctor Consultation finalization</span>
              </div>

              {activeConsultations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">Active Queue is Empty</p>
                  <p className="text-xs text-slate-500">All appointments have either been finalized or no patients are currently queued.</p>
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

          {/* TAB 2: FINALIZED CONSULTATIONS (DONE SECTION) */}
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
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Archive Status: Stored
                </span>
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

          {/* TAB 3: DOCTOR APPLICATIONS & ONBOARDING */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" /> Physician Verification Applications ({doctorApplications.length})
              </h2>

              {doctorApplications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40">
                  No doctor onboarding applications currently pending verification.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {doctorApplications.map((app) => (
                    <div key={app.id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-base text-white">{app.name}</h3>
                            <p className="text-xs text-slate-400 font-mono">{app.email}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                          <p><strong>NMC/MCI ID:</strong> <span className="text-blue-400 uppercase font-mono">{app.regNumber}</span></p>
                          <p><strong>Specialisation:</strong> {app.specialisation}</p>
                          <p><strong>Qualifications:</strong> {app.qualification}</p>
                          <p><strong>Experience:</strong> {app.experience}</p>
                        </div>
                      </div>

                      {app.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleApproveDoctor(app)}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Approve & Add to Directory
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
      </div>
    </ProtectedRoute>
  );
}
