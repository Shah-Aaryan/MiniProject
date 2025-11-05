import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const LaborMarket = () => {
  const [form, setForm] = useState({ role: '', region: 'US', experience_level: 'mid' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params = new URLSearchParams({
        role: form.role,
        region: form.region,
        experience_level: form.experience_level,
      });
      const res = await fetch(`${API_BASE}/labor-market/?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load market data (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Labor Market Intelligence</h1>
          <p className="text-gray-600">Salary bands, job trends, and skill gap insights</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="Target role (e.g., Backend Engineer)"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            placeholder="Region (e.g., US, EU, IN)"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={form.experience_level}
            onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchIntelligence}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Get Insights
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">{error}</div>
        )}

        {loading && <div className="text-center text-gray-600">Loading market data...</div>}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-5 border">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Salary Band</h3>
              {result.salary_band ? (
                <div className="text-gray-700">
                  <div><span className="font-medium">Region:</span> {form.region}</div>
                  <div><span className="font-medium">Level:</span> {form.experience_level}</div>
                  <div className="mt-2">
                    <span className="font-medium">Range:</span> {result.salary_band.min} - {result.salary_band.max} {result.salary_band.currency}
                  </div>
                  {result.salary_band.median && (
                    <div><span className="font-medium">Median:</span> {result.salary_band.median} {result.salary_band.currency}</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">No salary data available.</div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-5 border">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Job Trends</h3>
              {Array.isArray(result.job_trends) && result.job_trends.length ? (
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {result.job_trends.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-600">No trend data available.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborMarket;


