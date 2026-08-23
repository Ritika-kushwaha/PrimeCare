'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth, Role } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Stethoscope, ShieldCheck, 
  ArrowRight, KeyRound, AlertCircle, CheckCircle2, UserPlus, LogIn, FileBadge
} from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [role, setRole] = useState<Role>('PATIENT');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

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
    setLoading(true);

    try {
      if (isForgotMode) {
        const cleanEmail = email.trim().toLowerCase();
        const newTempPassword = 'Password@123';
        localStorage.setItem(`pwd_${role}_${cleanEmail}`, newTempPassword);
        setSuccessMsg(`Password for ${cleanEmail} reset to: ${newTempPassword}. You can now sign in.`);
        setIsForgotMode(false);
        setPassword(newTempPassword);
        setLoading(false);
        return;
      }

      if (isRegisterMode) {
        await register({
          email,
          role,
          firstName,
          lastName,
          password,
          specialisation: role === 'DOCTOR' ? specialisation : undefined,
          regNumber: role === 'DOCTOR' ? regNumber : undefined,
        });
      } else {
        await login(email, role, password);
      }
    } catch (err: any) {
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
          
          {/* ROLE SELECTOR TABS */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setRole('PATIENT'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'PATIENT' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Patient
            </button>
            <button
              type="button"
              onClick={() => { setRole('DOCTOR'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'DOCTOR' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor
            </button>
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'ADMIN' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>

          {/* MAIN CARD */}
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
                    ? 'Enter your details & NMC/MCI registration ID for verification.'
                    : 'Fill out your details to start booking outpatient consultations.'
                  : 'Enter your email and password to access your dashboard.'}
              </p>
            </div>

            {/* ERROR BANNER */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Authentication Error</strong>
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}

            {/* SUCCESS BANNER */}
            {successMsg && (
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
                        placeholder="e.g. Ananya"
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
                        placeholder="e.g. Verma"
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
                          placeholder="e.g. MCI-2024-88910"
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
                    <button
                      type="button"
                      onClick={() => { setIsForgotMode(true); setErrorMsg(''); }}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Forgot Password?
                    </button>
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
                  <><UserPlus className="w-4 h-4" /> Register {role} Account</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In as {role} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80 text-xs">
              {isRegisterMode ? (
                <p className="text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(false); setIsForgotMode(false); setErrorMsg(''); }}
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
                    onClick={() => { setIsRegisterMode(true); setIsForgotMode(false); setErrorMsg(''); }}
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
