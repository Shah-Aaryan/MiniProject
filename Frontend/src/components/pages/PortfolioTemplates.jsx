import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const PortfolioTemplates = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const userId = Number(localStorage.getItem('userId')) || null;

  const fetchTemplates = async (selectedRole) => {
    setLoading(true);
    setError('');
    try {
      const query = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : '';
      const res = await fetch(`${API_BASE}/project-templates/${query}`);
      if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
      const data = await res.json();
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (e) {
      setError(e.message || 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates('');
  }, []);

  const createProjectFromTemplate = async (templateId) => {
    if (!userId) {
      setError('Please sign in to create a project');
      return;
    }
    setLoading(true);
    setError('');
    setActionMsg('');
    try {
      const res = await fetch(`${API_BASE}/portfolio/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), template_id: Number(templateId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to create project (${res.status})`);
      setActionMsg('Project created successfully. Check your projects dashboard.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setError(e.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Portfolio & Project Templates</h1>
          <p className="text-gray-600">Role-specific templates with rubrics, README, and deployment hints</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-6 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Filter by role (e.g., Data Scientist)"
            className="w-full md:flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchTemplates(role)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Search
            </motion.button>
            <button
              onClick={() => { setRole(''); fetchTemplates(''); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((t) => (
              <div key={t.id} className="bg-white rounded-xl shadow p-5 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{t.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{t.role}</span>
                </div>
                <p className="text-gray-600 mb-3">{t.description}</p>
                <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Difficulty:</span> {t.difficulty_level ?? 'N/A'}</div>
                  <div><span className="font-medium">Hours:</span> {t.estimated_hours ?? 'N/A'}</div>
                  <div className="col-span-2"><span className="font-medium">Skills required:</span> {Array.isArray(t.skills_required) ? t.skills_required.join(', ') : (t.skills_required || '—')}</div>
                  <div className="col-span-2"><span className="font-medium">Skills taught:</span> {Array.isArray(t.skills_taught) ? t.skills_taught.join(', ') : (t.skills_taught || '—')}</div>
                </div>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => createProjectFromTemplate(t.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Create Project
                  </motion.button>
                </div>
              </div>
            ))}
            {!templates.length && (
              <div className="md:col-span-2 text-center text-gray-600">No templates found.</div>
            )}
          </div>
        )}
        {actionMsg && (
          <div className="mt-4 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3">{actionMsg}</div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTemplates;


