/**
 * Doctor availability management page.
 * Set weekly hours and slot duration.
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

interface Availability {
  id: number;
  day_of_week: number;
  day_of_week_display: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

export default function AvailabilityPage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <AvailabilityContent />
    </ProtectedRoute>
  );
}

function AvailabilityContent() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
  });

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const res = await api.get('/scheduling/availability/');
      setAvailabilities(res.data.results || res.data);
    } catch {
      setAvailabilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.post('/scheduling/availability/', formData);
      setMessage({ type: 'success', text: 'Availability added and time slots generated!' });
      setShowForm(false);
      fetchAvailabilities();
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const data = error.response?.data;
      if (data) {
        const msgs = Object.values(data).flat().join('. ');
        setMessage({ type: 'error', text: msgs });
      } else {
        setMessage({ type: 'error', text: 'Failed to create availability.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/scheduling/availability/${id}/`);
      setMessage({ type: 'success', text: 'Availability removed and slots updated.' });
      fetchAvailabilities();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete availability.' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set your weekly schedule. Time slots are generated automatically for the next 14 days.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === 'success'
              ? 'bg-pink-50 text-pink-700 border border-pink-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-800 mb-4">New Availability Block</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="select-field"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Slot Duration (min)</label>
                <select
                  value={formData.slot_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, slot_duration_minutes: parseInt(e.target.value) })}
                  className="select-field"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Availabilities */}
      {availabilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold text-gray-800 mb-2">No availability set</h3>
          <p className="text-sm text-gray-500">
            Add your weekly schedule to start receiving appointments
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {availabilities.map((avail) => (
            <div
              key={avail.id}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 font-bold text-sm">
                  {avail.day_of_week_display.slice(0, 3)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{avail.day_of_week_display}</h4>
                  <p className="text-sm text-gray-500">
                    {avail.start_time.slice(0, 5)} — {avail.end_time.slice(0, 5)} · {avail.slot_duration_minutes} min slots
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(avail.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
