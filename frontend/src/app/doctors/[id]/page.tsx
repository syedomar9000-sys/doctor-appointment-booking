/**
 * Public doctor profile page with available slots and booking.
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Doctor {
  id: number;
  full_name: string;
  specialty: { name: string; slug: string } | null;
  bio: string;
  clinic_address: string;
  city: string;
  experience_years: number;
  consultation_fee: string;
  rating: string | null;
}

interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isPatient } = useAuth();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, slotsRes] = await Promise.all([
          api.get(`/doctors/${id}/`),
          api.get(`/scheduling/doctors/${id}/slots/`),
        ]);
        setDoctor(doctorRes.data);
        setSlots(slotsRes.data);
      } catch {
        setMessage({ type: 'error', text: 'Doctor not found.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async (slotId: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isPatient) {
      setMessage({ type: 'error', text: 'Only patients can book appointments.' });
      return;
    }

    setBookingLoading(true);
    setBookingSlot(slotId);
    setMessage(null);

    try {
      await api.post('/scheduling/book/', { time_slot_id: slotId });
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      // Remove booked slot from list
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to book appointment.',
      });
    } finally {
      setBookingLoading(false);
      setBookingSlot(null);
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Doctor not found</h2>
      </div>
    );
  }

  const initials = doctor.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Doctor Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Dr. {doctor.full_name}</h1>
            {doctor.specialty && (
              <p className="text-rose-600 font-medium mt-1">{doctor.specialty.name}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              {doctor.city && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {doctor.city}
                  {doctor.clinic_address && ` — ${doctor.clinic_address}`}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {doctor.experience_years} years experience
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Rating</div>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  {doctor.rating ? (
                    <>
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {parseFloat(doctor.rating).toFixed(1)}
                    </>
                  ) : (
                    <span className="text-sm italic text-gray-400">Not yet rated</span>
                  )}
                </div>
              </div>

              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Consultation Fee</div>
                <div className="font-semibold text-gray-800">
                  ${parseFloat(doctor.consultation_fee).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
          </div>
        )}
      </div>

      {/* Message */}
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

      {/* Available Slots */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Time Slots</h2>

        {Object.keys(slotsByDate).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500">No available slots at the moment</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new openings</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDate).map(([date, dateSlots]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(date)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleBook(slot.id)}
                      disabled={bookingLoading && bookingSlot === slot.id}
                      className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium
                                 hover:bg-rose-100 hover:shadow-sm transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 border border-rose-100 hover:border-rose-200"
                    >
                      {bookingLoading && bookingSlot === slot.id ? (
                        <span className="flex items-center gap-1.5">
                          <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                          Booking...
                        </span>
                      ) : (
                        `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
