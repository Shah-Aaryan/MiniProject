import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { getEmergingRoles, getHighestGrowthRoles } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import BarChart from '../../components/laborMarket/charts/BarChart';

const EmergingRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score'); // score, growth

  useEffect(() => {
    fetchRoles();
  }, [sortBy]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response =
        sortBy === 'score' ? await getEmergingRoles() : await getHighestGrowthRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching emerging roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = roles.slice(0, 10).map((role) => ({
    name: role.title || 'Role',
    score: role.emergence_score || 0,
    growth: role.growth_projection || 0,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Emerging Roles Explorer</h1>
            <p className="text-gray-400">Discover new and growing job roles in the market</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Sort by Emergence Score</option>
            <option value="growth">Sort by Growth Projection</option>
          </select>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Top 10 Emerging Roles</h3>
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              dataKey={sortBy === 'score' ? 'score' : 'growth'}
              color="#8b5cf6"
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link key={role.id} to={`/market/emerging/${role.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-purple-600 transition-colors h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <FireIcon className="w-8 h-8 text-purple-400" />
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Score</div>
                    <div className="text-xl font-bold text-purple-400">
                      {role.emergence_score || 'N/A'}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{role.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-400">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+{role.growth_projection || 0}%</span>
                  </div>
                  <span className="text-xs text-blue-400 hover:text-blue-300">View Details →</span>
                </div>
                {role.required_skills && role.required_skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 mb-2">Key Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {role.required_skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800 text-purple-400 text-xs rounded border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergingRoles;

