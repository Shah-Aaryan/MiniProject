import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const Assessments = () => {
  const [filters, setFilters] = useState({ skill: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(null); // {user_assessment_id, questions, duration_minutes}
  const [answers, setAnswers] = useState({});
  const userId = Number(localStorage.getItem('userId')) || null;

  const fetchAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.type) params.append('type', filters.type);
      const res = await fetch(`${API_BASE}/assessments/${params.toString() ? `?${params.toString()}` : ''}`);
      if (!res.ok) throw new Error(`Failed to load assessments (${res.status})`);
      const data = await res.json();
      setAssessments(Array.isArray(data.assessments) ? data.assessments : []);
    } catch (e) {
      setError(e.message || 'Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const startAssessment = async (assessmentId) => {
    if (!userId) {
      setError('Please sign in to start an assessment');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/user-assessments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), assessment_id: Number(assessmentId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to start assessment (${res.status})`);
      setActive({ user_assessment_id: data.user_assessment_id, questions: data.questions, duration_minutes: data.duration_minutes });
      setAnswers({});
    } catch (e) {
      setError(e.message || 'Failed to start assessment');
    } finally {
      setStarting(false);
    }
  };

  const submitAssessment = async () => {
    if (!active?.user_assessment_id) return;
    try {
      const res = await fetch(`${API_BASE}/user-assessments/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_assessment_id: active.user_assessment_id, answers, time_spent_minutes: 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Submit failed (${res.status})`);
      alert(`Score: ${Math.round(data.user_assessment.percentage)}%, Passed: ${data.user_assessment.passed ? 'Yes' : 'No'}`);
      setActive(null);
    } catch (e) {
      setError(e.message || 'Failed to submit assessment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Skill Assessments</h1>
          <p className="text-gray-600">Timed challenges with plagiarism/LLM detection, badges, and certificates</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={filters.skill}
            onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
            placeholder="Filter by skill (e.g., Python)"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            placeholder="Assessment type (mcq, coding, project)"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchAssessments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Apply Filters
          </motion.button>
          <button
            onClick={() => { setFilters({ skill: '', type: '' }); fetchAssessments(); }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading assessments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow p-5 border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{a.title}</h3>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">{a.assessment_type}</span>
                </div>
                <p className="text-gray-600 mb-3">{a.description}</p>
                <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Skill:</span> {a.skill_tested || '—'}</div>
                  <div><span className="font-medium">Duration:</span> {a.duration_minutes ?? '—'} mins</div>
                  <div><span className="font-medium">Passing:</span> {a.passing_score ?? '—'}</div>
                  <div><span className="font-medium">Badge:</span> {a.badge_name || '—'}</div>
                </div>
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={starting}
                    onClick={() => startAssessment(a.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {starting ? 'Starting...' : 'Start Assessment'}
                  </motion.button>
                </div>
              </div>
            ))}
            {!assessments.length && (
              <div className="md:col-span-2 text-center text-gray-600">No assessments available.</div>
            )}
          </div>
        )}
        {active && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Assessment</h3>
                <button onClick={() => setActive(null)} className="text-gray-500">✕</button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {(active.questions || []).map((q) => (
                  <div key={q.id} className="border rounded p-3">
                    <div className="font-medium mb-2">{q.question || q.text || 'Question'}</div>
                    {Array.isArray(q.options) ? (
                      <div className="space-y-1">
                        {q.options.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Your answer"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setActive(null)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitAssessment}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Submit
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;


