import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const Profile = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({ experience_level: 'student', skills: {}, preferences: {} });

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      const parsed = parseInt(id);
      setUserId(parsed);
      fetchProfile(parsed);
    }
  }, []);

  const fetchProfile = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/user-profile/?user_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } else if (res.status !== 404) {
        throw new Error(`Failed to load profile (${res.status})`);
      }
    } catch (e) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/user-profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          experience_level: profile.experience_level,
          skills: profile.skills || {},
          preferences: profile.preferences || {},
        })
      });
      if (!res.ok) throw new Error(`Failed to save profile (${res.status})`);
      setSuccess('Profile saved');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError(e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          <p className="text-gray-600">Manage your experience level, skills, and preferences</p>
        </div>

        {!userId && (
          <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg p-4 mb-6">
            Sign in to manage your profile.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4">{success}</div>
        )}

        <div className="bg-white rounded-xl shadow p-5 border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={profile.experience_level}
              onChange={(e) => setProfile((p) => ({ ...p, experience_level: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            >
              <option value="student">Student</option>
              <option value="junior">Junior (0-2 years)</option>
              <option value="mid">Mid-level (2-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (JSON)</label>
            <textarea
              rows={6}
              value={JSON.stringify(profile.skills || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value || '{}');
                  setProfile((p) => ({ ...p, skills: parsed }));
                } catch (_) {}
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferences (JSON)</label>
            <textarea
              rows={6}
              value={JSON.stringify(profile.preferences || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value || '{}');
                  setProfile((p) => ({ ...p, preferences: parsed }));
                } catch (_) {}
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full font-mono text-sm"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveProfile}
            disabled={!userId || saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </motion.button>
          {loading && <div className="text-gray-600">Loading profile...</div>}
        </div>
      </div>
    </div>
  );
};

export default Profile;


