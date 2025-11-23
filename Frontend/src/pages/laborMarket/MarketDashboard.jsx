import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  BriefcaseIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import MetricCard from '../../components/laborMarket/ui/MetricCard';
import BarChart from '../../components/laborMarket/charts/BarChart';
import LineChart from '../../components/laborMarket/charts/LineChart';
import { CardSkeleton, ChartSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import {
  getTrendingIndustries,
  getTrendingSkills,
  getEmergingRoles,
  getTopHiringCompanies,
  getMarketInsights,
} from '../../services/laborMarketApi';
import { Link } from 'react-router-dom';

const MarketDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    avgSalary: 0,
    topSkills: [],
    growingIndustries: [],
    emergingRoles: [],
    topCompanies: [],
    trendingSkills: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [industriesRes, skillsRes, rolesRes, companiesRes, insightsRes] = await Promise.all([
        getTrendingIndustries(),
        getTrendingSkills(),
        getEmergingRoles(),
        getTopHiringCompanies(),
        getMarketInsights(),
      ]);

      const industries = industriesRes.data || [];
      const skills = skillsRes.data || [];
      const roles = rolesRes.data || [];
      const companies = companiesRes.data || [];
      const insights = insightsRes.data || {};

      // Calculate metrics
      const totalJobs = industries.reduce((sum, ind) => sum + (ind.total_jobs || 0), 0);
      const avgSalary = 85000; // Placeholder - would come from API

      setMetrics({
        totalJobs,
        avgSalary,
        topSkills: skills.slice(0, 10),
        growingIndustries: industries.slice(0, 5),
        emergingRoles: roles.slice(0, 6),
        topCompanies: companies.slice(0, 5),
        trendingSkills: skills.slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendingSkillsChartData = metrics.trendingSkills.map((skill, index) => ({
    name: skill.skill_name || `Skill ${index + 1}`,
    growth: skill.growth_rate || 0,
    rank: skill.trending_rank || index + 1,
  }));

  const industryGrowthData = metrics.growingIndustries.map((ind) => ({
    name: ind.name || 'Industry',
    growth: ind.growth_rate || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Market Overview</h1>
            <p className="text-gray-400">Real-time labor market intelligence and insights</p>
          </div>
          <div className="relative w-96">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={BriefcaseIcon}
            title="Total Jobs"
            value={metrics.totalJobs.toLocaleString()}
            color="blue"
            trend={12}
          />
          <MetricCard
            icon={ChartBarIcon}
            title="Avg Salary"
            value={`$${metrics.avgSalary.toLocaleString()}`}
            color="green"
            trend={5}
          />
          <MetricCard
            icon={FireIcon}
            title="Trending Skills"
            value={metrics.trendingSkills.length}
            color="yellow"
          />
          <MetricCard
            icon={BuildingOfficeIcon}
            title="Growing Industries"
            value={metrics.growingIndustries.length}
            color="purple"
            trend={22}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Skills Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FireIcon className="w-6 h-6 mr-2 text-orange-400" />
              Top 10 Trending Skills
            </h3>
            {trendingSkillsChartData.length > 0 ? (
              <BarChart data={trendingSkillsChartData} dataKey="growth" color="#f59e0b" height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </motion.div>

          {/* Industry Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-green-400" />
              Industry Growth Rates
            </h3>
            {industryGrowthData.length > 0 ? (
              <BarChart data={industryGrowthData} dataKey="growth" color="#10b981" height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Emerging Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <FireIcon className="w-6 h-6 mr-2 text-blue-400" />
              Emerging Roles
            </h3>
            <Link
              to="/market/emerging"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.emergingRoles.map((role) => (
              <Link
                key={role.id}
                to={`/market/emerging/${role.id}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors"
              >
                <h4 className="font-semibold text-white mb-2">{role.title}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{role.description}</p>
                <div className="flex items-center text-xs text-green-400">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  Score: {role.emergence_score || 'N/A'}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Top Hiring Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-2 text-green-400" />
              Top Hiring Companies
            </h3>
            <Link
              to="/market/companies"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.topCompanies.map((company) => (
              <Link
                key={company.id}
                to={`/market/companies/${company.id}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-600 transition-colors"
              >
                <h4 className="font-semibold text-white mb-2">{company.company_name}</h4>
                <p className="text-sm text-gray-400 mb-2">{company.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400">
                    {company.active_job_openings || 0} openings
                  </span>
                  <span className="text-xs text-gray-500">{company.company_size}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketDashboard;

