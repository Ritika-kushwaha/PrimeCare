'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Stethoscope, User, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Search, Building2, Award, CalendarX2, Ban, Users,
  Mail, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

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
  leaveReason?: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'LEAVE_CANCELLED' | 'COMPLETED'>('ALL');
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const res = await fetch('/api/sync/appointments', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendReminder = async (apt: AppointmentItem) => {
    const targetRecipient = (apt.patientEmail || user?.email || '').trim().toLowerCase();
    
    if (!targetRecipient) {
      alert('Error: No patient email found on this appointment.');
      return;
    }

    setSendingReminderId(apt.id);

    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'APPOINTMENT_REMINDER',
          recipientEmail: targetRecipient,
          patientEmail: targetRecipient,
          doctorEmail: apt.doctorEmail,
          patientName: apt.patientName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient Member'),
          doctorName: apt.doctorName,
          specialisation: apt.department,
          date: apt.date,
          timeSlot: apt.timeSlot,
          tokenNumber: apt.tokenNumber,
          fee: apt.fee
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Appointment reminder email successfully sent to ${targetRecipient}!`);
      } else {
        alert(`Mail Dispatch Notice: ${data.error || 'Server error. Please verify SMTP settings.'}`);
      }
    } catch {
      alert('Network error connecting to email service.');
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const updated = appointments.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a);
      setAppointments(updated);
      await fetch('/api/sync/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: updated })
      });
      loadAppointments();
    } catch {
      alert('Failed to cancel appointment.');
    }
  };

  const myAppointments = useMemo(() => {
    const userEmail = (user?.email || '').trim().toLowerCase();
    const q = searchTerm.trim().toLowerCase();

    return appointments.filter(a => {
      if (!a) return false;
      const aptEmail = (a.patientEmail || '').trim().toLowerCase();
      
      const isMyAppointment = user?.role === 'PATIENT' ? (aptEmail === userEmail || !aptEmail) : true;
      if (!isMyAppointment) return false;

      if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;

      const matchesSearch = 
        (a.doctorName || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q) ||
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.tokenNumber || '').toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [appointments, user, searchTerm, filterStatus]);

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Outpatient Booking Desk
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                My Appointments
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                View real-time token queues, reschedule shifts, and trigger email reminders.
              </p>
            </div>

            <Link
              href="/patient/book"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <Calendar className="w-4 h-4" /> Book New Appointment
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor, department, or token..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('CONFIRMED')}
                className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'CONFIRMED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'}`}
              >
                Confirmed
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('LEAVE_CANCELLED')}
                className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'LEAVE_CANCELLED' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'}`}
              >
                Due to Dr. Leave
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400" />
              <p className="text-xs">Synchronizing appointments from clinical database...</p>
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="p-16 text-center text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/40 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">No Appointments Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You do not have any scheduled consultations matching your criteria.
              </p>
              <Link
                href="/patient/book"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
              >
                Schedule First Consultation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAppointments.map((apt) => {
                const isLeaveCancelled = apt.status === 'LEAVE_CANCELLED';
                const isCompleted = apt.status === 'COMPLETED';

                return (
                  <div
                    key={apt.id}
                    className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
                      isLeaveCancelled
                        ? 'bg-slate-900/80 border-amber-500/30'
                        : isCompleted
                        ? 'bg-slate-900/60 border-emerald-500/20 opacity-80'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-1 ${
                            isLeaveCancelled
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : isCompleted
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {isLeaveCancelled ? 'Shifted • Dr. On Leave' : isCompleted ? 'Completed' : 'Confirmed'} • {apt.tokenNumber}
                          </span>
                          <h3 className="text-lg font-bold text-white">{apt.doctorName}</h3>
                          <p className="text-xs text-emerald-400 font-semibold">{apt.department}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          {apt.fee || '₹1,000'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Scheduled Date:</span>
                          <strong className="text-slate-200">{apt.date}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Time Slot:</span>
                          <strong className="text-amber-300">{apt.timeSlot}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Patient:</span>
                          <span className="text-slate-300">{apt.patientName}</span>
                        </div>
                      </div>

                      {apt.symptoms && (
                        <p className="text-xs text-slate-400 italic line-clamp-2">
                          &quot;{apt.symptoms}&quot;
                        </p>
                      )}
                    </div>

                    {!isCompleted && !isLeaveCancelled && (
                      <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(apt)}
                          disabled={sendingReminderId === apt.id}
                          className="flex-1 py-2.5 px-3 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Mail className="w-3.5 h-3.5" /> {sendingReminderId === apt.id ? 'Sending...' : 'Send Reminder'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(apt.id)}
                          className="py-2.5 px-3 bg-red-950/30 hover:bg-red-900/50 border border-red-500/40 text-red-400 font-bold rounded-xl text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </main>

      </div>
    </ProtectedRoute>
  );
}
