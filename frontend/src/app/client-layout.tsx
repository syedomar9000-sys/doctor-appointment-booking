/**
 * Client-side layout wrapper — provides AuthProvider and Navbar.
 * Separated from root layout because providers require 'use client'.
 */

'use client';

import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-rose-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-bold text-gray-800">MedBook</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} MedBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </AuthProvider>
  );
}
