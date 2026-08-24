'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Plus, Trash2, Edit3, Save, CheckCircle2,
  AlertCircle, Users, Calendar, Clock, ShieldCheck,
  X, Search, Building2, Award, RefreshCw, CalendarX2,
  ChevronRight, UserCheck
} from 'lucide-react';
import Link from 'next/link';

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
  workingHoursStart?: string;
  workingHoursEnd?: string;
  slotDurationMin?: number;
}

const SPECIALISATIONS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
  'General Medicine', 'Gynecology', 'ENT', 'Oncology', 'Psychiatry', 'Ophthalmology',
];

const DEFAULT_FORM: Omit<DoctorProfile, 'id'> = {
  email: '',
  name: '',
  specialisation: 'Cardiology',
  qualification: 'MBBS, MD',
  experience: '5 Years Practice',
  hospital: 'PrimeCare Multispecialty Hospital',
  fee: '₹1,000',
  rating: '5.0 ★',
  bio: '',
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  slotDurationMin: 30,
};

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'DOCTORS' | 'ADD'>('DOCTORS');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<DoctorProfile, 'id'>>(DEFAULT_FORM);

  // New doctor form state
  const [newForm, setNewForm] = useState<Omit<DoctorProfile, 'id'>>(DEFAULT_FORM);

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 5000); }
  };

  const loadDoctors = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/sync/doctors', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return doctors;
    return doctors.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.specialisation || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  // ── Save / upsert doctor profile ──────────────────────────────────────
  const saveDoctor = async (profile: DoctorProfile) => {
    setSaving(true);
    try {
      const res = await fetch('/api/sync/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor: profile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save doctor profile');
      return true;
    } catch (err: any) {
      showMsg(err.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Add new doctor ─────────────────────────────────────────────────────
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (newForm.email || '').trim().toLowerCase();
    const cleanName = newForm.name.startsWith('Dr.') ? newForm.name : `Dr. ${newForm.name}`;

    if (!cleanEmail || !cleanName || !newForm.specialisation) {
      showMsg('Name, email, and specialisation are required.', true);
      return;
    }

    if (doctors.some(d => d.email.toLowerCase() === cleanEmail)) {
      showMsg(`A doctor with email "${cleanEmail}" already exists in roster.`, true);
      return;
    }

    const newId = `doc-${newForm.specialisation.toLowerCase().replace(/\s+/g, '-').slice(0, 6)}-${Date.now()}`;
    const newProfile: DoctorProfile = {
      ...newForm,
      id: newId,
      name: cleanName,
      email: cleanEmail,
    };

    const ok = await saveDoctor(newProfile);
    if (ok) {
      setDoctors(prev => [newProfile, ...prev]);
      setNewForm(DEFAULT_FORM);
      setActiveTab('DOCTORS');
      showMsg(`Dr. ${cleanName} added & saved to database successfully.`);
      await loadDoctors();
    }
  };

  // ── Start editing ──────────────────────────────────────────────────────
  const startEdit = (doc: DoctorProfile) => {
    setEditingId(doc.id);
    setEditForm({
      email: doc.email,
      name: doc.name,
      specialisation: doc.specialisation,
      qualification: doc.qualification,
      experience: doc.experience,
      hospital: doc.hospital,
      fee: doc.fee,
      rating: doc.rating || '5.0 ★',
      bio: doc.bio,
      workingHoursStart: doc.workingHoursStart || '09:00',
      workingHoursEnd: doc.workingHoursEnd || '17:00',
      slotDurationMin: doc.slotDurationMin || 30,
    });
  };

  // ── Save edit ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (docId: string) => {
    const cleanName = editForm.name.startsWith('Dr.') ? editForm.name : `Dr. ${editForm.name}`;
    const updated: DoctorProfile = { ...editForm, id: docId, name: cleanName };
    const ok = await saveDoctor(updated);
    if (ok) {
      setDoctors(prev => prev.map(d => d.id === docId ? updated : d));
      setEditingId(null);
      showMsg('Doctor profile updated successfully.');
    }
  };

  // ── Delete doctor ──────────────────────────────────────────────────────
  const handleDelete = async (doc: DoctorProfile) => {
    if (!confirm(`Remove Dr. ${doc.name} from the roster? This will permanently delete the doctor from the database.`)) return;
    try {
      const res = await fetch('/api/sync/delete-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, email: doc.email, name: doc.name }),
      });
      if (!res.ok) throw new Error('Failed to delete doctor from database');
      
      // Also dispatch deletion to sync route
      try {
        await fetch('/api/sync/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE', id: doc.id, email: doc.email, name: doc.name })
        });
      } catch {}

      setDoctors(prev => prev.filter(d => d.id !== doc.id));
      showMsg(`Dr. ${doc.name} permanently deleted from database.`);
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  // ── Shared form fields component ───────────────────────────────────────
  const DoctorFormFields = ({
    form,
    setForm,
  }: {
    form: Omit<DoctorProfile, 'id'>;
    setForm: (f: Omit<DoctorProfile, 'id'>) => void;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
        <input
          required
          type="text"
          placeholder="e.g. Aarav Sharma (Dr. auto-prefixed)"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
        <input
          required
          type="email"
          placeholder="doctor@primecare.in"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Specialisation</label>
        <select
          value={form.specialisation}
          onChange={e => setForm({ ...form, specialisation: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Qualification</label>
        <input
          type="text"
          placeholder="e.g. MD, DM (Cardiology)"
          value={form.qualification}
          onChange={e => setForm({ ...form, qualification: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Experience</label>
        <input
          type="text"
          placeholder="e.g. 12 Years Practice"
          value={form.experience}
          onChange={e => setForm({ ...form, experience: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Hospital / Facility</label>
        <input
          type="text"
          placeholder="PrimeCare Multispecialty Hospital"
          value={form.hospital}
          onChange={e => setForm({ ...form, hospital: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Consultation Fee</label>
        <input
          type="text"
          placeholder="₹1,200"
          value={form.fee}
          onChange={e => setForm({ ...form, fee: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Slot Duration (minutes)</label>
        <select
          value={form.slotDurationMin || 30}
          onChange={e => setForm({ ...form, slotDurationMin: Number(e.target.value) })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value={15}>15 minutes</option>
          <option value={20}>20 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Working Hours Start</label>
        <input
          type="time"
          value={form.workingHoursStart || '09:00'}
          onChange={e => setForm({ ...form, workingHoursStart: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="block text-slate-400 font-semibold mb-1">Working Hours End</label>
        <input
          type="time"
          value={form.workingHoursEnd || '17:00'}
          onChange={e => setForm({ ...form, workingHoursEnd: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-slate-400 font-semibold mb-1">Doctor Bio / Specialisation Summary</label>
        <textarea
          rows={2}
          placeholder="Brief clinical specialisation summary..."
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrator Dashboard
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Doctor Roster Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Create, edit, and manage physician profiles, working hours, and slot durations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/leaves"
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 transition"
              >
                <CalendarX2 className="w-4 h-4" /> Manage Leaves
              </Link>
              <button
                type="button"
                onClick={loadDoctors}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1.5 hover:text-white transition"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {successMsg}
              </motion.div>
            )}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Nav */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('DOCTORS')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DOCTORS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> All Doctors ({doctors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADD')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ADD' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Add New Doctor
            </button>
          </div>

          {/* ── TAB: ALL DOCTORS ─────────────────────────────────────── */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, specialisation, or email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto text-slate-600 mb-3" />
                  <p className="font-semibold text-slate-400">No doctors found.</p>
                  <p className="mt-1">Add doctors using the &quot;Add New Doctor&quot; tab.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDoctors.map(doc => {
                    const isEditing = editingId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 transition ${
                          isEditing
                            ? 'bg-emerald-950/20 border-emerald-500/50'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        {!isEditing ? (
                          /* ── READ MODE ── */
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-white">{doc.name}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  {doc.specialisation}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{doc.email}</p>
                              <p className="text-xs text-slate-500">{doc.qualification} • {doc.experience} • {doc.hospital}</p>
                              <p className="text-xs text-slate-500">
                                🕐 {doc.workingHoursStart || '09:00'} – {doc.workingHoursEnd || '17:00'} &bull;
                                Slot: {doc.slotDurationMin || 30} min &bull; Fee: {doc.fee}
                              </p>
                              {doc.bio && (
                                <p className="text-xs text-slate-400 italic line-clamp-2">&quot;{doc.bio}&quot;</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(doc)}
                                className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc)}
                                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── EDIT MODE ── */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5" /> Editing: {doc.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <DoctorFormFields form={editForm} setForm={setEditForm} />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(doc.id)}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ADD NEW DOCTOR ──────────────────────────────────── */}
          {activeTab === 'ADD' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">New Physician Profile</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">Add Doctor to Roster</h2>
                <p className="text-xs text-slate-400 mt-1">Fill in doctor details, working hours, and slot duration. Profile will be available for patient booking immediately.</p>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-6">
                <DoctorFormFields form={newForm} setForm={setNewForm} />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {saving ? 'Adding Doctor...' : 'Add Doctor to PrimeCare Roster'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
