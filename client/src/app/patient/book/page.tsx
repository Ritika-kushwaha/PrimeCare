'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Stethoscope, User, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Search, Building2, Award, CalendarX2, Ban, Users, 
  Printer, CalendarPlus, Briefcase, Star, ChevronRight
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  specialisation: string;
  qualification: string;
  experience: string;
  hospital: string;
  fee: string;
  rating: string;
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
  bookingDate: string;
  status: string;
}

const DEFAULT_DOCTORS: DoctorProfile[] = [
  { 
    id: 'doc-cardio-01', 
    name: 'Dr. Aarav Sharma', 
    specialisation: 'Cardiology', 
    qualification: 'MD, DM (Cardiology - AIIMS Delhi)', 
    experience: '14 Years Practice', 
    hospital: 'PrimeCare Apex Heart Institute', 
    fee: '₹1,200', 
    rating: '4.9 ★',
    bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, angiographies, and lipidology.' 
  },
  { 
    id: 'doc-cardio-02', 
    name: 'Dr. Meera Kulkarni', 
    specialisation: 'Cardiology', 
    qualification: 'MD, DNB (Cardiology)', 
    experience: '10 Years Practice', 
    hospital: 'PrimeCare Metro Hospital', 
    fee: '₹1,400', 
    rating: '4.8 ★',
    bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, and heart rhythm management.' 
  },
  { 
    id: 'doc-neuro-01', 
    name: 'Dr. Priya Nair', 
    specialisation: 'Neurology', 
    qualification: 'MD, DM (Neurology - NIMHANS)', 
    experience: '12 Years Practice', 
    hospital: 'PrimeCare Neuroscience Center', 
    fee: '₹1,500', 
    rating: '4.9 ★',
    bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, and acute stroke treatment.' 
  },
  { 
    id: 'doc-ortho-01', 
    name: 'Dr. Vikram Patel', 
    specialisation: 'Orthopedics', 
    qualification: 'MS (Orthopedics), MCh', 
    experience: '15 Years Practice', 
    hospital: 'PrimeCare Ortho Wing', 
    fee: '₹1,000', 
    rating: '4.7 ★',
    bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.' 
  },
  { 
    id: 'doc-pedia-01', 
    name: 'Dr. Ananya Deshmukh', 
    specialisation: 'Pediatrics', 
    qualification: 'MD (Pediatrics), DCH', 
    experience: '9 Years Practice', 
    hospital: 'PrimeCare Children Pavilion', 
    fee: '₹900', 
    rating: '5.0 ★',
    bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.' 
  },
  { 
    id: 'doc-derma-01', 
    name: 'Dr. Rohan Mehta', 
    specialisation: 'Dermatology', 
    qualification: 'MD (Dermatology)', 
    experience: '8 Years Practice', 
    hospital: 'PrimeCare Skin Clinic', 
    fee: '₹1,100', 
    rating: '4.8 ★',
    bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.' 
  },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<AppointmentItem[]>([]);
  
  // Selection States
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(DEFAULT_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  
  // Member & Account Info
  const [sharedEmail, setSharedEmail] = useState('ritikakushwaha62@gmail.com');
  const [patientFirstName, setPatientFirstName] = useState('Ritika');
  const [patientLastName, setPatientLastName] = useState('Kushwaha');
  const [patientAge, setPatientAge] = useState('21');
  const [patientGender, setPatientGender] = useState('Female');
  const [symptoms, setSymptoms] = useState('Routine cardiovascular checkup');
  
  // Filters & State Handlers
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [inspectDoctor, setInspectDoctor] = useState<DoctorProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<AppointmentItem | null>(null);
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedRoster = localStorage.getItem('primecare_doctor_profiles');
      if (storedRoster) {
        const parsed = JSON.parse(storedRoster);
        const map = new Map<string, DoctorProfile>();
        DEFAULT_DOCTORS.forEach(d => map.set(d.id, d));
        parsed.forEach((d: any) => map.set(d.id, d));
        const allDocs = Array.from(map.values());
        setDoctors(allDocs);
        if (allDocs.length > 0) setSelectedDoctor(allDocs[0]);
      }
    } catch {}

    try {
      const storedLeaves = localStorage.getItem('primecare_leaves');
      if (storedLeaves) setLeaves(JSON.parse(storedLeaves));
    } catch {}

    try {
      const storedAppts = localStorage.getItem('primecare_appointments');
      if (storedAppts) setExistingAppointments(JSON.parse(storedAppts));
    } catch {}
  }, []);

  const isDoctorOnLeave = useMemo(() => {
    return leaves.find(l => l.doctorId === selectedDoctor.id && l.leaveDate === selectedDate);
  }, [leaves, selectedDoctor, selectedDate]);

  const currentMemberName = useMemo(() => {
    return `${(patientFirstName || '').trim()} ${(patientLastName || '').trim()}`.trim();
  }, [patientFirstName, patientLastName]);

  // STRICT 1:1 SLOT CHECK
  const getSlotAvailability = (slot: string) => {
    const cleanMember = currentMemberName.toLowerCase();

    // 1. Is this doctor's slot already booked by ANYONE (even 1 person)?
    const existingDoctorBooking = existingAppointments.find(
      a => a.doctorId === selectedDoctor.id && a.date === selectedDate && a.timeSlot === slot
    );

    if (existingDoctorBooking) {
      const isMe = (existingDoctorBooking.patientName || '').toLowerCase() === cleanMember;
      return {
        available: false,
        reason: isMe ? 'Booked by you' : 'Already Booked (Slot Closed)',
        statusType: isMe ? 'SELF_RESERVED' : 'SLOT_TAKEN'
      };
    }

    // 2. Is THIS member busy with another doctor at this same time?
    const memberBusyOtherDoctor = existingAppointments.find(
      a => (a.patientName || '').toLowerCase() === cleanMember &&
           a.date === selectedDate &&
           a.timeSlot === slot &&
           a.doctorId !== selectedDoctor.id
    );

    if (memberBusyOtherDoctor) {
      return {
        available: false,
        reason: `You have an appointment with ${memberBusyOtherDoctor.doctorName}`,
        statusType: 'MEMBER_BUSY'
      };
    }

    // Slot is completely free for 1 person
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

  // Generate Google Calendar Link
  const buildGoogleCalendarUrl = (item: AppointmentItem) => {
    try {
      const [year, month, day] = (item.date || '2026-08-28').split('-').map(Number);
      const [timeStr, meridian] = (item.timeSlot || '10:00 AM').split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startUtc = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00Z`;

      let endHours = hours;
      let endMinutes = minutes + 45;
      if (endMinutes >= 60) { endHours += 1; endMinutes -= 60; }
      const endUtc = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(endMinutes)}00Z`;

      const title = encodeURIComponent(`🩺 Clinical Consultation: ${item.doctorName} (${item.department})`);
      const details = encodeURIComponent(`Patient Name: ${item.patientName}\nQueue Token: ${item.tokenNumber}\nDepartment: ${item.department}\nHospital: ${item.hospital}\nConsultation Fee: ${item.fee}`);
      const location = encodeURIComponent(item.hospital || 'PrimeCare Multispecialty Hospital');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
    } catch {
      return 'https://calendar.google.com';
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotConflictError(null);

    const cleanEmail = (sharedEmail || '').trim().toLowerCase();
    const fullName = currentMemberName;

    if (!fullName) {
      setSlotConflictError("Please enter patient first and last name.");
      return;
    }

    if (isDoctorOnLeave) {
      alert(`${selectedDoctor.name} is on approved leave on ${selectedDate}.`);
      return;
    }

    const slotState = getSlotAvailability(selectedSlot);
    if (!slotState.available) {
      setSlotConflictError(`Cannot book ${selectedSlot}: ${slotState.reason}`);
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

    const updated = [appointment, ...existingAppointments];
    setExistingAppointments(updated);
    localStorage.setItem('primecare_appointments', JSON.stringify(updated));

    // 1. Instant Google Calendar Redirect
    const gcalUrl = buildGoogleCalendarUrl(appointment);
    window.open(gcalUrl, '_blank');

    // 2. Direct .ics File Download
    try {
      const [year, month, day] = (appointment.date || '2026-08-28').split('-');
      const [timeStr, meridian] = (appointment.timeSlot || '10:00 AM').split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startStr = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
      let endHours = hours;
      let endMinutes = minutes + 45;
      if (endMinutes >= 60) { endHours += 1; endMinutes -= 60; }
      const endStr = `${year}${month}${day}T${pad(endHours)}${pad(endMinutes)}00`;

      const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PrimeCare//EN\nMETHOD:REQUEST\nBEGIN:VEVENT\nUID:apt-${appointment.id}@primecare.health\nDTSTAMP:${year}${month}${day}T000000Z\nDTSTART:${startStr}\nDTEND:${endStr}\nSUMMARY:🩺 ${appointment.doctorName} (${appointment.department})\nDESCRIPTION:Patient: ${appointment.patientName}\\nToken: ${appointment.tokenNumber}\\nHospital: ${appointment.hospital}\nLOCATION:${appointment.hospital}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `PrimeCare-${appointment.patientName.replace(/\s+/g, '_')}-${appointment.date}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}

    setBookingSuccess(appointment);
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* PRINT SLIP */}
        {bookingSuccess && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            <div className="border-2 border-black p-6 rounded-lg space-y-6 max-w-2xl mx-auto">
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black">{bookingSuccess.hospital}</h1>
                  <p className="text-xs text-gray-700">Official Outpatient Token Receipt</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Token</span>
                  <span className="text-2xl font-black block">{bookingSuccess.tokenNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border border-gray-300 p-4 rounded bg-gray-50">
                <div><strong>Patient:</strong> {bookingSuccess.patientName}</div>
                <div><strong>Age/Gender:</strong> {bookingSuccess.age}Y • {bookingSuccess.gender}</div>
                <div><strong>Account:</strong> {bookingSuccess.patientEmail}</div>
                <div><strong>Status:</strong> {bookingSuccess.status}</div>
              </div>

              <div className="border border-gray-300 rounded divide-y divide-gray-200 text-xs">
                <div className="grid grid-cols-3 p-3 bg-gray-100 font-semibold">
                  <div>Physician</div>
                  <div>Department</div>
                  <div className="text-right">Schedule</div>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <div><strong>{bookingSuccess.doctorName}</strong></div>
                  <div>{bookingSuccess.department}</div>
                  <div className="text-right font-bold">{bookingSuccess.date} • {bookingSuccess.timeSlot}</div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t-2 border-dashed border-gray-400 pt-4 text-xs">
                <p className="text-[10px] text-gray-500">Strict Single-Occupancy Slot. Please arrive 15 minutes prior to appointment.</p>
                <div>
                  <span className="text-[10px] text-gray-500 block text-right">Fee Paid</span>
                  <strong className="text-lg font-black">{bookingSuccess.fee}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <p className="text-xs text-slate-400 mt-1">
                Strict 1-patient per slot. Once booked, the slot is locked for all other members.
              </p>
            </div>
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
                    Slot confirmed exclusively for <strong>{bookingSuccess.patientName}</strong> with {bookingSuccess.doctorName} on {bookingSuccess.date} at {bookingSuccess.timeSlot}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  <a
                    href={buildGoogleCalendarUrl(bookingSuccess)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                  >
                    <CalendarPlus className="w-4 h-4" /> Open in Google Calendar
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                  >
                    <Printer className="w-4 h-4" /> Print Slip
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingSuccess(null);
                      setPatientFirstName('');
                      setPatientLastName('');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    + Book For Another Family Member
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* AREA 1: SEPARATE DOCTOR SEARCH & SELECTION */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Search & Select Specialist
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                        selectedSpecialty === spec
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
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
                  const hasLeave = leaves.some(l => l.doctorId === doc.id && l.leaveDate === selectedDate);

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

                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <Award className="w-3 h-3 text-blue-400" /> {doc.qualification}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <Briefcase className="w-3 h-3 text-amber-400" /> {doc.experience}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {doc.rating || '4.9 ★'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{doc.bio}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span className="truncate max-w-[200px]">{doc.hospital}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectDoctor(doc);
                          }}
                          className="text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Full Profile <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {hasLeave && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                          <CalendarX2 className="w-3 h-3" /> On Leave on {selectedDate}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AREA 2: SINGLE PATIENT SLOT BOOKING */}
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Patient / Family Member Identity
                    </span>
                    <span className="text-[10px] text-slate-400">Strict 1 Patient per Slot</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={patientFirstName}
                        onChange={(e) => {
                          setPatientFirstName(e.target.value);
                          setSlotConflictError(null);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={patientLastName}
                        onChange={(e) => {
                          setPatientLastName(e.target.value);
                          setSlotConflictError(null);
                        }}
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
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Shared Account Email</label>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                  />
                </div>

                {isDoctorOnLeave ? (
                  <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                    {selectedDoctor.name} is on approved leave on {selectedDate}.
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Available Consultation Slots (1 Patient Per Slot)
                      </label>
                      <span className="text-[10px] text-slate-500">Exclusively locked once booked</span>
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
                              title={slotInfo.reason}
                              className="py-2.5 px-3 rounded-xl text-left bg-red-950/20 border border-red-500/30 opacity-60 cursor-not-allowed flex flex-col justify-between"
                            >
                              <span className="text-xs font-bold text-red-300">{slot}</span>
                              <span className="text-[9px] text-red-400 mt-1 truncate">
                                {slotInfo.statusType === 'SELF_RESERVED'
                                  ? 'Booked for you'
                                  : slotInfo.statusType === 'MEMBER_BUSY'
                                  ? 'Busy (Other Dr)'
                                  : 'Reserved'}
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSlotConflictError(null);
                            }}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex flex-col justify-between ${
                              isSlotSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span>{slot}</span>
                            <span className={`text-[9px] ${isSlotSelected ? 'text-slate-900' : 'text-emerald-400'}`}>
                              Available
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chief Complaint</label>
                  <textarea
                    rows={2}
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms or clinical notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={Boolean(isDoctorOnLeave)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Confirm & Lock Slot for {currentMemberName} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {inspectDoctor && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{inspectDoctor.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{inspectDoctor.specialisation}</p>
                  </div>
                  <button
                    onClick={() => setInspectDoctor(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Qualification</span>
                      <strong>{inspectDoctor.qualification}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Experience</span>
                      <strong>{inspectDoctor.experience}</strong>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 block uppercase">Consultation Fee</span>
                      <strong className="text-emerald-400">{inspectDoctor.fee}</strong>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 block uppercase">Rating</span>
                      <strong className="text-yellow-400">{inspectDoctor.rating || '4.9 ★'}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Affiliated Hospital</span>
                    <p className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-medium">{inspectDoctor.hospital}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Physician Bio & Specialties</span>
                    <p className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed text-slate-300">
                      {inspectDoctor.bio}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctor(inspectDoctor);
                    setInspectDoctor(null);
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Select {inspectDoctor.name} for Booking
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}
