/**
 * Auth-aware navigation bar.
 * Shows different links for patients, doctors, and logged-out users.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isDoctor, isPatient, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase()
    : '';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
              MedBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/search" className="nav-link">
              Find Doctors
            </Link>

            {isPatient && (
              <Link href="/my-appointments" className="nav-link">
                My Appointments
              </Link>
            )}

            {isDoctor && (
              <>
                <Link href="/doctor/profile" className="nav-link">
                  My Profile
                </Link>
                <Link href="/doctor/availability" className="nav-link">
                  Availability
                </Link>
                <Link href="/doctor/appointments" className="nav-link">
                  Appointments
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow">
                  {initials}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-rose-700 hover:text-rose-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-2">
            <Link href="/search" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              Find Doctors
            </Link>

            {isPatient && (
              <Link href="/my-appointments" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                My Appointments
              </Link>
            )}

            {isDoctor && (
              <>
                <Link href="/doctor/profile" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  My Profile
                </Link>
                <Link href="/doctor/availability" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  Availability
                </Link>
                <Link href="/doctor/appointments" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  Appointments
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <button onClick={handleLogout} className="mobile-nav-link text-red-500 w-full text-left">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="mobile-nav-link text-rose-600 font-semibold" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
