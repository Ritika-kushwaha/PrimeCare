'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Mail, Lock, User, 
  Stethoscope, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Award 
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor Specific Fields (Collision prevention)
  const [regNumber, setRegNumber] = useState('');
  const [specialisation, setSpecialisation] = useState('Cardiology');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experience, setExperience] = useState('5 Years Practice');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = `Dr. ${firstName.trim()} ${lastName.trim()}`;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // 1. Check for Duplicate Email or Duplicate Medical Reg Number
    try {
      const storedUsers = JSON.parse(localStorage.getItem('primecare_registered_users') || '[]');
      const storedApps = JSON.parse(localStorage.getItem('primecare_doctor_applications') || '[]');
      const storedRoster = JSON.parse(localStorage.getItem('primecare_doctor_profiles') || '[]');

      if (role === 'DOCTOR') {
        const regClean = (regNumber || '').trim().toUpperCase();
        if (!regClean) {
          setError('Medical Registration Number (NMC/MCI ID) is required for doctor verification.');
          setLoading(false);
          return;
        }

        // Duplicate check on Medical Reg Number
        const regConflict = [...storedApps, ...storedRoster].some(
          (d: any) => (d.regNumber || '').toUpperCase() === regClean
        );
        if (regConflict) {
          setError(`A physician with Medical Registration ID "${regClean}" is already registered. Please check your credentials.`);
          setLoading(false);
          return;
        }
      }

      // Check email collision across same role
      const emailConflict = role === 'DOCTOR' 
        ? storedApps.some((a: any) => a.email.toLowerCase() === cleanEmail)
        : storedUsers.some((u: any) => u.email.toLowerCase() === cleanEmail && u.role === 'PATIENT');

      if (emailConflict) {
        setError(`An account with email "${cleanEmail}" already exists for this profile role.`);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Save Registration
    if (role === 'DOCTOR') {
      const newDocApp = {
        id: `doc-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        regNumber: regNumber.trim().toUpperCase(),
        specialisation,
        qualification,
        experience,
        status: 'PENDING',
      };

      try {
        const storedApps = JSON.parse(localStorage.getItem('primecare_doctor_applications') || '[]');
        localStorage.setItem('primecare_doctor_applications', JSON.stringify([newDocApp, ...storedApps]));

        // Set role-scoped password
        localStorage.setItem(`role_pwd_doctor_${cleanEmail}`, cleanPassword);
      } catch {}

      setSuccess('Doctor onboarding registered successfully! Your account is submitted for Admin approval.');
      setTimeout(() => router.push('/login'), 2500);
    } else {
      const newPatient = {
        id: `pat-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: cleanPassword,
        role: 'PATIENT',
      };

      try {
        const storedUsers = JSON.parse(localStorage.getItem('primecare_registered_users') || '[]');
        localStorage.setItem('primecare_registered_users', JSON.stringify([newPatient, ...storedUsers]));

        // Set role-scoped password
        localStorage.setItem(`role_pwd_patient_${cleanEmail}`, cleanPassword);
      } catch {}

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Create PrimeCare Account
          </h1>
          <p className="text-xs text-slate-400">
            Join as a Patient or register your Clinical Specialist profile.
          </p>
        </div>

        {/* ROLE PICKER */}
        <div className="grid grid-cols-2 gap-2 w-full p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'PATIENT' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Patient Account
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'DOCTOR' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Signup
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-3.5 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSignup} className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* DOCTOR SPECIFIC FIELDS */}
          {role === 'DOCTOR' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Medical Registration ID (NMC/MCI)
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. NMC-849201"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 uppercase outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Specialisation</label>
                  <select
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
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
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MD, DM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-bold rounded-xl text-xs transition shadow-lg mt-2 flex items-center justify-center gap-2 ${
              role === 'DOCTOR'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {loading ? 'Creating Account...' : (<>Register {role === 'DOCTOR' ? 'Doctor Profile' : 'Patient'} <ArrowRight className="w-4 h-4" /></>)}
          </button>

          <div className="text-center pt-2 text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
