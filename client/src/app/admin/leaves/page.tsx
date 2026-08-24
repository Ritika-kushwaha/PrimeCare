'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Calendar, Clock, User, CheckCircle2, 
  AlertCircle, Search, Trash2, Check, X, 
  Stethoscope, Users, RefreshCw, Award, Filter, ArrowRight,
  CheckCheck, Archive, FileText, BadgeCheck, CalendarX2,
  Edit3, UserX, Building2, Briefcase, DollarSign, Save, AlertTriangle, Mail, CalendarPlus, History
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
  status?: string;
  finalizedAt?: string;
  leaveReason?: string;
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
  { id: 'doc-cardio-03', email: 'meera.kulkarni@primecare.in', name: 'Dr. Meera Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400', rating: '4.8 ★', bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, heart rhythm management.' },
  { id: 'doc-neuro-01', email: 'priya.nair@primecare.in', name: 'Dr. Priya Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500', rating: '4.9 ★', bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, acute stroke.' },
  { id: 'doc-ortho-01', email: 'vikram.patel@primecare.in', name: 'Dr. Vikram Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000', rating: '4.7 ★', bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.' },
  { id: 'doc-pedia-01', email: 'ananya.deshmukh@primecare.in', name: 'Dr. Ananya Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900', rating: '5.0 ★', bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.' },
  { id: 'doc-derma-01', email: 'rohan.mehta@primecare.in', name: 'Dr. Rohan Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100', rating: '4.8 ★', bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CONSULTATIONS' | 'LEAVE_AFFECTED' | 'DONE' | 'DOCTORS' | 'LEAVES'>('CONSULTATIONS');
  
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctorProfiles, setDoctorProfiles] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reschedule Modal State
  const [reschedulingApt, setReschedulingApt] = useState<AppointmentItem | null>(null);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [rescheduleDate, setRescheduleDate] = useState(todayStr);
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM');

  // Admin Doctor Editor State
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorProfile | null>(null);

  // Leave Form State
  const [selectedLeaveDoctorId, setSelectedLeaveDoctorId] = useState(DEFAULT_DOCTORS[0].id);
  const [leaveDate, setLeaveDate] = useState(todayStr);
  const [leaveReason, setLeaveReason] = useState('Medical Conference / Duty Leave');

  const selectedLeaveDoctor = useMemo(() => {
    return doctorProfiles.find(d => d.id === selectedLeaveDoctorId) || doctorProfiles[0] || DEFAULT_DOCTORS[0];
  }, [doctorProfiles, selectedLeaveDoctorId]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const apptRes = await fetch('/api/sync/appointments', { cache: 'no-store' });
      const apptData = await apptRes.json();
      if (apptData.success && Array.isArray(apptData.appointments)) {
        setAppointments(apptData.appointments);
      }
    } catch {}

    try {
      const docRes = await fetch('/api/sync/doctors', { cache: 'no-store' });
      const docData = await docRes.json();
      if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
        setDoctorProfiles(docData.doctors);
      }
    } catch {}

    try {
      const appRes = await fetch('/api/sync/applications', { cache: 'no-store' });
      const appData = await appRes.json();
      if (appData.success && Array.isArray(appData.applications)) {
        setDoctorApplications(appData.applications);
      }
    } catch {}

    try {
      const leaveRes = await fetch('/api/sync/leaves?includePast=true', { cache: 'no-store' });
      const leaveData = await leaveRes.json();
      if (leaveData.success && Array.isArray(leaveData.leaves)) {
        setLeaves(leaveData.leaves);
      }
    } catch {}

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Active Leaves (Today & Future)
  const activeLeaves = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return leaves.filter(l => l.leaveDate >= today).sort((a, b) => a.leaveDate.localeCompare(b.leaveDate));
  }, [leaves]);

  // Active Consultations
  const activeConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(a => {
      if (!a || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;
      return ((a.patientName || '') + ' ' + (a.patientEmail || '') + ' ' + (a.doctorName || '') + ' ' + (a.department || '') + ' ' + (a.tokenNumber || '')).toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  // Leave Displaced Consultations
  const leaveAffectedConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(a => {
      if (!a || a.status !== 'LEAVE_CANCELLED') return false;
      return ((a.patientName || '') + ' ' + (a.patientEmail || '') + ' ' + (a.doctorName || '') + ' ' + (a.department || '') + ' ' + (a.tokenNumber || '')).toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  // Finalized Consultations
  const doneConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(a => {
      if (!a || a.status !== 'COMPLETED') return false;
      return ((a.patientName || '') + ' ' + (a.patientEmail || '') + ' ' + (a.doctorName || '') + ' ' + (a.department || '') + ' ' + (a.tokenNumber || '')).toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return doctorProfiles.filter(d => 
      ((d.name || '') + ' ' + (d.specialisation || '') + ' ' + (d.email || '') + ' ' + (d.hospital || '')).toLowerCase().includes(q)
    );
  }, [doctorProfiles, searchQuery]);

  const cleanDoctorName = (name?: string) => (name || '').toLowerCase().replace('dr. ', '').trim();

  const getDoctorLeaves = useCallback((doc: DoctorProfile) => {
    const docClean = cleanDoctorName(doc.name);
    const docId = doc.id;
    const today = new Date().toISOString().split('T')[0];

    const docLeaves = leaves.filter(l => {
      const lClean = cleanDoctorName(l.doctorName);
      return (l.doctorId && l.doctorId === docId) || (lClean && (lClean.includes(docClean) || docClean.includes(lClean)));
    });

    const upcoming = docLeaves.filter(l => l.leaveDate >= today);
    const past = docLeaves.filter(l => l.leaveDate < today);

    return { total: docLeaves.length, upcoming, past };
  }, [leaves]);

  const handleMarkAsDone = async (aptId: string) => {
    try {
      const updated = appointments.map(a => {
        if (a.id === aptId) {
          return {
            ...a,
            status: 'COMPLETED',
            finalizedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
        }
        return a;
      });

      setAppointments(updated);
      await fetch('/api/sync/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: updated })
      });

      setActionSuccessMsg('Consultation marked as Done.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update status.');
    }
  };

  const isRescheduleDoctorOnLeave = useMemo(() => {
    if (!reschedulingApt) return null;
    const docClean = cleanDoctorName(reschedulingApt.doctorName);
    const docId = reschedulingApt.doctorId;

    return activeLeaves.find(l => {
      if (l.leaveDate !== rescheduleDate) return false;
      const lDocClean = cleanDoctorName(l.doctorName);
      return (l.doctorId && l.doctorId === docId) || (lDocClean && (lDocClean.includes(docClean) || docClean.includes(lDocClean)));
    });
  }, [reschedulingApt, rescheduleDate, activeLeaves]);

  const getRescheduleSlotStatus = (slot: string) => {
    if (isRescheduleDoctorOnLeave) {
      return { available: false, reason: 'Doctor on Leave' };
    }
    if (!reschedulingApt) return { available: true, reason: 'Available' };

    const docClean = cleanDoctorName(reschedulingApt.doctorName);
    const docId = reschedulingApt.doctorId;

    const existingBooking = appointments.find(a => {
      if (a.id === reschedulingApt.id) return false;
      if (a.date !== rescheduleDate || a.timeSlot !== slot) return false;
      if (a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;

      const aDocClean = cleanDoctorName(a.doctorName);
      const isSameDoctor = (a.doctorId && a.doctorId === docId) || (aDocClean && aDocClean.includes(docClean));
      return isSameDoctor;
    });

    if (existingBooking) {
      return { available: false, reason: 'Already Booked' };
    }
    return { available: true, reason: 'Available' };
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
      alert(`Cannot reschedule: Slot is ${slotStatus.reason}. Please pick a free slot.`);
      return;
    }

    const updatedAppts = appointments.map(a => {
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

    setAppointments(updatedAppts);
    await fetch('/api/sync/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointments: updatedAppts })
    });

    setReschedulingApt(null);
    setActionSuccessMsg(`Appointment for ${reschedulingApt.patientName} rescheduled & restored to Active Queue.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const handleSaveDoctorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      const updatedRoster = doctorProfiles.map(d => d.id === editingDoctor.id ? editingDoctor : d);
      setDoctorProfiles(updatedRoster);

      await fetch('/api/sync/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor: editingDoctor })
      });

      setEditingDoctor(null);
      setActionSuccessMsg(`Doctor profile for ${editingDoctor.name} updated.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update doctor details.');
    }
  };

  const handlePermanentDoctorRemoval = async (doctor: DoctorProfile) => {
    const docEmailClean = (doctor.email || '').toLowerCase().trim();
    const docId = doctor.id;

    const updatedRoster = doctorProfiles.filter(d => d.id !== docId && (d.email || '').toLowerCase().trim() !== docEmailClean);
    setDoctorProfiles(updatedRoster);

    setDoctorToDelete(null);
    setActionSuccessMsg(`Doctor account for ${doctor.name} removed.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // 1. APPROVE DOCTOR: Adds to Postgres Doctors List & Sends Acceptance Email
  const handleApproveDoctor = async (app: DoctorApplication) => {
    try {
      const cleanAppEmail = app.email.trim().toLowerCase();
      const docFullName = app.name.startsWith('Dr.') ? app.name : 'Dr. ' + app.name;

      await fetch('/api/sync/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: app.id, 
          email: cleanAppEmail, 
          status: 'APPROVED',
          name: docFullName,
          specialisation: app.specialisation,
          qualification: app.qualification,
          regNumber: app.regNumber
        })
      });

      // Dispatch Acceptance Email to Doctor
      try {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'DOCTOR_APPROVED',
            recipientEmail: cleanAppEmail,
            doctorName: docFullName,
            specialisation: app.specialisation,
            regNumber: app.regNumber,
            adminEmail: user?.email
          })
        });
      } catch (emailErr) {
        console.warn('Approval email error:', emailErr);
      }

      await loadData();
      setActionSuccessMsg('Physician ' + app.name + ' approved! Added to patient booking roster and acceptance email sent.');
      setTimeout(() => setActionSuccessMsg(''), 5000);
    } catch {
      alert('Failed to approve doctor.');
    }
  };

  // 2. REJECT DOCTOR: Deletes credentials & Sends Rejection Notice Email
  const handleRejectDoctor = async (app: DoctorApplication) => {
    try {
      const cleanAppEmail = app.email.trim().toLowerCase();

      await fetch('/api/sync/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id, email: cleanAppEmail, status: 'REJECTED' })
      });

      // Dispatch Rejection Notice Email
      try {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'DOCTOR_REJECTED',
            recipientEmail: cleanAppEmail,
            doctorName: app.name,
            adminEmail: user?.email
          })
        });
      } catch (emailErr) {
        console.warn('Rejection email error:', emailErr);
      }

      await loadData();
      setActionSuccessMsg('Application for ' + app.name + ' rejected. Credentials deleted and notice email sent.');
      setTimeout(() => setActionSuccessMsg(''), 5000);
    } catch {
      alert('Failed to reject application.');
    }
  };

  // 3. ADD LEAVE: Permanent Record, Auto Shift & Doctor Leave Email
  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMsg('Recording leave, sending doctor email notification & shifting appointments...');

    const newLeave: LeaveRecord = {
      id: 'leave-' + Date.now(),
      doctorId: selectedLeaveDoctor.id,
      doctorName: selectedLeaveDoctor.name,
      specialisation: selectedLeaveDoctor.specialisation,
      leaveDate,
      reason: leaveReason
    };

    try {
      const res = await fetch('/api/sync/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leave: newLeave })
      });

      if (!res.ok) {
        throw new Error('Failed to save leave.');
      }

      // Dispatch automated leave notification email to physician
      try {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'LEAVE_APPROVED',
            recipientEmail: selectedLeaveDoctor.email,
            doctorName: selectedLeaveDoctor.name,
            leaveDate,
            reason: leaveReason,
            adminEmail: user?.email
          })
        });
      } catch (leaveEmailErr) {
        console.warn('Leave email dispatch notice:', leaveEmailErr);
      }

      await loadData();
      setActionSuccessMsg('Approved leave recorded for ' + selectedLeaveDoctor.name + ' on ' + leaveDate + '! Email notification dispatched to physician and matching patients shifted.');
      setTimeout(() => setActionSuccessMsg(''), 6000);
    } catch (err: any) {
      alert(`Failed to record leave: ${err.message}`);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      await fetch('/api/sync/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id })
      });
      loadData();
    } catch {}
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrative Management Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Clinic Operations & Doctor Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full authority to approve physicians, manage leaves, view leave histories, and oversee outpatient queues across all devices.
              </p>
            </div>

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
                onClick={() => setActiveTab('LEAVE_AFFECTED')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'LEAVE_AFFECTED' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarX2 className="w-3.5 h-3.5" /> Due to Dr. on Leave ({leaveAffectedConsultations.length})
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
                <Stethoscope className="w-3.5 h-3.5" /> Doctors & Approvals ({doctorProfiles.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LEAVES')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'LEAVES' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Record Leaves ({activeLeaves.length})
              </button>
            </div>
          </div>

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
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Cloud Data
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
                  <p className="text-xs text-slate-500">All appointments have been completed or moved to the Done / Leave sections.</p>
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

          {/* TAB 2: DUE TO DOCTOR ON LEAVE */}
          {activeTab === 'LEAVE_AFFECTED' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <CalendarX2 className="w-5 h-5" />
                  <span>Displaced Appointments Due to Doctor on Leave ({leaveAffectedConsultations.length})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  These patient appointments were displaced due to an approved leave date. Click <strong>&quot;Reschedule Slot&quot;</strong> to allocate a new date and time.
                </p>
              </div>

              {leaveAffectedConsultations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No Shifted Appointments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {leaveAffectedConsultations.map((a) => (
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
                            <span className="text-slate-400">Original Date & Slot:</span>
                            <strong className="text-amber-300">{a.date} ({a.timeSlot})</strong>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-400">
                            <span>Duty Leave Reason:</span>
                            <span className="text-amber-400 font-medium">{a.leaveReason || 'Doctor on Approved Leave'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingApt(a);
                          setRescheduleDate(a.date || todayStr);
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

          {/* TAB 3: FINALIZED CONSULTATIONS */}
          {activeTab === 'DONE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" /> Finalized & Done Consultations ({doneConsultations.length})
                  </h2>
                </div>
              </div>

              {doneConsultations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-2">
                  <Archive className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">No Finalized Consultations Yet</p>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCTOR DIRECTORY & APPROVAL APPLICATIONS */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-6">
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
                            Pending Review
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <p><strong>NMC/MCI ID:</strong> <span className="text-blue-400 uppercase font-mono font-bold">{app.regNumber}</span></p>
                          <p><strong>Specialisation:</strong> {app.specialisation}</p>
                          <p><strong>Qualification:</strong> {app.qualification}</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveDoctor(app)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20"
                          >
                            Approve & Add to Roster
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDoctor(app)}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Active Doctor Roster & Leave Tracking ({filteredDoctors.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDoctors.map((doc) => {
                    const docLeaveStats = getDoctorLeaves(doc);

                    return (
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

                          {/* LEAVE SUMMARY */}
                          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <History className="w-3.5 h-3.5 text-amber-400" /> Leave Records:
                              </span>
                              <span className="text-[11px] font-bold text-slate-300">
                                {docLeaveStats.total} Total ({docLeaveStats.upcoming.length} Upcoming)
                              </span>
                            </div>

                            {docLeaveStats.upcoming.length > 0 ? (
                              <div className="space-y-1 pt-1 border-t border-slate-900">
                                {docLeaveStats.upcoming.map((l) => (
                                  <div key={l.id} className="flex justify-between text-[11px] text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20">
                                    <span>{l.leaveDate}</span>
                                    <span className="truncate max-w-[140px] text-slate-300">{l.reason}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 italic">No upcoming leaves scheduled.</p>
                            )}
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
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: RECORD DOCTOR LEAVES */}
          {activeTab === 'LEAVES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <form onSubmit={handleAddLeave} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <CalendarX2 className="w-4 h-4 text-amber-400" /> Record Doctor Leave
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Physician</label>
                    <select
                      value={selectedLeaveDoctorId}
                      onChange={(e) => setSelectedLeaveDoctorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {doctorProfiles.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialisation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Leave Date</label>
                    <input
                      type="date"
                      required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason / Note</label>
                    <input
                      type="text"
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
                  >
                    Lock Availability & Shift Matching Appointments
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-bold text-base text-white">Active Approved Leaves ({activeLeaves.length})</h3>
                {activeLeaves.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/40">
                    No active upcoming leaves. Past leaves have automatically expired from the active duty roster.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                    {activeLeaves.map((l) => (
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

        {/* MODAL: RESCHEDULE */}
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

                {isRescheduleDoctorOnLeave && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">{reschedulingApt.doctorName} is on Leave on {rescheduleDate}</strong>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">Please choose another date to see available slots.</p>
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
                              className="py-2 px-2 rounded-xl font-bold border text-center opacity-40 bg-red-950/20 border-red-500/30 text-red-300 cursor-not-allowed flex flex-col justify-center items-center"
                            >
                              <span>{slot}</span>
                              <span className="text-[8px] text-red-400">{status.reason}</span>
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

        {/* MODAL: ADMIN EDIT DOCTOR */}
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
                    <label className="block text-slate-400 font-semibold mb-1">Physician Bio</label>
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

        {/* MODAL: REMOVAL */}
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
                    Delete
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


