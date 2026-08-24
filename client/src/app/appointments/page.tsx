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
  Printer, CalendarPlus, Briefcase, Star, ChevronRight, RefreshCw, X, Download, ExternalLink, Check, FileBadge
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
  doctorEmail?: string;
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
  
  // Dynamic Initial Date (Today formatted as YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  
  const [sharedEmail, setSharedEmail] = useState(user?.email || 'patient@primecare.in');
  const [patientFirstName, setPatientFirstName] = useState(user?.firstName || 'Member');
  const [patientLastName, setPatientLastName] = useState(user?.lastName || '');
  const [patientAge, setPatientAge] = useState('21');
  const [patientGender, setPatientGender] = useState('Female');
  const [symptoms, setSymptoms] = useState('Routine clinical consultation & health checkup');
  
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [inspectDoctor, setInspectDoctor] = useState<DoctorProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<AppointmentItem | null>(null);
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate Next 6 Upcoming Dates for Quick Selection
  const quickDates = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      list.push({ iso, label });
    }
    return list;
  }, []);

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

    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  const cleanDoctorName = (name?: string) => (name || '').toLowerCase().replace('dr. ', '').trim();

  // Check if Selected Doctor is On Approved Leave on Selected Date
  const doctorLeaveRecord = useMemo(() => {
    const selClean = cleanDoctorName(selectedDoctor.name);
    const selId = selectedDoctor.id;

    return leaves.find(l => {
      if (l.leaveDate !== selectedDate) return false;
      const lClean = cleanDoctorName(l.doctorName);
      return (l.doctorId && l.doctorId === selId) || (lClean && (lClean.includes(selClean) || selClean.includes(lClean)));
    });
  }, [leaves, selectedDoctor, selectedDate]);

  const currentMemberName = useMemo(() => {
    return `${(patientFirstName || '').trim()} ${(patientLastName || '').trim()}`.trim() || 'Patient Member';
  }, [patientFirstName, patientLastName]);

  // Per-doctor slot availability check
  const getSlotAvailability = (slot: string) => {
    if (doctorLeaveRecord) {
      return {
        available: false,
        reason: `${selectedDoctor.name} is on Leave (${doctorLeaveRecord.reason || 'Leave'})`,
        statusType: 'DOCTOR_ON_LEAVE'
      };
    }

    const selClean = cleanDoctorName(selectedDoctor.name);
    const selId = selectedDoctor.id;
    const cleanMember = currentMemberName.toLowerCase();

    const existingDoctorBooking = existingAppointments.find(a => {
      if (a.date !== selectedDate || a.timeSlot !== slot) return false;
      if (a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;

      const aDocClean = cleanDoctorName(a.doctorName);
      const isThisDoctor = (a.doctorId && a.doctorId === selId) || (aDocClean && aDocClean.includes(selClean));
      return isThisDoctor;
    });

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
      reason: 'Available (1 Patient Slot)',
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

  const getGoogleCalendarUrl = (apt: AppointmentItem) => {
    const title = encodeURIComponent(`PrimeCare Appointment with ${apt.doctorName}`);
    const details = encodeURIComponent(`Outpatient Consultation with ${apt.doctorName} (${apt.department}) at ${apt.hospital}.\nToken: ${apt.tokenNumber}\nChief Complaint: ${apt.symptoms}`);
    const location = encodeURIComponent(apt.hospital || 'PrimeCare Hospital');

    const [year, month, day] = apt.date.split('-');
    const [time, period] = apt.timeSlot.split(' ');
    let [hours, mins] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startStr = `${year}${month}${day}T${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}00`;
    const endHour = hours + 1;
    const endStr = `${year}${month}${day}T${String(endHour).padStart(2, '0')}${String(mins).padStart(2, '0')}00`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  const downloadICS = (apt: AppointmentItem) => {
    const [year, month, day] = apt.date.split('-');
    const [time, period] = apt.timeSlot.split(' ');
    let [hours, mins] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startStr = `${year}${month}${day}T${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}00`;
    const endStr = `${year}${month}${day}T${String(hours + 1).padStart(2, '0')}${String(mins).padStart(2, '0')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PrimeCare Healthcare//Outpatient System//EN',
      'BEGIN:VEVENT',
      `UID:${apt.id}@primecare.in`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:PrimeCare: ${apt.doctorName} - ${apt.department}`,
      `DESCRIPTION:Appointment with ${apt.doctorName} at ${apt.hospital}. Token: ${apt.tokenNumber}. Symptoms: ${apt.symptoms}`,
      `LOCATION:${apt.hospital}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `PrimeCare_Appointment_${apt.tokenNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    if (doctorLeaveRecord) {
      setSlotConflictError(`${selectedDoctor.name} is on approved leave on ${selectedDate} (${doctorLeaveRecord.reason || 'Leave'}). Please select another date or physician.`);
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
      doctorEmail: selectedDoctor.email,
      department: selectedDoctor.specialisation,
      fee: selectedDoctor.fee,
      hospital: selectedDoctor.hospital,
      date: selectedDate,
      timeSlot: selectedSlot,
      symptoms: symptoms || 'Routine Consultation',
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
        console.warn("Database sync notice:", data.error);
      }
    } catch (err: any) {
      console.error("Booking sync error:", err);
    }

    setExistingAppointments(prev => [appointment, ...prev]);
    setBookingSuccess(appointment);
    setIsSubmitting(false);
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        
        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Outpatient Booking Desk
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Doctor Discovery & Outpatient Booking
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time physician duty status, automated calendar sync, and printable token generation.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Cloud Roster
            </button>
          </div>

          {/* CONFIRMATION BANNER & TICKET MODAL */}
          <AnimatePresence>
            {bookingSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-8 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-2xl space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-extrabold text-white">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Slot Confirmed • Token {bookingSuccess.tokenNumber}
                    </div>
                    <p className="text-xs text-emerald-300">
                      Confirmed for <strong>{bookingSuccess.patientName}</strong> with {bookingSuccess.doctorName} on {bookingSuccess.date} at {bookingSuccess.timeSlot}.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition"
                    >
                      <Printer className="w-4 h-4" /> Print Appointment Slip
                    </button>

                    <a
                      href={getGoogleCalendarUrl(bookingSuccess)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
                    >
                      <ExternalLink className="w-4 h-4" /> Add to Google Calendar
                    </a>

                    <button
                      type="button"
                      onClick={() => downloadICS(bookingSuccess)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" /> Download .ics
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingSuccess(null);
                        setPatientFirstName('');
                        setPatientLastName('');
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Consulting Physician</span>
                    <strong className="text-white text-sm block mt-0.5">{bookingSuccess.doctorName}</strong>
                    <span className="text-emerald-400 text-[11px]">{bookingSuccess.department}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time Slot</span>
                    <strong className="text-white text-sm block mt-0.5">{bookingSuccess.date}</strong>
                    <span className="text-emerald-400 text-[11px] font-mono">{bookingSuccess.timeSlot}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Details</span>
                    <strong className="text-white text-sm block mt-0.5">{bookingSuccess.patientName}</strong>
                    <span className="text-slate-400 text-[11px]">{bookingSuccess.age} Yrs • {bookingSuccess.gender}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Affiliated Center</span>
                    <strong className="text-white text-sm block mt-0.5">{bookingSuccess.hospital}</strong>
                    <span className="text-emerald-400 text-[11px] font-mono">Fee: {bookingSuccess.fee}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: DOCTOR SEARCH & SELECTION */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Select Specialist ({filteredDoctors.length})
                  </h2>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    placeholder="Search doctor, hospital, qualification..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                        selectedSpecialty === spec
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-white flex items-center gap-1.5">
                            {doc.name}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </h4>
                          <span className="text-xs text-emerald-400 font-semibold">{doc.specialisation}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          {doc.fee}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                          <Award className="w-3 h-3 text-blue-400" /> {doc.qualification}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-emerald-400" /> {doc.experience}
                        </span>
                        {doc.rating && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                        &quot;{doc.bio}&quot;
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" /> {doc.hospital}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectDoctor(doc);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                        >
                          Full Profile <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: BOOKING FORM */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleBooking} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selected Physician</span>
                    <h3 className="font-extrabold text-xl text-white">{selectedDoctor.name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{selectedDoctor.specialisation} • {selectedDoctor.hospital}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                    <span className="text-base font-mono font-black text-emerald-300 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      {selectedDoctor.fee}
                    </span>
                  </div>
                </div>

                {doctorLeaveRecord && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs rounded-2xl flex items-start gap-3"
                  >
                    <CalendarX2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block text-sm font-bold text-amber-300">Doctor on Approved Leave</strong>
                      <p className="leading-relaxed">
                        {selectedDoctor.name} is on duty leave on <strong>{selectedDate}</strong> ({doctorLeaveRecord.reason || 'Medical Leave'}). All slots on this date are locked. Please choose a different date or consult another specialist.
                      </p>
                    </div>
                  </motion.div>
                )}

                {slotConflictError && (
                  <div className="p-4 bg-red-950/50 border border-red-500/40 text-red-200 text-xs rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{slotConflictError}</span>
                  </div>
                )}

                {/* PATIENT DETAILS */}
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={patientLastName}
                        onChange={(e) => setPatientLastName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Shared Account Email</label>
                      <input
                        type="email"
                        required
                        value={sharedEmail}
                        onChange={(e) => setSharedEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SELECT DATE & QUICK DATE CHIPS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Date</label>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active: {selectedDate}</span>
                  </div>

                  {/* QUICK DATE BUTTONS */}
                  <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                    {quickDates.map((q) => (
                      <button
                        key={q.iso}
                        type="button"
                        onClick={() => setSelectedDate(q.iso)}
                        className={`px-3 py-2 rounded-xl border transition whitespace-nowrap flex flex-col items-center ${
                          selectedDate === q.iso
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[11px]">{q.label}</span>
                        <span className="text-[9px] opacity-75">{q.iso}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                  />
                </div>

                {/* SLOTS */}
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
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{slot}</span>
                          <span className={`text-[9px] ${isSlotSelected ? 'text-slate-900 font-extrabold' : 'text-emerald-400'}`}>Available</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CHIEF COMPLAINT */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chief Complaint</label>
                  <textarea
                    rows={2}
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(doctorLeaveRecord)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting ? 'Confirming with Database...' : (<>Confirm & Lock Slot for {currentMemberName} <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* FULL DOCTOR PROFILE MODAL */}
        <AnimatePresence>
          {inspectDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1 inline-block">
                      Verified Clinical Faculty
                    </span>
                    <h3 className="text-2xl font-extrabold text-white">{inspectDoctor.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{inspectDoctor.specialisation}</p>
                  </div>
                  <button onClick={() => setInspectDoctor(null)} className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Qualification</span>
                    <strong className="text-white mt-1 block">{inspectDoctor.qualification}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinical Experience</span>
                    <strong className="text-white mt-1 block">{inspectDoctor.experience}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Affiliated Hospital</span>
                    <strong className="text-white mt-1 block">{inspectDoctor.hospital}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                    <strong className="text-emerald-300 mt-1 block font-mono">{inspectDoctor.fee}</strong>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Biography & Clinical Focus</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    {inspectDoctor.bio}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInspectDoctor(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(inspectDoctor);
                      setInspectDoctor(null);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    Select & Book Appointment
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PRINTABLE APPOINTMENT SLIP (A4 / Thermal Print Ready) */}
        {bookingSuccess && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            <div className="max-w-2xl mx-auto border-2 border-black p-8 rounded-lg space-y-6">
              <div className="text-center border-b-2 border-black pb-4">
                <h1 className="text-2xl font-black tracking-wider uppercase">PrimeCare Hospital System</h1>
                <p className="text-xs font-semibold text-gray-700">Official Outpatient Consultation Token & Slip</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md border border-gray-300">
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase block">Token Number</span>
                  <span className="text-2xl font-black font-mono">{bookingSuccess.tokenNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-600 uppercase block">Status</span>
                  <span className="text-sm font-bold text-green-700 uppercase">Confirmed & Locked</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Patient Name:</strong> {bookingSuccess.patientName}
                </div>
                <div>
                  <strong>Age / Gender:</strong> {bookingSuccess.age} Yrs / {bookingSuccess.gender}
                </div>
                <div>
                  <strong>Doctor:</strong> {bookingSuccess.doctorName}
                </div>
                <div>
                  <strong>Specialisation:</strong> {bookingSuccess.department}
                </div>
                <div>
                  <strong>Date:</strong> {bookingSuccess.date}
                </div>
                <div>
                  <strong>Time Slot:</strong> {bookingSuccess.timeSlot}
                </div>
                <div>
                  <strong>Center:</strong> {bookingSuccess.hospital}
                </div>
                <div>
                  <strong>Fee:</strong> {bookingSuccess.fee}
                </div>
              </div>

              <div className="border-t border-gray-300 pt-3 text-xs">
                <strong>Chief Complaint:</strong> {bookingSuccess.symptoms}
              </div>

              <div className="text-center text-[10px] text-gray-500 border-t border-gray-200 pt-4">
                Please present this token at the reception desk 15 minutes before your scheduled consultation slot.
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}



