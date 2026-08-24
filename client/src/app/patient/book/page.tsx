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
  Mail, Printer
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

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(DEFAULT_DOCTORS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(DEFAULT_DOCTORS[0]);
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  
  const [patientFirstName, setPatientFirstName] = useState(() => user?.firstName || 'Ritika');
  const [patientLastName, setPatientLastName] = useState(() => user?.lastName || 'Kushwaha');
  const [patientAge, setPatientAge] = useState('21');
  const [patientGender, setPatientGender] = useState('Female');
  const [patientEmail, setPatientEmail] = useState(() => user?.email || 'ritikakushwaha62@gmail.com');
  const [chiefComplaint, setChiefComplaint] = useState('Routine consultation');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<AppointmentItem | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await fetch('/api/sync/doctors', { cache: 'no-store' });
        const docData = await docRes.json();
        if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
          setDoctors(docData.doctors);
          setSelectedDoctor(docData.doctors[0]);
        }
      } catch {}

      try {
        const apptRes = await fetch('/api/sync/appointments', { cache: 'no-store' });
        const apptData = await apptRes.json();
        if (apptData.success && Array.isArray(apptData.appointments)) {
          setAppointments(apptData.appointments);
        }
      } catch {}
    };

    fetchData();
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach(d => { if (d.specialisation) set.add(d.specialisation); });
    return ['ALL', ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (selectedDept === 'ALL') return doctors;
    return doctors.filter(d => d.specialisation.toLowerCase() === selectedDept.toLowerCase());
  }, [doctors, selectedDept]);

  const triggerInstantEmail = async (apt: AppointmentItem) => {
    if (!apt) return;
    setEmailSending(true);
    const targetEmail = (apt.patientEmail || patientEmail || user?.email || 'ritikakushwaha62@gmail.com').trim().toLowerCase();

    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'APPOINTMENT_CONFIRMATION',
          recipientEmail: targetEmail,
          patientEmail: targetEmail,
          doctorEmail: apt.doctorEmail,
          patientName: apt.patientName,
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
        alert(`Confirmation & Reminder email successfully sent to ${targetEmail}!`);
      } else {
        alert(`Email Notice: ${data.error || 'Check SMTP configuration'}`);
      }
    } catch {
      alert('Network error connecting to email API.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) {
      alert('Please select a doctor.');
      return;
    }

    setBookingLoading(true);
    const cleanEmail = (patientEmail || user?.email || 'ritikakushwaha62@gmail.com').trim().toLowerCase();
    const cleanName = `${patientFirstName} ${patientLastName}`.trim() || 'Patient Member';
    const newToken = `TK-${Math.floor(100 + Math.random() * 900)}`;

    const newAppointment: AppointmentItem = {
      id: `apt-${Date.now()}`,
      tokenNumber: newToken,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorEmail: selectedDoctor.email,
      department: selectedDoctor.specialisation,
      fee: selectedDoctor.fee,
      date: selectedDate,
      timeSlot: selectedSlot,
      symptoms: chiefComplaint || 'General Outpatient Consultation',
      patientName: cleanName,
      patientEmail: cleanEmail,
      age: patientAge || 21,
      gender: patientGender || 'Female',
      status: 'CONFIRMED',
    };

    try {
      const updated = [newAppointment, ...appointments];
      setAppointments(updated);

      await fetch('/api/sync/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: updated })
      });

      // Dispatch automated booking confirmation email
      try {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'APPOINTMENT_CONFIRMATION',
            recipientEmail: cleanEmail,
            patientEmail: cleanEmail,
            doctorEmail: selectedDoctor.email,
            patientName: cleanName,
            doctorName: selectedDoctor.name,
            specialisation: selectedDoctor.specialisation,
            date: selectedDate,
            timeSlot: selectedSlot,
            tokenNumber: newToken,
            fee: selectedDoctor.fee
          })
        });
      } catch (mailErr) {
        console.warn('Auto mail error:', mailErr);
      }

      setBookedAppointment(newAppointment);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
          
          {bookedAppointment && (
            <div className="p-6 rounded-3xl bg-emerald-950/50 border border-emerald-500/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span>Slot Confirmed • Token {bookedAppointment.tokenNumber}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Confirmed for <strong className="text-white">{bookedAppointment.patientName}</strong> with <strong className="text-emerald-300">{bookedAppointment.doctorName}</strong> on {bookedAppointment.date} at {bookedAppointment.timeSlot}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerInstantEmail(bookedAppointment)}
                    disabled={emailSending}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" /> {emailSending ? 'Sending Email...' : 'Send Confirmation / Reminder Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-4 h-4" /> Print Slip
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consulting Physician</span>
                  <strong className="text-white text-sm block mt-0.5">{bookedAppointment.doctorName}</strong>
                  <span className="text-emerald-400">{bookedAppointment.department}</span>
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time Slot</span>
                  <strong className="text-white text-sm block mt-0.5">{bookedAppointment.date}</strong>
                  <span className="text-amber-300">{bookedAppointment.timeSlot}</span>
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Details</span>
                  <strong className="text-white text-sm block mt-0.5">{bookedAppointment.patientName}</strong>
                  <span className="text-slate-400">{bookedAppointment.patientEmail}</span>
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                  <strong className="text-emerald-300 text-sm block mt-0.5">{bookedAppointment.fee}</strong>
                  <span className="text-slate-400">PrimeCare Hospital</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* DOCTORS SELECTION COLUMN */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" /> Select Specialist ({filteredDoctors.length})
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {departments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedDept === dept
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredDoctors.map(doc => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-5 rounded-3xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-base text-white">{doc.name}</h3>
                            <span className="text-xs font-semibold text-emerald-400">{doc.specialisation}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            {doc.fee}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{doc.hospital} • {doc.qualification}</p>
                      </div>
                      <p className="text-xs text-slate-300 italic line-clamp-2">&quot;{doc.bio}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOOKING FORM COLUMN */}
            <div className="lg:col-span-7">
              <form onSubmit={handleBooking} className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Appointment Details</span>
                  <h3 className="text-2xl font-extrabold text-white mt-0.5">{selectedDoctor?.name || 'Select a Physician'}</h3>
                  <p className="text-xs text-slate-400">{selectedDoctor?.specialisation} • {selectedDoctor?.hospital}</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={patientFirstName}
                        onChange={(e) => setPatientFirstName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={patientLastName}
                        onChange={(e) => setPatientLastName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Age</label>
                      <input
                        type="number"
                        required
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Email Address (For Confirmation)</label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Select Consultation Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Available Consultation Time Slots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Chief Medical Complaint / Symptoms</label>
                    <textarea
                      rows={2}
                      required
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingLoading ? 'Confirming Appointment...' : 'Confirm Appointment & Send Email'}
                </button>
              </form>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
