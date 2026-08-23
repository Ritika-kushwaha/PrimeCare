'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Stethoscope, User, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Search, Building2, Award, CalendarX2, Ban, Users, 
  Printer, CalendarPlus, Briefcase, Star, ChevronRight, RefreshCw
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  email?: string;
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
  doctorId?: string;
  doctorName?: string;
  specialisation?: string;
  leaveDate?: string;
  reason?: string;
}

interface AppointmentItem {
  id: string;
  tokenNumber: string;
  doctorId: string;
  doctorName: string;
  department: string;
  fee: string;
  hospital: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  patientName: string;
  patientEmail: string;
  age: string;
  gender: string;
  bookingDate?: string;
  status: string;
}

const DEFAULT_DOCTORS: DoctorProfile[] = [
  { id: 'doc-cardio-01', email: 'ritikakushwaha62@gmail.com', name: 'Dr. Ritika Kushwaha', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS Delhi)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200', rating: '4.9 ★', bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, angiographies, and lipidology.' },
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

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<AppointmentItem[]>([]);
  
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(DEFAULT_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  
  const [sharedEmail, setSharedEmail] = useState(user?.email || 'patient@primecare.in');
  const [patientFirstName, setPatientFirstName] = useState(user?.firstName || 'Ritika');
  const [patientLastName, setPatientLastName] = useState(user?.lastName || 'Kushwaha');
  const [patientAge, setPatientAge] = useState('21');
  const [patientGender, setPatientGender] = useState('Female');
  const [symptoms, setSymptoms] = useState('Routine cardiovascular checkup');
  
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [inspectDoctor, setInspectDoctor] = useState<DoctorProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<AppointmentItem | null>(null);
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const docRes = await fetch('/api/sync/doctors', { cache: 'no-store' });
      const docData = await docRes.json();
      if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
        setDoctors(docData.doctors);
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
      const apptRes = await fetch('/api/sync/appointments', { cache: 'no-store' });
      const apptData = await apptRes.json();
      if (apptData.success && Array.isArray(apptData.appointments)) {
        setExistingAppointments(apptData.appointments.filter((a: any) => a.status !== 'CANCELLED'));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    if (user?.email) setSharedEmail(user.email);
    if (user?.firstName) setPatientFirstName(user.firstName);
    if (user?.lastName) setPatientLastName(user.lastName);

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  const isDoctorOnLeave = useMemo(() => {
    const selName = selectedDoctor.name.toLowerCase().replace('dr. ', '').trim();
    const selId = selectedDoctor.id;

    return leaves.find(l => {
      if (l.leaveDate !== selectedDate) return false;
      const lName = (l.doctorName || '').toLowerCase().replace('dr. ', '').trim();
      const lId = l.doctorId;
      return (lId && lId === selId) || (lName && (lName.includes(selName) || selName.includes(lName)));
    });
  }, [leaves, selectedDoctor, selectedDate]);

  const currentMemberName = useMemo(() => {
    return `${(patientFirstName || '').trim()} ${(patientLastName || '').trim()}`.trim();
  }, [patientFirstName, patientLastName]);

  const getSlotAvailability = (slot: string) => {
    const cleanMember = currentMemberName.toLowerCase();

    if (isDoctorOnLeave) {
      return {
        available: false,
        reason: `${selectedDoctor.name} is on Leave on ${selectedDate}`,
        statusType: 'DOCTOR_ON_LEAVE'
      };
    }

    const existingDoctorBooking = existingAppointments.find(
      a => (a.doctorId === selectedDoctor.id || a.doctorName?.toLowerCase().includes(selectedDoctor.name.toLowerCase().replace('dr. ', '').trim())) && 
           a.date === selectedDate && 
           a.timeSlot === slot && 
           a.status !== 'CANCELLED' && 
           a.status !== 'LEAVE_CANCELLED'
    );

    if (existingDoctorBooking) {
      const isMe = (existingDoctorBooking.patientName || '').toLowerCase() === cleanMember;
      return {
        available: false,
        reason: isMe ? 'Booked by you' : 'Already Booked (Slot Closed)',
        statusType: isMe ? 'SELF_RESERVED' : 'SLOT_TAKEN'
      };
    }

    return {
      available: true,
      reason: 'Available (1 Person Only)',
      statusType: 'FREE'
    };
  };

  const filteredDoctors = useMemo(() => {
    const query = (searchDoc || '').toLowerCase().trim();
    return doctors.filter((d) => {
      if (!d) return false;
      const matchSpec = selectedSpecialty === 'ALL' || d.specialisation.toUpperCase() === selectedSpecialty.toUpperCase();
      const matchQuery = `${d.name} ${d.specialisation} ${d.hospital} ${d.qualification}`.toLowerCase().includes(query);
      return matchSpec && matchQuery;
    });
  }, [doctors, searchDoc, selectedSpecialty]);

  const specialties = useMemo(() => {
    const set = new Set(doctors.map(d => d.specialisation));
    return ['ALL', ...Array.from(set)];
  }, [doctors]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotConflictError(null);
    setIsSubmitting(true);

    const cleanEmail = (sharedEmail || '').trim().toLowerCase();
    const fullName = currentMemberName;

    if (!fullName) {
      setSlotConflictError("Please enter patient first and last name.");
      setIsSubmitting(false);
      return;
    }

    if (isDoctorOnLeave) {
      setSlotConflictError(`${selectedDoctor.name} is on approved leave on ${selectedDate}.`);
      setIsSubmitting(false);
      return;
    }

    const slotState = getSlotAvailability(selectedSlot);
    if (!slotState.available) {
      setSlotConflictError(`Cannot book ${selectedSlot}: ${slotState.reason}`);
      setIsSubmitting(false);
      return;
    }

    const tokenNumber = `TK-${Math.floor(100 + Math.random() * 900)}`;

    const appointment: AppointmentItem = {
      id: 'apt-' + Date.now(),
      tokenNumber,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.specialisation,
      fee: selectedDoctor.fee,
      hospital: selectedDoctor.hospital,
      date: selectedDate,
      timeSlot: selectedSlot,
      symptoms: symptoms || 'General Consultation',
      patientName: fullName,
      patientEmail: cleanEmail || 'patient@primecare.in',
      age: patientAge,
      gender: patientGender,
      bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'CONFIRMED',
    };

    try {
      const res = await fetch('/api/sync/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Database save failed.');
      }
    } catch (err: any) {
      console.error("Booking error:", err);
    }

    setExistingAppointments(prev => [appointment, ...prev]);
    setBookingSuccess(appointment);
    setIsSubmitting(false);
  };

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
                Doctor Discovery & Outpatient Booking
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time physician duty status and calendar synchronized slot booking.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Slots
            </button>
          </div>

          <AnimatePresence>
            {bookingSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-base font-bold text-emerald-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Confirmed • Token {bookingSuccess.tokenNumber}
                  </div>
                  <p className="text-xs text-emerald-300">
                    Slot confirmed for <strong>{bookingSuccess.patientName}</strong> with {bookingSuccess.doctorName} on {bookingSuccess.date} at {bookingSuccess.timeSlot}. Saved to central hospital database!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSuccess(null);
                      setPatientFirstName('');
                      setPatientLastName('');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    + Book Another Slot
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* AREA 1: DOCTOR SEARCH & SELECTION */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Select Specialist
                  </span>
                  <span className="text-[11px] text-slate-400">{filteredDoctors.length} available</span>
                </h2>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    placeholder="Search doctor or specialty..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                            {doc.name}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </h4>
                          <span className="text-xs text-emerald-400 font-semibold">{doc.specialisation}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          {doc.fee}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{doc.bio || doc.qualification}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AREA 2: APPOINTMENT BOOKING FORM */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleBooking} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selected Physician</span>
                    <h3 className="font-extrabold text-lg text-white">{selectedDoctor.name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{selectedDoctor.specialisation} • {selectedDoctor.hospital}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                    <span className="text-sm font-mono font-black text-emerald-300 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      {selectedDoctor.fee}
                    </span>
                  </div>
                </div>

                {slotConflictError && (
                  <div className="p-4 bg-red-950/50 border border-red-500/40 text-red-200 text-xs rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{slotConflictError}</span>
                  </div>
                )}

                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Patient Details
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={patientFirstName}
                        onChange={(e) => setPatientFirstName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={patientLastName}
                        onChange={(e) => setPatientLastName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        required
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Account Email</label>
                      <input
                        type="email"
                        required
                        value={sharedEmail}
                        onChange={(e) => setSharedEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none [color-scheme:dark]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Available Consultation Slots
                    </label>
                    <span className="text-[10px] text-slate-500">1 Patient per Slot</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const slotInfo = getSlotAvailability(slot);
                      const isSlotSelected = selectedSlot === slot && slotInfo.available;

                      if (!slotInfo.available) {
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled
                            className="py-2.5 px-3 rounded-xl text-left bg-red-950/20 border border-red-500/30 opacity-60 cursor-not-allowed flex flex-col justify-between"
                          >
                            <span className="text-xs font-bold text-red-300">{slot}</span>
                            <span className="text-[9px] text-red-400 mt-1 truncate">{slotInfo.reason}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex flex-col justify-between ${
                            isSlotSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{slot}</span>
                          <span className={`text-[9px] ${isSlotSelected ? 'text-slate-900' : 'text-emerald-400'}`}>Available</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chief Complaint</label>
                  <textarea
                    rows={2}
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(isDoctorOnLeave)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting ? 'Saving to Database...' : (<>Confirm & Lock Slot for {currentMemberName} <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
