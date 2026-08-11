/**
 * Doctor registration page.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ ...formData, role: 'doctor' });
      router.push('/doctor/profile');
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const data = error.response?.data;
      if (data) {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('. ');
        setError(messages);
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Registration</h1>
          <p className="text-gray-500 mt-2 text-sm">Create your professional account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" name="first_name" value={formData.first_name}
                       onChange={handleChange} className="input-field" placeholder="Jane" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name}
                       onChange={handleChange} className="input-field" placeholder="Smith" required />
              </div>
            </div>

            <div>
              <label className="label">Username</label>
              <input type="text" name="username" value={formData.username}
                     onChange={handleChange} className="input-field" placeholder="drjanesmith" required />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={formData.email}
                     onChange={handleChange} className="input-field" placeholder="doctor@clinic.com" required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={formData.password}
                     onChange={handleChange} className="input-field" placeholder="Min 8 characters" required />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="password_confirm" value={formData.password_confirm}
                     onChange={handleChange} className="input-field" placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : 'Register as Doctor'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already registered?{' '}
              <Link href="/doctor/login" className="text-rose-600 font-medium hover:text-rose-700">
                Doctor sign in
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Are you a patient?{' '}
              <Link href="/register" className="text-rose-600 font-medium hover:text-rose-700">
                Register as patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
