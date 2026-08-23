'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { 
  Activity, Calendar, Stethoscope, ShieldCheck, 
  ArrowRight, Users, Sparkles, Clock, CheckCircle2, 
  Award, HeartPulse, Brain, Bone, Baby, Sun, 
  ChevronRight, CalendarCheck, ShieldAlert, Lock, Zap
} from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Cardiology', icon: HeartPulse, count: '14+ Specialists', desc: 'Preventive heart health, ECG, angiography, and lipid management.' },
  { name: 'Neurology', icon: Brain, count: '8+ Specialists', desc: 'Acute stroke care, migraine syndromes, neuropathies, and epilepsy.' },
  { name: 'Orthopedics', icon: Bone, count: '12+ Specialists', desc: 'Joint replacement, arthroscopic surgery, and sports injury recovery.' },
  { name: 'Pediatrics', icon: Baby, count: '10+ Specialists', desc: 'Child health, immunization schedules, and neonatal assessments.' },
  { name: 'Dermatology', icon: Sun, count: '6+ Specialists', desc: 'Clinical dermatology, laser therapies, and trichology treatments.' },
  { name: 'General Medicine', icon: Activity, count: '20+ Specialists', desc: 'Comprehensive outpatient evaluations and routine wellness triage.' },
];

const FEATURES = [
  {
    title: 'Conflict-Free Slot Allocation',
    desc: 'Strict single-patient capacity per slot with automated multi-family member booking protection.',
    icon: CalendarCheck,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'AI Pre-Visit Triage',
    desc: 'Symptom analysis and clinical urgency scoring formulate instant doctor inquiry suggestions.',
    icon: Sparkles,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    title: 'Automated Calendar & ICS Sync',
    desc: 'Instant Google Calendar synchronization with automated calendar cancellation notices during doctor leaves.',
    icon: Calendar,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    title: 'Longitudinal Family EHR',
    desc: 'Strict compound key deduplication maintains isolated medical histories for family members sharing an email.',
    icon: Users,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
  },
  {
    title: 'Emailed AI Patient Care Plans',
    desc: 'Formal ℞ prescriptions and plain-language recovery timelines are automatically dispatched to patients.',
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    title: 'Verified Governance & Leave Shield',
    desc: 'Clinic administrators verify MCI/NMC credentials, manage doctor rosters, and lock availability on leave days.',
    icon: ShieldCheck,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400"
            >
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Smart Outpatient Healthcare Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
            >
              Clinical Precision & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Instant Appointment Care
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Schedule guaranteed consultation slots with specialist physicians, experience AI-driven pre-visit triage, automated Google Calendar synchronization, and longitudinal family health records.
            </motion.p>

            {/* SINGLE CALL TO ACTION ROUTING DIRECTLY TO LOGIN */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center pt-2"
            >
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2.5 transform hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5" /> Book Consultation <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* QUICK STATS BADGES */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80 max-w-4xl mx-auto">
              <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <span className="text-xl font-extrabold text-white block">100%</span>
                <span className="text-[11px] text-slate-400">Verified Physicians</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <span className="text-xl font-extrabold text-emerald-400 block">Single Slot</span>
                <span className="text-[11px] text-slate-400">Zero Overbooking</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <span className="text-xl font-extrabold text-white block">Instant</span>
                <span className="text-[11px] text-slate-400">Google Calendar Sync</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <span className="text-xl font-extrabold text-blue-400 block">AI-Powered</span>
                <span className="text-[11px] text-slate-400">Triage & Care Plans</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PORTAL ACCESS SECTION */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Role-Based Clinical Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated spaces designed for patients, clinical practitioners, and hospital administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Portal Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-500/50 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Patient Outpatient Desk</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discover specialists, review clinical qualifications and consultation fees, reserve dedicated consultation slots, and add appointments to Google Calendar.
              </p>
            </div>
            <Link
              href="/login"
              className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-between"
            >
              <span>Sign In to Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Doctor Workspace Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-blue-500/50 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Doctor Clinical Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage active patient queues, view AI pre-visit urgency assessments, generate ℞ prescriptions, and email plain-language care plans.
              </p>
            </div>
            <Link
              href="/login"
              className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-between shadow-lg shadow-blue-500/20"
            >
              <span>Doctor Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-red-500/50 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Administrative Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify medical registration IDs, manage practitioner rosters, edit fees and bios, schedule doctor duty leaves, and oversee finalized consultations.
              </p>
            </div>
            <Link
              href="/login"
              className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-between shadow-lg shadow-red-600/20"
            >
              <span>Admin Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CLINICAL SPECIALTIES SECTION */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Multispecialty Clinical Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Leading medical departments staffed by certified senior consultants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPARTMENTS.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {dept.count}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{dept.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE PLATFORM FEATURES */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built for Modern Healthcare Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Intelligent medical automation designed to eliminate scheduling friction and protect medical history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-extrabold">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Prime<span className="text-emerald-400">Care</span> Multispecialty Hospital</span>
          </div>
          <p>© 2026 PrimeCare Clinical Systems. All patient records and doctor credentials strictly verified.</p>
        </div>
      </footer>

    </div>
  );
}
