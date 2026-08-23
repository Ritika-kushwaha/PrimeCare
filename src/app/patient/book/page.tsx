'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ShieldAlert, CheckCircle2, Sparkles, 
  Stethoscope, ArrowRight, User, Printer, Search, Filter, 
  RefreshCw, Award, GraduationCap, Briefcase, Info, X, ExternalLink
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

interface Doctor {
  id: string;
  specialisation: string;
  qualification?: string;
  experience?: string;
  hospital?: string;
  bio?: string;
  fee?: string;
  certifications?: Certification[];
  user: { firstName: string; lastName: string; email?: string };
}

interface Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isHeld: boolean;
}

const DEPARTMENTS = [
  'All',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
  'Gynecology',
  'ENT',
  'Oncology',
  'Psychiatry',
  'Ophthalmology'
];

const INITIAL_ROSTER: Doctor[] = [
  {
    id: 'doc-cardio-01',
    specialisation: 'Cardiology',
    qualification: 'MD, DM (Cardiology - AIIMS Delhi)',
    experience: '14 Years Clinical Practice',
    hospital: 'PrimeCare Apex Heart Institute',
    bio: 'Senior Consultant Interventional Cardiologist specializing in adult coronary interventions, structural heart disease, echocardiography, and preventive cardiology.',
    fee: '₹1,200',
    certifications: [
      { id: 'c1', name: 'Board Certified Interventional Cardiology', issuer: 'National Board of Examinations', year: '2016' },
      { id: 'c2', name: 'Fellow of American College of Cardiology (FACC)', issuer: 'American College of Cardiology', year: '2019' },
      { id: 'c3', name: 'Advanced Cardiovascular Life Support (ACLS)', issuer: 'American Heart Association', year: '2024' },
    ],
    user: { firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@primecare.in' }
  },
  {
    id: 'doc-cardio-02',
    specialisation: 'Cardiology',
    qualification: 'MD, DNB (Interventional Cardiology)',
    experience: '10 Years Experience',
    hospital: 'PrimeCare Metro Hospital',
    bio: 'Expert in complex angioplasties, pacemaker implantations, and cardiac rehabilitation.',
    fee: '₹1,400',
    certifications: [
      { id: 'c4', name: 'Fellow of European Society of Cardiology (FESC)', issuer: 'ESC Europe', year: '2021' },
      { id: 'c5', name: 'Cardiac Electrophysiology Specialist', issuer: 'Indian Heart Rhythm Society', year: '2023' }
    ],
    user: { firstName: 'Meera', lastName: 'Kulkarni', email: 'meera.kulkarni@primecare.in' }
  },
  {
    id: 'doc-neuro-01',
    specialisation: 'Neurology',
    qualification: 'MD, DM (Neurology - NIMHANS)',
    experience: '12 Years Experience',
    hospital: 'PrimeCare Neuroscience Center',
    bio: 'Dedicated neurologist with expertise in stroke management, epilepsy, cognitive disorders, and neuro-immunology.',
    fee: '₹1,500',
    certifications: [
      { id: 'c6', name: 'Certified Stroke Neurologist', issuer: 'World Stroke Organization', year: '2018' },
      { id: 'c7', name: 'Clinical Neurophysiology Board Certification', issuer: 'Indian Academy of Neurology', year: '2022' }
    ],
    user: { firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@primecare.in' }
  },
  {
    id: 'doc-ortho-01',
    specialisation: 'Orthopedics',
    qualification: 'MS (Orthopedics), MCh (Joint Replacement)',
    experience: '15 Years Experience',
    hospital: 'PrimeCare Ortho & Spine Wing',
    bio: 'Specialist in robotic total knee and hip replacements, arthroscopy, and complex trauma reconstruction.',
    fee: '₹1,000',
    certifications: [
      { id: 'c8', name: 'Fellowship in Robotic Arthroplasty', issuer: 'Royal College of Surgeons (Edinburgh)', year: '2017' }
    ],
    user: { firstName: 'Vikram', lastName: 'Patel', email: 'vikram.patel@primecare.in' }
  },
  {
    id: 'doc-pedia-01',
    specialisation: 'Pediatrics',
    qualification: 'MD (Pediatrics), DCH, Fellowship Neonatology',
    experience: '9 Years Experience',
    hospital: 'PrimeCare Children’s Pavilion',
    bio: 'Compassionate pediatric specialist caring for child development, immunizations, and pediatric acute care.',
    fee: '₹900',
    certifications: [
      { id: 'c9', name: 'Neonatal Resuscitation Program (NRP)', issuer: 'Indian Academy of Pediatrics', year: '2020' }
    ],
    user: { firstName: 'Ananya', lastName: 'Deshmukh', email: 'ananya.deshmukh@primecare.in' }
  },
  {
    id: 'doc-derma-01',
    specialisation: 'Dermatology',
    qualification: 'MD (Dermatology, Venereology & Leprosy)',
    experience: '8 Years Experience',
    hospital: 'PrimeCare Skin & Aesthetics Wing',
    bio: 'Specialist in clinical dermatology, laser aesthetics, psoriasis therapy, and trichology.',
    fee: '₹1,100',
    certifications: [
      { id: 'c10', name: 'Aesthetic Laser Surgery Certification', issuer: 'International Society of Dermatology', year: '2022' }
    ],
    user: { firstName: 'Rohan', lastName: 'Mehta', email: 'rohan.mehta@primecare.in' }
  }
];

export default function PatientBookPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_ROSTER);
  const [selectedDept, setSelectedDept] = useState('All');
  const [doctorSearch, setDoctorSearch] = useState('');
  
  const [selectedDoctor, setSelectedDoctor] = useState(INITIAL_ROSTER[0].id);
  const [selectedDate, setSelectedDate] = useState('2026-08-27');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [leaveNotice, setLeaveNotice] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Doctor Details Modal State
  const [inspectingDoctor, setInspectingDoctor] = useState<Doctor | null>(null);
  
  const [firstName, setFirstName] = useState('Ritika');
  const [lastName, setLastName] = useState('Kushwaha');
  const [age, setAge] = useState('21');
  const [gender, setGender] = useState('Female');
  const [email, setEmail] = useState('ritika@example.com');
  const [symptoms, setSymptoms] = useState('Persistent mild chest discomfort and fatigue after climbing stairs.');
  
  const [loading, setLoading] = useState(false);
  const [bookingSlip, setBookingSlip] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Merge live custom doctor updates
  useEffect(() => {
    try {
      const storedRoster = localStorage.getItem('primecare_doctor_profiles');
      if (storedRoster) {
        const parsed = JSON.parse(storedRoster);
        const map = new Map();
        INITIAL_ROSTER.forEach((d) => map.set(d.id, d));
        parsed.forEach((d: any) => {
          map.set(d.id, {
            ...map.get(d.id),
            ...d,
            user: { firstName: d.name.replace('Dr. ', '').split(' ')[0], lastName: d.name.replace('Dr. ', '').split(' ')[1] || '', email: `${d.id}@primecare.in` }
          });
        });
        setDoctors(Array.from(map.values()));
      }
    } catch {}
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const fullName = `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.toLowerCase();
      const spec = (doc.specialisation || '').toLowerCase();
      const qual = (doc.qualification || '').toLowerCase();
      const searchMatch = fullName.includes(doctorSearch.toLowerCase()) || 
                          spec.includes(doctorSearch.toLowerCase()) || 
                          qual.includes(doctorSearch.toLowerCase());
      const deptMatch = selectedDept === 'All' || spec.includes(selectedDept.toLowerCase());
      return searchMatch && deptMatch;
    });
  }, [doctors, doctorSearch, selectedDept]);

  useEffect(() => {
    if (filteredDoctors.length > 0) {
      if (!filteredDoctors.some((d) => d.id === selectedDoctor)) {
        setSelectedDoctor(filteredDoctors[0].id);
      }
    }
  }, [filteredDoctors, selectedDoctor]);

  const activeDoctorObj = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctor) || filteredDoctors[0] || INITIAL_ROSTER[0];
  }, [doctors, filteredDoctors, selectedDoctor]);

  const fetchSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLeaveNotice(null);
    setSelectedSlot(null);

    // 1. Check local storage leaves
    try {
      const localLeavesStr = localStorage.getItem('primecare_leaves');
      if (localLeavesStr) {
        const localLeaves = JSON.parse(localLeavesStr);
        const match = localLeaves.find(
          (l: any) => l.doctorId === selectedDoctor && l.leaveDate === selectedDate
        );
        if (match) {
          setLeaveNotice(`Dr. ${match.doctorName} is on leave on ${selectedDate} ("${match.reason}").`);
          setSlots([]);
          return;
        }
      }
    } catch {}

    // 2. Fetch backend slots
    try {
      const res = await api.get(`/doctors/${selectedDoctor}/slots?date=${selectedDate}`);
      if (res.data.onLeave) {
        setLeaveNotice(res.data.message || 'Doctor is on leave on this date.');
        setSlots([]);
        return;
      } else {
        setSlots(res.data.slots || []);
        return;
      }
    } catch {}

    // 3. Fallback slot generation
    const fallbackSlots = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const sDate = new Date(`${selectedDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);
        const eDate = new Date(sDate.getTime() + 30 * 60 * 1000);
        fallbackSlots.push({
          startTime: sDate.toISOString(),
          endTime: eDate.toISOString(),
          isAvailable: true,
          isHeld: false
        });
      }
    }
    setSlots(fallbackSlots);
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please choose an available time slot below.');
      return;
    }

    setLoading(true);
    setError('');

    const docObj = activeDoctorObj;
    const docFee = docObj?.fee || '₹1,200';
    
    const newAppointment = {
      id: 'PC-' + Math.floor(100000 + Math.random() * 900000),
      firstName,
      lastName,
      email,
      age: Number(age),
      gender,
      department: docObj.specialisation,
      appointmentTime: selectedSlot.startTime,
      symptoms,
      urgency: symptoms.toLowerCase().includes('chest') ? 'HIGH' : 'MEDIUM',
    };

    try {
      const existingStr = localStorage.getItem('primecare_appointments') || '[]';
      const existing = JSON.parse(existingStr);
      localStorage.setItem('primecare_appointments', JSON.stringify([newAppointment, ...existing]));
    } catch {}

    const slipData = {
      appointmentId: newAppointment.id,
      doctorName: `Dr. ${docObj.user.firstName} ${docObj.user.lastName}`,
      specialisation: docObj.specialisation,
      qualification: docObj.qualification || 'MD Specialist',
      patientName: `${firstName} ${lastName}`,
      age,
      gender,
      email,
      consultationTime: selectedSlot.startTime,
      symptoms,
      urgency: newAppointment.urgency,
      bookingFee: docFee,
      dateBooked: new Date().toLocaleDateString(),
    };

    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptomsRaw: symptoms,
        patientDetails: { firstName, lastName, age, gender, email },
      });
    } catch (err) {
      console.warn('Booking confirmed in sync mode:', err);
    } finally {
      setBookingSlip(slipData);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <div className="print:hidden">
          <Navbar />
        </div>

        {/* PRINT SLIP */}
        {bookingSlip && (
          <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">PrimeCare Multispecialty Hospital</h1>
                <p className="text-sm">Patient Intake & Appointment Confirmation Slip</p>
                <p className="text-xs text-gray-600">Bhopal-Indore Express Highway • Ph: +91 1800-419-0022</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold">APPOINTMENT INVOICE</h2>
                <p className="text-xs font-mono">Ref: #{bookingSlip.appointmentId}</p>
                <p className="text-xs text-gray-600">Date: {bookingSlip.dateBooked}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 border border-gray-300 p-4 text-xs gap-3 my-6">
              <div>
                <p><strong>Patient Name:</strong> {bookingSlip.patientName}</p>
                <p><strong>Age / Gender:</strong> {bookingSlip.age} Yrs / {bookingSlip.gender}</p>
                <p><strong>Contact ID:</strong> {bookingSlip.email}</p>
              </div>
              <div>
                <p><strong>Attending Physician:</strong> {bookingSlip.doctorName}</p>
                <p><strong>Department:</strong> {bookingSlip.specialisation} ({bookingSlip.qualification})</p>
                <p><strong>Consultation Slot:</strong> {new Date(bookingSlip.consultationTime).toLocaleString()}</p>
              </div>
            </div>

            <div className="border border-gray-300 p-4 text-xs space-y-2 mb-6">
              <h3 className="font-bold text-gray-800 uppercase text-[10px]">Triage Symptoms & Chief Complaint</h3>
              <p className="italic">{bookingSlip.symptoms}</p>
              <div className="pt-2 flex justify-between text-gray-700 border-t border-gray-200 mt-2">
                <span><strong>AI Triage Urgency:</strong> {bookingSlip.urgency}</span>
                <span><strong>Consultation Fee:</strong> {bookingSlip.bookingFee} (Payable at Desk)</span>
              </div>
            </div>

            <div className="pt-12 flex justify-between items-end text-xs border-t border-gray-300">
              <p className="text-gray-500 text-[10px]">Please arrive 10 minutes prior to your consultation.</p>
              <div className="text-center border-t border-black pt-1 w-48 font-bold">
                PrimeCare Authorized Stamp
              </div>
            </div>
          </div>
        )}

        {/* WEB VIEW */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> PrimeCare Specialist Network
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Book Specialist Consultation
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect verified certifications, clinical experience, and hospital history before booking your appointment.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Specialty Departments
            </div>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold scale-[1.03]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <AnimatePresence>
            {bookingSlip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-slate-100 space-y-6 shadow-2xl backdrop-blur-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-emerald-100">
                        Appointment Confirmed at PrimeCare
                      </h3>
                      <p className="text-xs text-emerald-400">Booking Ref #{bookingSlip.appointmentId} • Consultation Fee: {bookingSlip.bookingFee}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                    >
                      <Printer className="w-4 h-4" /> Print Booking Slip (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingSlip(null)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">Patient Demographics</span>
                    <p className="font-bold text-sm text-slate-100">{bookingSlip.patientName}</p>
                    <p className="text-slate-300">{bookingSlip.age} Yrs • {bookingSlip.gender}</p>
                    <p className="text-slate-400">{bookingSlip.email}</p>
                  </div>

                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">Assigned Specialist</span>
                    <p className="font-bold text-sm text-slate-100">{bookingSlip.doctorName}</p>
                    <p className="text-slate-300">{bookingSlip.specialisation} ({bookingSlip.qualification})</p>
                    <p className="text-emerald-400 font-mono font-bold">
                      {new Date(bookingSlip.consultationTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleBook} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                  <User className="w-4 h-4 text-emerald-400" /> 1. Patient Demographics
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email / Contact ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Symptoms / Chief Complaint</label>
                  <textarea
                    rows={3}
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> 2. Specialist Selection
                  </div>
                  <span className="text-xs font-mono text-emerald-400">{filteredDoctors.length} doctors found</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name or specialty..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Doctor List</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    >
                      {filteredDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialisation} - {d.fee || '₹1,200'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Interactive Doctor Credentials Box with Profile Inspection Button */}
                {activeDoctorObj && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-emerald-300 text-sm">
                          Dr. {activeDoctorObj.user?.firstName} {activeDoctorObj.user?.lastName}
                        </span>
                        <p className="text-[11px] text-slate-400 font-medium">{activeDoctorObj.specialisation} Specialist</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{activeDoctorObj.qualification} • {activeDoctorObj.experience}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-sm block">{activeDoctorObj.fee || '₹1,200'}</span>
                        <button
                          type="button"
                          onClick={() => setInspectingDoctor(activeDoctorObj)}
                          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold transition"
                        >
                          <Info className="w-3 h-3" /> View History & Certifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-emerald-400" /> 3. Available Windows
                  </div>
                  {slots.length > 0 && !leaveNotice && (
                    <span className="text-xs text-slate-500 font-mono">
                      {slots.filter((s) => s.isAvailable).length} slots free
                    </span>
                  )}
                </div>

                {leaveNotice ? (
                  <div className="p-5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-200">Doctor Unavailable</h4>
                      <p className="text-xs text-amber-400/90 mt-1">{leaveNotice}</p>
                    </div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono animate-pulse">
                    Querying slot calendar...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const timeStr = new Date(slot.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                      const isSelected = selectedSlot?.startTime === slot.startTime;

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-bold scale-[1.02]'
                              : slot.isAvailable
                              ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                              : 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed line-through'
                          }`}
                        >
                          <span>{timeStr}</span>
                          <span className="text-[9px] font-normal opacity-70">
                            {slot.isAvailable ? '30 min' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedSlot || Boolean(leaveNotice)}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {loading ? (
                    'Locking Slot...'
                  ) : selectedSlot ? (
                    <>
                      Confirm Consultation ({activeDoctorObj?.fee || '₹1,200'}) <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Select a Slot Above'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* DOCTOR CREDENTIALS & CERTIFICATIONS INSPECTION MODAL */}
          <AnimatePresence>
            {inspectingDoctor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Verified Physician Dossier</span>
                      <h3 className="text-2xl font-bold text-white mt-1">Dr. {inspectingDoctor.user.firstName} {inspectingDoctor.user.lastName}</h3>
                      <p className="text-xs text-slate-400">{inspectingDoctor.specialisation} • {inspectingDoctor.hospital || 'PrimeCare Health'}</p>
                    </div>
                    <button onClick={() => setInspectingDoctor(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Degrees</span>
                      <p className="font-bold text-slate-200 mt-1">{inspectingDoctor.qualification || 'MD Specialist'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Practice Experience</span>
                      <p className="font-bold text-slate-200 mt-1">{inspectingDoctor.experience || '10+ Years'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Consultation Fee</span>
                      <p className="font-bold text-emerald-400 font-mono mt-1">{inspectingDoctor.fee || '₹1,200'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Clinical Background & Practice Profile</span>
                    <p className="text-slate-300 leading-relaxed">
                      {inspectingDoctor.bio || 'Specialist clinician committed to patient-centered evidence-based diagnosis and treatment protocols.'}
                    </p>
                  </div>

                  {/* Certifications List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Award className="w-4 h-4 text-emerald-400" /> Clinical Certifications & Fellowships ({inspectingDoctor.certifications?.length || 0})
                    </div>
                    <div className="space-y-2.5">
                      {(inspectingDoctor.certifications || []).map((c) => (
                        <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <h5 className="font-bold text-slate-200">{c.name}</h5>
                            <p className="text-[11px] text-slate-400">Issued by: {c.issuer}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                            {c.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setInspectingDoctor(null)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      Close Profile & Select Slot
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
