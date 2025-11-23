import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getJobRoles, getSkillGapAnalysis } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import BarChart from '../../components/laborMarket/charts/BarChart';

const SkillGapAnalyzer = () => {
  const [targetRole, setTargetRole] = useState(null);
  const [targetRoleId, setTargetRoleId] = useState(null);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRoles, setJobRoles] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchJobRoles();
  }, []);

  const fetchJobRoles = async () => {
    try {
      const response = await getJobRoles();
      const data = Array.isArray(response.data) ? response.data : [];
      setJobRoles(data);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setCurrentSkills([...currentSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill));
  };

  const handleAnalyze = async () => {
    if (!targetRoleId || currentSkills.length === 0) {
      alert('Please select a target role and add your current skills');
      return;
    }

    try {
      setLoading(true);
      const response = await getSkillGapAnalysis({
        target_role_id: targetRoleId,
        current_skills: currentSkills,
      });
      setGapAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = gapAnalysis
    ? [
        {
          name: 'Matching',
          value: gapAnalysis.matching_skills?.length || 0,
        },
        {
          name: 'Missing',
          value: gapAnalysis.missing_skills?.length || 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skill Gap Analyzer</h1>
          <p className="text-gray-400">Compare your skills with target role requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Target Role</h2>
              <input
                type="text"
                placeholder="Search for target role..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  // Filter logic would go here
                }}
              />
              <div className="max-h-64 overflow-y-auto space-y-2">
                {Array.isArray(jobRoles) && jobRoles.slice(0, 10).map((role) => (
                  <div
                    key={role.id}
                    onClick={() => {
                      setTargetRole(role);
                      setTargetRoleId(role.id);
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      targetRoleId === role.id
                        ? 'border-blue-600 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <h3 className="font-semibold text-white">{role.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Current Skills</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <span className="text-white">{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !targetRoleId || currentSkills.length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
            </button>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {gapAnalysis ? (
              <>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Gap Analysis Results</h2>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {Math.round(gapAnalysis.gap_percentage || 0)}%
                    </div>
                    <div className="text-gray-400">Skill Gap</div>
                  </div>
                  <div className="mb-4">
                    <BarChart data={chartData} dataKey="value" color="#ef4444" height={200} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Matching Skills</div>
                      <div className="text-2xl font-bold text-green-400">
                        {gapAnalysis.matching_skills?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Missing Skills</div>
                      <div className="text-2xl font-bold text-red-400">
                        {gapAnalysis.missing_skills?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Estimated Time to Close Gap</div>
                    <div className="text-lg font-semibold text-blue-400">
                      {gapAnalysis.estimated_time || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Matching Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gapAnalysis.matching_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-900 text-green-400 text-sm rounded border border-green-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-red-400">
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gapAnalysis.missing_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-900 text-red-400 text-sm rounded border border-red-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {gapAnalysis.recommended_actions && gapAnalysis.recommended_actions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {gapAnalysis.recommended_actions.map((action, idx) => (
                          <li key={idx} className="text-sm text-gray-400">
                            • {action.action} - {action.priority} Priority
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
                Select a target role and add your skills to see the gap analysis
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;

