/**
 * Doctor card component used in search results.
 * Shows doctor info, specialty, rating, fee, and next available slot.
 */

import Link from 'next/link';

interface DoctorCardProps {
  doctor: {
    id: number;
    full_name: string;
    specialty: { name: string; slug: string } | null;
    city: string;
    experience_years: number;
    consultation_fee: string;
    rating: string | null;
    next_available_slot: { date: string; start_time: string } | null;
  };
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const initials = doctor.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/doctors/${doctor.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-rose-100 transition-all duration-300 cursor-pointer group">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-rose-700 transition-colors truncate">
              Dr. {doctor.full_name}
            </h3>
            {doctor.specialty && (
              <p className="text-sm text-rose-600 font-medium">{doctor.specialty.name}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
              {doctor.city && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {doctor.city}
                </span>
              )}
              <span>{doctor.experience_years} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {doctor.rating ? (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{parseFloat(doctor.rating).toFixed(1)}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Not yet rated</span>
              )}
            </div>

            {/* Fee */}
            <span className="text-sm font-semibold text-gray-800">
              ${parseFloat(doctor.consultation_fee).toFixed(0)}
            </span>
          </div>

          {/* Next Available */}
          {doctor.next_available_slot ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
              {formatDate(doctor.next_available_slot.date)}, {doctor.next_available_slot.start_time}
            </div>
          ) : (
            <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-50 rounded-lg">No slots available</span>
          )}
        </div>
      </div>
    </Link>
  );
}
