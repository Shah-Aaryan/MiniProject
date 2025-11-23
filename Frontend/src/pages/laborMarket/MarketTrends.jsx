import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { getMarketInsights } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import LineChart from '../../components/laborMarket/charts/LineChart';
import BarChart from '../../components/laborMarket/charts/BarChart';

const MarketTrends = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await getMarketInsights();
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching market trends:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (would come from API)
  const jobDemandData = [
    { month: 'Jan', demand: 120 },
    { month: 'Feb', demand: 135 },
    { month: 'Mar', demand: 150 },
    { month: 'Apr', demand: 145 },
    { month: 'May', demand: 160 },
    { month: 'Jun', demand: 175 },
  ];

  const salaryTrendData = [
    { month: 'Jan', salary: 80000 },
    { month: 'Feb', salary: 82000 },
    { month: 'Mar', salary: 85000 },
    { month: 'Apr', salary: 84000 },
    { month: 'May', salary: 87000 },
    { month: 'Jun', salary: 90000 },
  ];

  const industryComparisonData = trends?.growing_industries?.slice(0, 5).map((ind) => ({
    name: ind.name || 'Industry',
    growth: ind.growth_rate || 0,
  })) || [];

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
          <h1 className="text-4xl font-bold mb-2">Market Trends Dashboard</h1>
          <p className="text-gray-400">Comprehensive market analysis and trends</p>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-blue-400" />
              Job Demand Trends
            </h3>
            <LineChart data={jobDemandData} dataKey="demand" nameKey="month" color="#3b82f6" height={300} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-green-400" />
              Salary Trends Over Time
            </h3>
            <LineChart data={salaryTrendData} dataKey="salary" nameKey="month" color="#10b981" height={300} />
          </motion.div>
        </div>

        {/* Industry Comparison */}
        {industryComparisonData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Industry Growth Comparison</h3>
            <BarChart data={industryComparisonData} dataKey="growth" color="#f59e0b" height={300} />
          </motion.div>
        )}

        {/* Trending Skills */}
        {trends?.trending_skills && trends.trending_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Top Trending Skills</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {trends.trending_skills.slice(0, 10).map((skill, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-white mb-1">{skill.skill_name}</div>
                  <div className="flex items-center justify-center text-xs text-green-400">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                    +{skill.growth_rate}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Emerging Roles */}
        {trends?.emerging_roles && trends.emerging_roles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Emerging Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.emerging_roles.slice(0, 6).map((role) => (
                <div key={role.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{role.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{role.description}</p>
                  <div className="flex items-center text-xs text-green-400">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                    Score: {role.emergence_score}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketTrends;

