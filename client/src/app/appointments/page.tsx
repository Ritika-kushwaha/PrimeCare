'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Stethoscope, User, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Search, Building2, Award, CalendarX2, Ban, Users, Printer, CalendarPlus
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  specialisation: string;
  qualification: string;
  experience: string;
  hospital: string;
  fee: string;
  bio?: string;
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
  doctorId?: string;
  doctorName?: string;
  department?: string;
  fee?: string;
  hospital?: string;
  date?: string;
  timeSlot?: string;
  symptoms?: string;
  patientName?: string;
  patientEmail?: string;
  age?: string;
  gender?: string;
  bookingDate?: string;
  status?: string;
}

const DEFAULT_DOCTORS: DoctorProfile[] = [
  { id: 'doc-cardio-01', name: 'Dr. Aarav Sharma', specialisation: 'Cardiology', qualification: 'MD, DM (Cardiology - AIIMS Delhi)', experience: '14 Years Practice', hospital: 'PrimeCare Apex Heart Institute', fee: '₹1,200', bio: 'Senior Interventional Cardiologist specializing in preventive heart health and echo.' },
  { id: 'doc-cardio-02', name: 'Dr. Meera Kulkarni', specialisation: 'Cardiology', qualification: 'MD, DNB (Cardiology)', experience: '10 Years Practice', hospital: 'PrimeCare Metro Hospital', fee: '₹1,400', bio: 'Specialist in non-invasive imaging and complex coronary care.' },
  { id: 'doc-neuro-01', name: 'Dr. Priya Nair', specialisation: 'Neurology', qualification: 'MD, DM (Neurology - NIMHANS)', experience: '12 Years Practice', hospital: 'PrimeCare Neuroscience Center', fee: '₹1,500', bio: 'Neurologist with stroke and epilepsy expertise.' },
  { id: 'doc-ortho-01', name: 'Dr. Vikram Patel', specialisation: 'Orthopedics', qualification: 'MS (Orthopedics), MCh', experience: '15 Years Practice', hospital: 'PrimeCare Ortho Wing', fee: '₹1,000', bio: 'Joint replacement and arthroscopy surgeon.' },
  { id: 'doc-pedia-01', name: 'Dr. Ananya Deshmukh', specialisation: 'Pediatrics', qualification: 'MD (Pediatrics), DCH', experience: '9 Years Practice', hospital: 'PrimeCare Children Pavilion', fee: '₹900', bio: 'Pediatric care and immunization specialist.' },
  { id: 'doc-derma-01', name: 'Dr. Rohan Mehta', specialisation: 'Dermatology', qualification: 'MD (Dermatology)', experience: '8 Years Practice', hospital: 'PrimeCare Skin Clinic', fee: '₹1,100', bio: 'Clinical dermatology & aesthetics.' },
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
  
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(DEFAULT_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  
  const [patientFirstName, setPatientFirstName] = useState('Ritika');
  const [patientLastName, setPatientLastName] = useState('Kushwaha');
  const [patientAge, setPatientAge] = useState('21');
  const [patientGender, setPatientGender] = useState('Female');
  const [sharedEmail, setSharedEmail] = useState('ritikakushwaha62@gmail.com');
  const [symptoms, setSymptoms] = useState('Routine cardiovascular checkup');
  
  const [searchDoc, setSearchDoc] = useState('');
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

  // Count slot usage for the shared email (allowing up to 2 family members in same slot)
  const bookedSlotsForEmail = useMemo(() => {
    const cleanEmail = (sharedEmail || '').trim().toLowerCase();
    const map = new Map<string, AppointmentItem[]>();
    
    if (!cleanEmail) return map;

    existingAppointments.forEach((a) => {
      if (!a) return;
      const aEmail = (a.patientEmail || '').toLowerCase().trim();
      const aDate = (a.date || '').trim();
      const aSlot = (a.timeSlot || '').trim();

      if (aEmail === cleanEmail && aDate === selectedDate && aSlot) {
        const currentList = map.get(aSlot) || [];
        map.set(aSlot, [...currentList, a]);
      }
    });
    return map;
  }, [existingAppointments, sharedEmail, selectedDate]);

  const filteredDoctors = useMemo(() => {
    const query = (searchDoc || '').toLowerCase().trim();
    return doctors.filter((d) => {
      if (!d) return false;
      const full = `${d.name || ''} ${d.specialisation || ''} ${d.hospital || ''}`.toLowerCase();
      return full.includes(query);
    });
  }, [doctors, searchDoc]);

  const getGoogleCalendarUrl = (item: AppointmentItem) => {
    try {
      const dateParts = (item.date || '2026-08-28').split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];

      const slot = item.timeSlot || '10:00 AM';
      const [time, meridian] = slot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startUtc = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
      
      let endHours = hours;
      let endMinutes = minutes + 45;
      if (endMinutes >= 60) {
        endHours += 1;
        endMinutes -= 60;
      }
      const endUtc = `${year}${month}${day}T${pad(endHours)}${pad(endMinutes)}00`;

      const title = encodeURIComponent(`🩺 Consultation: ${item.doctorName} (${item.department})`);
      const details = encodeURIComponent(`Patient: ${item.patientName}\nToken: ${item.tokenNumber}\nDepartment: ${item.department}\nHospital: ${item.hospital}`);
      const location = encodeURIComponent(item.hospital || 'PrimeCare Hospital');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
    } catch {
      return 'https://calendar.google.com';
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotConflictError(null);

    const cleanEmail = (sharedEmail || '').trim().toLowerCase();
    const fullName = `${(patientFirstName || '').trim()} ${(patientLastName || '').trim()}`.trim();

    if (isDoctorOnLeave) {
      alert(`${selectedDoctor.name} is on approved leave on ${selectedDate}.`);
      return;
    }

    const slotBookings = bookedSlotsForEmail.get(selectedSlot) || [];

    // Allow up to 2 family members per slot
    if (slotBookings.length >= 2) {
      setSlotConflictError(
        `Slot ${selectedSlot} on ${selectedDate} has reached maximum family limit (2 members already booked). Please pick another slot.`
      );
      return;
    }

    // Check if the same member name is already booked in that slot
    const duplicateMember = slotBookings.find(
      (b) => (b.patientName || '').toLowerCase() === fullName.toLowerCase()
    );
    if (duplicateMember) {
      setSlotConflictError(
        `${fullName} already has a confirmed booking in slot ${selectedSlot}. You can book a second family member in this slot.`
      );
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
      patientName: fullName || 'Patient Member',
      patientEmail: cleanEmail || 'patient@primecare.in',
      age: patientAge,
      gender: patientGender,
      bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'CONFIRMED',
    };

    const updated = [appointment, ...existingAppointments];
    setExistingAppointments(updated);
    localStorage.setItem('primecare_appointments', JSON.stringify(updated));

    try {
      await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
    } catch {}

    setBookingSuccess(appointment);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* PRINTABLE BOOKING SLIP */}
        {bookingSuccess && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            <div className="border-2 border-black p-6 rounded-lg space-y-6 max-w-2xl mx-auto">
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-950">PrimeCare Multispecialty Hospital</h1>
                  <p className="text-xs font-semibold text-gray-700">{bookingSuccess.hospital || 'PrimeCare Apex Health Institute'}</p>
                </div>
                <div className="text-right border-l-2 border-gray-300 pl-4">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Queue Token</span>
                  <span className="text-2xl font-black text-gray-950">{bookingSuccess.tokenNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border border-gray-300 p-4 rounded bg-gray-50/50">
                <div><strong>Patient:</strong> {bookingSuccess.patientName}</div>
                <div><strong>Age/Gender:</strong> {bookingSuccess.age || '21'}Y • {bookingSuccess.gender || 'Female'}</div>
                <div><strong>Email:</strong> {bookingSuccess.patientEmail}</div>
                <div><strong>Status:</strong> {bookingSuccess.status}</div>
              </div>

              <div className="border border-gray-300 rounded divide-y divide-gray-200 text-xs">
                <div className="grid grid-cols-3 p-3 bg-gray-100 font-semibold text-gray-700">
                  <div>Physician</div>
                  <div>Department</div>
                  <div className="text-right">Date & Time</div>
                </div>
                <div className="grid grid-cols-3 p-3 font-medium">
                  <div><strong>{bookingSuccess.doctorName}</strong></div>
                  <div>{bookingSuccess.department}</div>
                  <div className="text-right font-bold">{bookingSuccess.date} • {bookingSuccess.timeSlot}</div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t-2 border-dashed border-gray-400 pt-4 text-xs">
                <p className="text-[10px] text-gray-500">Please arrive 15 minutes before your scheduled slot.</p>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase block">Fee</span>
                  <strong className="text-lg font-black text-gray-950">{bookingSuccess.fee}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Outpatient Booking Desk
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Book Doctor Consultation
            </h1>
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
                    {bookingSuccess.patientName} with {bookingSuccess.doctorName} on {bookingSuccess.date} at {bookingSuccess.timeSlot}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  <a
                    href={getGoogleCalendarUrl(bookingSuccess)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                  >
                    <CalendarPlus className="w-4 h-4" /> Add to Google Calendar
                  </a>

                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                  >
                    <Printer className="w-4 h-4" /> Print Booking Slip
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {slotConflictError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs shadow-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{slotConflictError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* DOCTOR DIRECTORY */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  placeholder="Search doctor..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc, idx) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  const hasLeave = leaves.some(l => l.doctorId === doc.id && l.leaveDate === selectedDate);
                  const docKey = doc.id || `doc-card-${idx}`;

                  return (
                    <div
                      key={docKey}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                          <span className="text-xs text-emerald-400 font-semibold">{doc.specialisation}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          {doc.fee}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Award className="w-3 h-3 text-blue-400" /> {doc.qualification}</span>
                        <span>•</span>
                        <span>{doc.experience}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{doc.hospital}</p>
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

            {/* FORM */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleBooking} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">{selectedDoctor.name}</h3>
                    <p className="text-xs text-emerald-400">{selectedDoctor.specialisation} • {selectedDoctor.hospital}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{selectedDoctor.qualification} ({selectedDoctor.experience})</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    Fee: {selectedDoctor.fee}
                  </span>
                </div>

                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Patient Details (Book for Family / Self)
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                  />
                </div>

                {isDoctorOnLeave ? (
                  <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                    Physician is on approved leave on {selectedDate}.
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Available Slots (Max 2 Members per Slot)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {TIME_SLOTS.map((slot) => {
                        const slotBookings = bookedSlotsForEmail.get(slot) || [];
                        const isFull = slotBookings.length >= 2;
                        const isSlotSelected = selectedSlot === slot;

                        if (isFull) {
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled
                              className="py-2 px-2 rounded-xl text-[11px] font-semibold bg-red-950/30 border border-red-500/40 text-red-400 opacity-60 cursor-not-allowed text-left"
                            >
                              <span className="block font-bold">{slot}</span>
                              <span className="text-[9px] text-red-300 block truncate">2/2 Booked</span>
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
                            {slotBookings.length === 1 && (
                              <span className={`text-[9px] font-semibold ${isSlotSelected ? 'text-slate-900' : 'text-emerald-400'}`}>
                                (1 member in slot)
                              </span>
                            )}
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
                    placeholder="Brief description..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={Boolean(isDoctorOnLeave)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Confirm Appointment & Generate Slip <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
