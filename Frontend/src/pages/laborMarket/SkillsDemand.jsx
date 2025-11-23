import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, ArrowTrendingUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  getTrendingSkills,
  getFastestGrowingSkills,
  getHighPayingSkills,
  getSkillsByCategory,
} from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import BarChart from '../../components/laborMarket/charts/BarChart';

const SkillsDemand = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('trending'); // trending, growing, high-paying
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
  });

  useEffect(() => {
    fetchSkills();
  }, [view, filters]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      let response;
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.region) params.region = filters.region;

      if (view === 'trending') {
        response = await getTrendingSkills(params);
      } else if (view === 'growing') {
        response = await getFastestGrowingSkills();
      } else {
        response = await getHighPayingSkills();
      }

      // Ensure response is an array
      const skillsData = Array.isArray(response.data) ? response.data : [];
      setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = skills.slice(0, 10).map((skill) => ({
    name: skill.skill_name || 'Skill',
    growth: skill.growth_rate || 0,
    rank: skill.trending_rank || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skills Demand Analytics</h1>
          <p className="text-gray-400">Track trending skills, growth rates, and salary premiums</p>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setView('trending')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setView('growing')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === 'growing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Fastest Growing
          </button>
          <button
            onClick={() => setView('high-paying')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === 'high-paying'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            High Paying
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              placeholder="Filter by category"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Region</label>
            <input
              type="text"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              placeholder="Filter by region"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Top 10 Skills - Growth Rate</h3>
          {chartData.length > 0 ? (
            <BarChart data={chartData} dataKey="growth" color="#f59e0b" height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Skills Leaderboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FireIcon className="w-6 h-6 mr-2 text-orange-400" />
            Skills Leaderboard
          </h3>
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSkill(skill)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                      {skill.trending_rank || index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{skill.skill_name}</h4>
                      <p className="text-sm text-gray-400">
                        {skill.category} • {skill.job_postings_count || 0} postings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-400 mb-1">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      <span className="font-semibold">+{skill.growth_rate || 0}%</span>
                    </div>
                    {skill.avg_salary_premium && (
                      <div className="text-sm text-yellow-400">
                        +${skill.avg_salary_premium.toLocaleString()} premium
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skill Details Modal */}
        {selectedSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedSkill.skill_name}</h3>
                  <p className="text-gray-400">{selectedSkill.category}</p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Growth Rate</div>
                  <div className="text-2xl font-bold text-green-400">+{selectedSkill.growth_rate || 0}%</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Job Postings</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedSkill.job_postings_count?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Trending Rank</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    #{selectedSkill.trending_rank || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Salary Premium</div>
                  <div className="text-2xl font-bold text-purple-400">
                    ${selectedSkill.avg_salary_premium?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsDemand;

