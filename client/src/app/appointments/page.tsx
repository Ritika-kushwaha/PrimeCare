"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Stethoscope, Calendar, Clock, User, Mail, 
  Phone, Users, CheckCircle2, AlertCircle, Award, 
  Briefcase, Star, Sparkles 
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialisation: string;
  qualification: string;
  experience: string;
  fees: string;
  rating: string;
  availableDays: string;
  bio: string;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Aarav Sharma",
    specialisation: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    experience: "12+ Years",
    fees: "₹800",
    rating: "4.9 ★",
    availableDays: "Mon - Sat",
    bio: "Senior Interventional Cardiologist specializing in preventive heart health, ECG, and echocardiography."
  },
  {
    id: "doc-2",
    name: "Dr. Priya Patel",
    specialisation: "Neurology",
    qualification: "MBBS, MD (Medicine), DM (Neurology)",
    experience: "9+ Years",
    fees: "₹950",
    rating: "4.8 ★",
    availableDays: "Mon - Fri",
    bio: "Consultant Neurologist focused on headache syndromes, neuropathies, and stroke rehabilitation."
  },
  {
    id: "doc-3",
    name: "Dr. Rajesh Verma",
    specialisation: "Orthopedics",
    qualification: "MBBS, MS (Ortho), DNB (Ortho)",
    experience: "15+ Years",
    fees: "₹750",
    rating: "4.9 ★",
    availableDays: "Tue - Sun",
    bio: "Joint replacement and sports injury specialist with extensive arthroscopic surgical experience."
  },
  {
    id: "doc-4",
    name: "Dr. Ananya Iyer",
    specialisation: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics), DCH",
    experience: "8+ Years",
    fees: "₹600",
    rating: "5.0 ★",
    availableDays: "Mon - Sat",
    bio: "Dedicated child care specialist offering immunizations, developmental assessments, and pediatric triage."
  }
];

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(DEFAULT_DOCTORS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DEFAULT_DOCTORS[0].id);
  
  // Booking Form State
  const [accountEmail, setAccountEmail] = useState("");
  const [bookingFor, setBookingFor] = useState<"SELF" | "FAMILY">("SELF");
  const [patientName, setPatientName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("Spouse");
  const [patientAge, setPatientAge] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00 AM");
  const [symptoms, setSymptoms] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Load dynamically registered doctors from local cache if present
  useEffect(() => {
    try {
      const storedRegisteredUsers = JSON.parse(localStorage.getItem("primecare_registered_users") || "[]");
      const loggedIn = storedRegisteredUsers.find((u: any) => u.role === "PATIENT");
      if (loggedIn) {
        setAccountEmail(loggedIn.email || "");
        setPatientName(`${loggedIn.firstName || ""} ${loggedIn.lastName || ""}`.trim());
      }

      const storedDocs = JSON.parse(localStorage.getItem("primecare_doctor_profiles") || "[]");
      if (storedDocs.length > 0) {
        setDoctors([...DEFAULT_DOCTORS, ...storedDocs]);
      }
    } catch {}
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = accountEmail.trim().toLowerCase();
    const cleanPatient = patientName.trim();

    if (!cleanPatient) {
      setError("Please enter the patient's full name.");
      setLoading(false);
      return;
    }

    try {
      const storedBookings = JSON.parse(localStorage.getItem("primecare_appointments") || "[]");

      // 1. Same Slot Multi-Family Member Logic (Allow up to 2 distinct members per slot)
      const slotAppointments = storedBookings.filter(
        (b: any) =>
          b.doctorId === selectedDoctor.id &&
          b.date === appointmentDate &&
          b.time === appointmentTime
      );

      // Check if slot reached hard capacity of 2
      if (slotAppointments.length >= 2) {
        setError(`This time slot (${appointmentTime} on ${appointmentDate}) is fully booked. Please select another slot.`);
        setLoading(false);
        return;
      }

      // Check if the exact SAME family member name is already registered for this slot
      const duplicatePerson = slotAppointments.some(
        (b: any) => b.patientName.toLowerCase() === cleanPatient.toLowerCase()
      );
      if (duplicatePerson) {
        setError(`${cleanPatient} already has a confirmed booking for this exact slot.`);
        setLoading(false);
        return;
      }

      const newBooking = {
        id: `apt-${Date.now()}`,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialisation: selectedDoctor.specialisation,
        fees: selectedDoctor.fees,
        accountEmail: cleanEmail,
        patientName: cleanPatient,
        bookingFor,
        familyRelation: bookingFor === "FAMILY" ? familyRelation : "Self",
        patientAge,
        patientPhone,
        date: appointmentDate,
        time: appointmentTime,
        symptoms,
        status: "CONFIRMED",
        createdAt: new Date().toISOString()
      };

      localStorage.setItem("primecare_appointments", JSON.stringify([newBooking, ...storedBookings]));
      setSuccessBooking(newBooking);
    } catch (err) {
      setError("Failed to reserve appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl flex items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-400" /> Book Consultation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Schedule appointments for yourself and multiple family members using a single email. Up to 2 family members can be booked in the same slot.
          </p>
        </div>

        {successBooking ? (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold text-white">Appointment Confirmed!</h2>
                <p className="text-xs text-slate-400">Booking ID: {successBooking.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Patient:</span>
                <p className="font-bold text-white text-sm">{successBooking.patientName} ({successBooking.familyRelation})</p>
              </div>
              <div>
                <span className="text-slate-400">Account Email:</span>
                <p className="font-bold text-white text-sm">{successBooking.accountEmail}</p>
              </div>
              <div>
                <span className="text-slate-400">Doctor:</span>
                <p className="font-bold text-white text-sm">{successBooking.doctorName}</p>
              </div>
              <div>
                <span className="text-slate-400">Specialisation:</span>
                <p className="font-bold text-emerald-400 text-sm">{successBooking.specialisation}</p>
              </div>
              <div>
                <span className="text-slate-400">Date & Slot:</span>
                <p className="font-bold text-white text-sm">{successBooking.date} at {successBooking.time}</p>
              </div>
              <div>
                <span className="text-slate-400">Consultation Fee:</span>
                <p className="font-bold text-white text-sm">{successBooking.fees}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSuccessBooking(null);
                  setPatientName("");
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                + Book Another Family Member
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* DOCTOR DETAILS COLUMN */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-base font-bold text-slate-300 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" /> Select Specialist
              </h2>

              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      selectedDoctor.id === doc.id
                        ? "bg-slate-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">{doc.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {doc.fees}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-400 font-medium">
                      {doc.specialisation}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-blue-400" /> {doc.qualification}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" /> {doc.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {doc.rating}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* APPOINTMENT FORM COLUMN */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleBooking}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
              >
                <div>
                  <h2 className="text-lg font-bold text-white">Appointment Details</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Booking with <span className="text-emerald-400 font-bold">{selectedDoctor.name}</span> ({selectedDoctor.specialisation})
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Account / Contact Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Account Email (Receives All Family Booking Confirmations)
                  </label>
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* WHO IS THIS APPOINTMENT FOR? (SELF OR FAMILY MEMBER) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Who is this appointment for?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingFor("SELF")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        bookingFor === "SELF"
                          ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-md"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <User className="w-4 h-4" /> Myself
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingFor("FAMILY")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        bookingFor === "FAMILY"
                          ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-md"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Users className="w-4 h-4" /> Family Member
                    </button>
                  </div>
                </div>

                {/* Patient Information Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {bookingFor === "SELF" ? "Patient Full Name" : "Family Member's Full Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={bookingFor === "SELF" ? "Your full name" : "e.g. Ramesh Kushwaha"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {bookingFor === "FAMILY" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Relationship</label>
                      <select
                        value={familyRelation}
                        onChange={(e) => setFamilyRelation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent / Mother / Father</option>
                        <option value="Child">Child / Son / Daughter</option>
                        <option value="Sibling">Brother / Sister</option>
                        <option value="Other">Other Family Relative</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* SLOT SELECTION (DATE & TIME) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Consultation Date
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Consultation Time Slot
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                    >
                      <option value="09:00 AM">09:00 AM - Morning</option>
                      <option value="10:00 AM">10:00 AM - Morning</option>
                      <option value="11:30 AM">11:30 AM - Morning</option>
                      <option value="02:00 PM">02:00 PM - Afternoon</option>
                      <option value="03:30 PM">03:30 PM - Afternoon</option>
                      <option value="05:00 PM">05:00 PM - Evening</option>
                      <option value="06:30 PM">06:30 PM - Evening</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Reason / Chief Complaints (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms, medical history, or specific health concerns..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? "Confirming Slot..." : `Confirm Booking for ${selectedDoctor.fees}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
