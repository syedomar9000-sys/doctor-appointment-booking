/**
 * Doctor search results page with filter sidebar and sort dropdown.
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import DoctorCard from '@/components/DoctorCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

interface Specialty {
  id: number;
  name: string;
  slug: string;
}

interface Doctor {
  id: number;
  full_name: string;
  specialty: { name: string; slug: string } | null;
  city: string;
  experience_years: number;
  consultation_fee: string;
  rating: string | null;
  next_available_slot: { date: string; start_time: string } | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [available, setAvailable] = useState(searchParams.get('available') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-rating');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load specialties
  useEffect(() => {
    api.get('/specialties/').then((res) => setSpecialties(res.data));
  }, []);

  // Load doctors based on filters
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { ordering };
      if (specialty) params.specialty = specialty;
      if (city) params.city = city;
      if (available) params.available = 'true';

      const res = await api.get('/doctors/', { params });
      setDoctors(res.data.results || res.data);
      setTotalCount(res.data.count || (res.data.results ? res.data.results.length : res.data.length));
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [specialty, city, available, ordering]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (specialty) params.set('specialty', specialty);
    if (city) params.set('city', city);
    if (available) params.set('available', 'true');
    if (ordering) params.set('ordering', ordering);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [specialty, city, available, ordering, router]);

  const clearFilters = () => {
    setSpecialty('');
    setCity('');
    setAvailable(false);
    setOrdering('-rating');
  };

  const hasActiveFilters = specialty || city || available;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Specialty</label>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="select-field"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          className="input-field"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="available-filter"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
        />
        <label htmlFor="available-filter" className="text-sm text-gray-700 font-medium cursor-pointer">
          Available slots only
        </label>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Searching...' : `${totalCount} doctor${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </button>

          {/* Sort dropdown */}
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="select-field w-auto"
          >
            <option value="-rating">Highest Rated</option>
            <option value="-experience_years">Most Experienced</option>
            <option value="consultation_fee">Lowest Fee</option>
            <option value="-consultation_fee">Highest Fee</option>
            <option value="city">City (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileFiltersOpen(false)}>
            <div
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : doctors.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No doctors found"
              description="Try adjusting your filters or search criteria"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchContent />
    </Suspense>
  );
}
