/**
 * Doctor profile edit page.
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Specialty {
  id: number;
  name: string;
  slug: string;
}

export default function DoctorProfilePage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorProfileContent />
    </ProtectedRoute>
  );
}

function DoctorProfileContent() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    specialty_id: '',
    bio: '',
    clinic_address: '',
    city: '',
    experience_years: 0,
    consultation_fee: '0',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, specRes] = await Promise.all([
          api.get('/doctors/me/'),
          api.get('/specialties/'),
        ]);
        setSpecialties(specRes.data);
        const p = profileRes.data;
        setFormData({
          specialty_id: p.specialty?.id?.toString() || '',
          bio: p.bio || '',
          clinic_address: p.clinic_address || '',
          city: p.city || '',
          experience_years: p.experience_years || 0,
          consultation_fee: p.consultation_fee || '0',
        });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        bio: formData.bio,
        clinic_address: formData.clinic_address,
        city: formData.city,
        experience_years: formData.experience_years,
        consultation_fee: formData.consultation_fee,
      };
      if (formData.specialty_id) {
        payload.specialty_id = parseInt(formData.specialty_id);
      }

      await api.patch('/doctors/me/', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Specialty</label>
            <select
              value={formData.specialty_id}
              onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
              className="select-field"
            >
              <option value="">Select Specialty</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="Tell patients about yourself, your approach, and experience..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                className="input-field"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="label">Clinic Address</label>
            <input
              type="text"
              value={formData.clinic_address}
              onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
              className="input-field"
              placeholder="123 Medical Center Drive"
            />
          </div>

          <div>
            <label className="label">Consultation Fee ($)</label>
            <input
              type="number"
              value={formData.consultation_fee}
              onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              className="input-field"
              min={0}
              step="0.01"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
