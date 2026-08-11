/**
 * Patient's appointments page — upcoming and past, with cancel action.
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

interface Appointment {
  id: number;
  doctor_name: string;
  doctor_id: number;
  specialty: string | null;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  status: 'booked' | 'cancelled' | 'completed';
  can_cancel: boolean;
  created_at: string;
}

function MyAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/scheduling/my-appointments/');
      setAppointments(res.data.results || res.data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    setCancellingId(appointmentId);
    setMessage(null);
    try {
      await api.post(`/scheduling/my-appointments/${appointmentId}/cancel/`);
      setMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
      fetchAppointments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to cancel appointment.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const now = new Date();
  const upcoming = appointments.filter((a) => {
    const slotDate = new Date(a.slot_date + 'T' + a.slot_start_time);
    return slotDate >= now && a.status === 'booked';
  });
  const past = appointments.filter((a) => {
    const slotDate = new Date(a.slot_date + 'T' + a.slot_start_time);
    return slotDate < now || a.status !== 'booked';
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      booked: 'bg-rose-50 text-rose-700',
      cancelled: 'bg-red-50 text-red-600',
      completed: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Appointments</h1>

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

      {appointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments yet"
          description="Search for doctors and book your first appointment"
          action={{ label: 'Find Doctors', href: '/search' }}
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all animate-fade-in"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Link href={`/doctors/${apt.doctor_id}`}>
                          <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold shadow cursor-pointer hover:scale-105 transition-transform">
                            {apt.doctor_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        </Link>
                        <div>
                          <h3 className="font-semibold text-gray-900">Dr. {apt.doctor_name}</h3>
                          {apt.specialty && (
                            <p className="text-sm text-rose-600">{apt.specialty}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(apt.slot_date)} · {apt.slot_start_time.slice(0, 5)} - {apt.slot_end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {statusBadge(apt.status)}
                        {apt.can_cancel ? (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={cancellingId === apt.id}
                            className="btn-danger"
                          >
                            {cancellingId === apt.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Cancel cutoff passed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Past & Cancelled</h2>
              <div className="space-y-3">
                {past.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 opacity-70"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold">
                          {apt.doctor_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">Dr. {apt.doctor_name}</h3>
                          {apt.specialty && (
                            <p className="text-sm text-gray-500">{apt.specialty}</p>
                          )}
                          <p className="text-sm text-gray-400 mt-1">
                            {formatDate(apt.slot_date)} · {apt.slot_start_time.slice(0, 5)} - {apt.slot_end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      {statusBadge(apt.status)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="patient">
      <MyAppointmentsContent />
    </ProtectedRoute>
  );
}
