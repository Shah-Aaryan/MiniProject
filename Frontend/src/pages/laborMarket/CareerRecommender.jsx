import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { getJobRoles, generateRecommendations } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import BarChart from '../../components/laborMarket/charts/BarChart';

const CareerRecommender = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentRole: null,
    currentRoleId: null,
    isEntryLevel: false,
    isCareerSwitcher: false,
    skills: [],
    skillLevels: {},
    targetSalary: '',
    preferredLocation: '',
    willingToRelocate: false,
    remotePreference: 'any', // any, remote, hybrid, on-site
  });
  const [jobRoles, setJobRoles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (step === 1) {
      fetchJobRoles();
    }
  }, [step]);

  const fetchJobRoles = async () => {
    try {
      const response = await getJobRoles();
      setJobRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching job roles:', error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
        skillLevels: { ...formData.skillLevels, [newSkill.trim()]: 5 },
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
      skillLevels: Object.fromEntries(
        Object.entries(formData.skillLevels).filter(([key]) => key !== skill)
      ),
    });
  };

  const handleGenerateRecommendations = async () => {
    try {
      setLoading(true);
      const response = await generateRecommendations({
        current_role_id: formData.currentRoleId,
        skills: formData.skills,
        target_salary: formData.targetSalary,
        preferred_location: formData.preferredLocation,
      });
      setRecommendations(response.data || []);
      setStep(5);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const Step1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 1: Current Role Selection</h2>
      <div className="space-y-4 mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEntryLevel}
            onChange={(e) =>
              setFormData({
                ...formData,
                isEntryLevel: e.target.checked,
                isCareerSwitcher: false,
                currentRole: null,
                currentRoleId: null,
              })
            }
            className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded"
          />
          <span className="text-lg">I'm Entry Level / New to the Field</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isCareerSwitcher}
            onChange={(e) =>
              setFormData({
                ...formData,
                isCareerSwitcher: e.target.checked,
                isEntryLevel: false,
                currentRole: null,
                currentRoleId: null,
              })
            }
            className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded"
          />
          <span className="text-lg">I'm a Career Switcher</span>
        </label>
      </div>

      {!formData.isEntryLevel && !formData.isCareerSwitcher && (
        <div>
          <input
            type="text"
            placeholder="Search for your current role..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              // Filter job roles based on search
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {jobRoles.slice(0, 20).map((role) => (
              <div
                key={role.id}
                onClick={() =>
                  setFormData({
                    ...formData,
                    currentRole: role,
                    currentRoleId: role.id,
                  })
                }
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.currentRoleId === role.id
                    ? 'border-blue-600 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <h3 className="font-semibold text-white">{role.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 2: Skills Assessment</h2>
      <div className="mb-6">
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <div
              key={skill}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <span className="text-white">{skill}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.skillLevels[skill] || 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillLevels: { ...formData.skillLevels, [skill]: parseInt(e.target.value) },
                  })
                }
                className="w-20"
              />
              <span className="text-xs text-gray-400 w-8">{formData.skillLevels[skill] || 5}/10</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 3: Career Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Target Salary Range</label>
          <input
            type="number"
            value={formData.targetSalary}
            onChange={(e) => setFormData({ ...formData, targetSalary: e.target.value })}
            placeholder="e.g., 80000"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Preferred Location</label>
          <input
            type="text"
            value={formData.preferredLocation}
            onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
            placeholder="City, State"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.willingToRelocate}
            onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded"
          />
          <span>Willing to Relocate</span>
        </label>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Remote Preference</label>
          <select
            value={formData.remotePreference}
            onChange={(e) => setFormData({ ...formData, remotePreference: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-Site Only</option>
          </select>
        </div>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 4: Review & Generate</h2>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <span className="text-gray-400">Current Role:</span>
          <span className="ml-2 text-white">
            {formData.currentRole?.title || formData.isEntryLevel
              ? 'Entry Level'
              : formData.isCareerSwitcher
              ? 'Career Switcher'
              : 'Not Selected'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Skills:</span>
          <span className="ml-2 text-white">{formData.skills.length} skills added</span>
        </div>
        <div>
          <span className="text-gray-400">Target Salary:</span>
          <span className="ml-2 text-white">
            {formData.targetSalary ? `$${parseInt(formData.targetSalary).toLocaleString()}` : 'Not specified'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Location:</span>
          <span className="ml-2 text-white">
            {formData.preferredLocation || 'Not specified'}
          </span>
        </div>
      </div>
      <button
        onClick={handleGenerateRecommendations}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
      >
        {loading ? 'Generating Recommendations...' : 'Generate Recommendations'}
      </button>
    </div>
  );

  const Step5 = () => {
    const chartData = recommendations.map((rec) => ({
      name: rec.recommended_role?.title || 'Role',
      score: rec.match_score || 0,
    }));

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">Step 5: AI Recommendations</h2>
        {chartData.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Match Scores</h3>
            <BarChart data={chartData} dataKey="score" color="#3b82f6" height={250} />
          </div>
        )}
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/market/recommend/${rec.id}`)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {rec.recommended_role?.title || 'Role'}
                  </h3>
                  <p className="text-gray-400">{rec.reasoning || rec.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {Math.round(rec.match_score || 0)}%
                  </div>
                  <div className="text-sm text-gray-400">Match</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Salary Potential</div>
                  <div className="text-sm font-semibold text-green-400">
                    {rec.salary_potential || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Market Demand</div>
                  <div className="text-sm font-semibold text-yellow-400">
                    {rec.market_demand_score || 0}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Transition Time</div>
                  <div className="text-sm font-semibold text-purple-400">
                    {rec.estimated_transition_time || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Skill Gap</div>
                  <div className="text-sm font-semibold text-red-400">
                    {rec.skill_gap_analysis?.gap_percentage
                      ? `${Math.round(rec.skill_gap_analysis.gap_percentage)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of 5</span>
            <span className="text-sm text-gray-400">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-8"
          >
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </button>
          {step < 4 && (
            <button
              onClick={() => setStep(Math.min(5, step + 1))}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerRecommender;

