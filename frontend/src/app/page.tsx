/**
 * Homepage — specialty grid, hero section with search.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const SPECIALTY_ICONS: Record<string, string> = {
  'Cardiology': '❤️',
  'Dermatology': '🧴',
  'Pediatrics': '👶',
  'Orthopedics': '🦴',
  'General Physician': '🩺',
  'Gynecology': '🌸',
  'Dentistry': '🦷',
  'ENT': '👂',
};

interface Specialty {
  id: number;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [city, setCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.get('/specialties/').then((res) => setSpecialties(res.data));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);
    if (city) params.set('city', city);
    router.push(`/search?${params.toString()}`);
  };

  const handleSpecialtyClick = (slug: string) => {
    router.push(`/search?specialty=${slug}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-600 via-rose-700 to-pink-800 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-rose-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-rose-100 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              Trusted by thousands of patients
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find the Right Doctor,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-200">
                Book Instantly
              </span>
            </h1>

            <p className="text-lg text-rose-100 mb-10 max-w-xl mx-auto">
              Discover top-rated doctors across all specialties. View availability in real-time
              and book your appointment in seconds.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-3 rounded-2xl"
            >
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-gray-900 text-sm font-medium outline-none cursor-pointer"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="City (optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-gray-900 text-sm outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { value: '500+', label: 'Doctors' },
            { value: '50K+', label: 'Appointments' },
            { value: '8', label: 'Specialties' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-100"
            >
              <div className="text-xl font-bold text-rose-700">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse by Specialty</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Choose a specialty to find the best doctors in that field
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {specialties.map((specialty, index) => (
            <button
              key={specialty.id}
              onClick={() => handleSpecialtyClick(specialty.slug)}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all duration-300 group text-left animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-3xl mb-3">
                {SPECIALTY_ICONS[specialty.name] || '🏥'}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-rose-700 transition-colors text-sm">
                {specialty.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                View doctors
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Book your appointment in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Search',
                desc: 'Find doctors by specialty, city, or name. Filter and sort results.',
                icon: '🔍',
              },
              {
                step: '02',
                title: 'Choose a Slot',
                desc: 'View real-time availability and pick a convenient time slot.',
                icon: '📅',
              },
              {
                step: '03',
                title: 'Book Instantly',
                desc: 'Confirm your appointment with one click. It\'s that simple.',
                icon: '✅',
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:bg-rose-100 transition-colors group-hover:scale-110 transform duration-300">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-rose-500 mb-2">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
