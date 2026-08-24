'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CalendarX2, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface Doctor {
  id: string;
  specialisation: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminLeavesPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [leaveDate, setLeaveDate] = useState('2026-08-25');
  const [reason, setReason] = useState('Attending Medical Conference');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctors').then((res) => {
      setDoctors(res.data.doctors || []);
      if (res.data.doctors?.length > 0) setSelectedDoc(res.data.doctors[0].id);
    });
  }, []);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/admin/leaves', {
        doctorId: selectedDoc,
        leaveDate,
        reason,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit leave.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarX2 className="w-6 h-6 text-red-600" /> Admin Leave & Schedule Override
        </h1>
        <p className="text-sm text-slate-500">Log physician absence and automatically handle booking conflicts.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5" /> Leave Logged Successfully
          </div>
          <p className="text-sm">
            Doctor marked on leave for <strong>{leaveDate}</strong>. All remaining free slots on this date are now blocked.
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Physician</label>
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user.firstName} {d.user.lastName} ({d.specialisation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Leave Date</label>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Reason for Leave</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800 font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            Applying leave will immediately revoke slot availability for this physician on the selected date.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? 'Submitting Leave...' : 'Authorize Doctor Leave'}
          </button>
        </form>
      </div>
    </div>
  );
}

