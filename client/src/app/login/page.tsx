'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth, Role } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Lock, Mail, User, Stethoscope, ShieldCheck, 
  ArrowRight, KeyRound, AlertCircle, CheckCircle2, UserPlus, LogIn, FileBadge, Clock
} from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [role, setRole] = useState<Role>('PATIENT');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isPendingReview, setIsPendingReview] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialisation, setSpecialisation] = useState('Cardiology');
  const [regNumber, setRegNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsPendingReview(false);
    setLoading(true);

    try {
      if (isForgotMode) {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
          setErrorMsg('Email address is required to receive OTP.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to dispatch OTP to email.');
        }

        setSuccessMsg(data.message || `A 6-digit verification OTP has been sent to ${cleanEmail}. Check your inbox!`);
        setTimeout(() => {
          window.location.href = `/forgot-password?role=${role}&email=${encodeURIComponent(cleanEmail)}`;
        }, 1500);
        setLoading(false);
        return;
      }

      if (isRegisterMode) {
        const autoLoggedIn = await register({
          email,
          role,
          firstName,
          lastName,
          password,
          specialisation: role === 'DOCTOR' ? specialisation : undefined,
          regNumber: role === 'DOCTOR' ? regNumber : undefined,
        });

        if (role === 'DOCTOR' && !autoLoggedIn) {
          // DISPATCH EMAIL ALERT TO ADMIN
          try {
            await fetch('/api/notifications/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'NEW_DOCTOR_APPLICATION_ADMIN_ALERT',
                recipientEmail: email,
                doctorName: `Dr. ${firstName.trim()} ${lastName.trim()}`.trim(),
                specialisation,
                regNumber
              })
            });
          } catch (mailErr) {
            console.warn("Admin mail trigger error:", mailErr);
          }

          setIsPendingReview(true);
          setSuccessMsg('Your application & NMC registration number have been sent to the Hospital Administrator. An approval email will be sent to you once verified.');
          setIsRegisterMode(false);
        }
      } else {
        await login(email, role, password);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('pending') || err.message.includes('approved yet'))) {
        setIsPendingReview(true);
      }
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setRole('PATIENT'); setErrorMsg(''); setIsPendingReview(false); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'PATIENT' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Patient
            </button>
            <button
              type="button"
              onClick={() => { setRole('DOCTOR'); setErrorMsg(''); setIsPendingReview(false); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'DOCTOR' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor
            </button>
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setErrorMsg(''); setIsPendingReview(false); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'ADMIN' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
            
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-extrabold text-white">
                {isForgotMode
                  ? `Reset ${role} Password`
                  : isRegisterMode
                  ? `Register as ${role}`
                  : `Sign In as ${role}`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isForgotMode
                  ? 'Enter your email to receive a temporary reset password.'
                  : isRegisterMode
                  ? role === 'DOCTOR'
                    ? 'Enter your name, department, & NMC registration ID for administrator verification.'
                    : 'Fill out your details to start booking outpatient consultations.'
                  : role === 'DOCTOR'
                  ? 'Enter your approved doctor credentials to open clinical workspace.'
                  : 'Enter your email and password to access your dashboard.'}
              </p>
            </div>

            {isPendingReview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs rounded-2xl space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Application Under Administrative Verification</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-200/90">
                  Your medical registration credentials have been sent to the Hospital Administrator for approval. An approval email will be dispatched to your email once unlocked.
                </p>
              </motion.div>
            )}

            {errorMsg && !isPendingReview && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Authentication Notice</strong>
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}

            {successMsg && !isPendingReview && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {isRegisterMode && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Ramesh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Gupta"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {role === 'DOCTOR' && (
                    <>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Specialisation Department</label>
                        <select
                          value={specialisation}
                          onChange={(e) => setSpecialisation(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
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
                        <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                          <FileBadge className="w-3.5 h-3.5 text-blue-400" /> NMC / MCI Medical Registration ID
                        </label>
                        <input
                          type="text"
                          required
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          placeholder="e.g. NMC-2026-88120"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {!isForgotMode && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" /> {role} Password
                    </label>
                    <a
                      href={`/forgot-password?role=${role}&email=${encodeURIComponent(email)}`}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <KeyRound className="w-3 h-3" /> Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm ${
                  role === 'ADMIN'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                    : role === 'DOCTOR'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {loading ? (
                  'Processing...'
                ) : isForgotMode ? (
                  'Reset Password & Sign In'
                ) : isRegisterMode ? (
                  <><UserPlus className="w-4 h-4" /> Submit {role} Registration</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In as {role} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80 text-xs">
              {isRegisterMode ? (
                <p className="text-slate-400">
                  Already verified?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(false); setIsForgotMode(false); setErrorMsg(''); setIsPendingReview(false); }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p className="text-slate-400">
                  Need a new account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(true); setIsForgotMode(false); setErrorMsg(''); setIsPendingReview(false); }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Create {role} Account
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
