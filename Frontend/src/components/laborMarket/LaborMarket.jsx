import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  FireIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const LaborMarket = ({ userId }) => {
  const [industries, setIndustries] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedJobRole, setSelectedJobRole] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [marketTrends, setMarketTrends] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [emergingRoles, setEmergingRoles] = useState([]);
  const [careerRecommendations, setCareerRecommendations] = useState([]);
  const [companyInsights, setCompanyInsights] = useState([]);
  const [view, setView] = useState('overview'); // overview, industries, roles, trends, recommendations
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    remote: false
  });

  useEffect(() => {
    fetchIndustries();
    fetchTrendingSkills();
    fetchEmergingRoles();
    if (userId) {
      fetchCareerRecommendations();
    }
  }, [userId]);

  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/industries/');
      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const fetchJobRoles = async (industryId, query = '') => {
    try {
      let url = `http://127.0.0.1:8000/api/job-roles/?industry=${industryId}`;
      if (query) url += `&search=${query}`;
      if (filters.experience) url += `&experience=${filters.experience}`;
      if (filters.remote) url += `&remote=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      setJobRoles(data);
    } catch (error) {
      console.error('Error fetching job roles:', error);
    }
  };

  const fetchSalaryInsights = async (jobRoleId) => {
    try {
      let url = `http://127.0.0.1:8000/api/job-roles/${jobRoleId}/salary_insights/`;
      if (filters.location) url += `?location=${filters.location}`;
      if (filters.experience) url += `${filters.location ? '&' : '?'}experience=${filters.experience}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setSalaryData(data);
    } catch (error) {
      console.error('Error fetching salary insights:', error);
    }
  };

  const fetchMarketTrends = async (jobRoleId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/job-roles/${jobRoleId}/market_trends/`);
      const data = await response.json();
      setMarketTrends(data);
    } catch (error) {
      console.error('Error fetching market trends:', error);
    }
  };

  const fetchTrendingSkills = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/skill-demands/trending/');
      const data = await response.json();
      setTrendingSkills(data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching trending skills:', error);
    }
  };

  const fetchEmergingRoles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/emerging-roles/');
      const data = await response.json();
      setEmergingRoles(data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching emerging roles:', error);
    }
  };

  const fetchCareerRecommendations = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/career-recommendations/?user_id=${userId}`);
      const data = await response.json();
      setCareerRecommendations(data);
    } catch (error) {
      console.error('Error fetching career recommendations:', error);
    }
  };

  const OverviewView = () => (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-blue-600 rounded-lg p-5">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-400 mb-2" />
          <div className="text-3xl font-semibold text-white mb-1">{industries.length}</div>
          <div className="text-sm text-gray-400">Industries</div>
        </div>
        <div className="bg-gray-900 border border-green-600 rounded-lg p-5">
          <BriefcaseIcon className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-3xl font-semibold text-white mb-1">{emergingRoles.length}</div>
          <div className="text-sm text-gray-400">Emerging Roles</div>
        </div>
        <div className="bg-gray-900 border border-yellow-600 rounded-lg p-5">
          <FireIcon className="w-8 h-8 text-yellow-400 mb-2" />
          <div className="text-3xl font-semibold text-white mb-1">{trendingSkills.length}</div>
          <div className="text-sm text-gray-400">Trending Skills</div>
        </div>
        <div className="bg-gray-900 border border-red-600 rounded-lg p-5">
          <ArrowTrendingUpIcon className="w-8 h-8 text-red-400 mb-2" />
          <div className="text-3xl font-semibold text-white mb-1">+22%</div>
          <div className="text-sm text-gray-400">Avg Growth</div>
        </div>
      </div>

      {/* Trending Skills */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FireIcon className="w-5 h-5 mr-2 text-orange-400" />
          Trending Skills
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {trendingSkills.map((skill, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-white mb-1">{skill.skill_name}</div>
              <div className="flex items-center justify-center text-xs text-green-400">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                +{skill.growth_rate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Roles */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-blue-400" />
          Emerging Job Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {emergingRoles.map((role) => (
            <div key={role.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer">
              <h4 className="font-medium text-white mb-1">{role.title}</h4>
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{role.description}</p>
              <div className="flex items-center text-xs text-green-400">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                High Demand
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Recommendations */}
      {careerRecommendations.length > 0 && (
        <div className="bg-gray-900 border border-blue-600 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-400" />
            Recommended Career Paths for You
          </h3>
          <div className="space-y-3">
            {careerRecommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white mb-1">{rec.recommended_role}</h4>
                    <p className="text-sm text-gray-400">{rec.reason}</p>
                  </div>
                  <div className="text-sm font-medium text-blue-400">
                    {rec.match_score}% match
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const IndustriesView = () => (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Industries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => (
          <motion.div
            key={industry.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedIndustry(industry);
              fetchJobRoles(industry.id);
              setView('roles');
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-blue-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{industry.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{industry.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-4">
              <div className="flex items-center text-green-400">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +{industry.growth_rate}%
              </div>
              <div className="text-gray-400">{industry.total_jobs?.toLocaleString()} jobs</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const RolesView = () => (
    <div>
      <button
        onClick={() => {
          setView('industries');
          setSelectedIndustry(null);
        }}
        className="mb-6 text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Industries
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {selectedIndustry?.name} - Job Roles
        </h2>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchJobRoles(selectedIndustry.id, e.target.value);
              }}
              placeholder="Search job roles..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.experience}
            onChange={(e) => {
              setFilters({ ...filters, experience: e.target.value });
              fetchJobRoles(selectedIndustry.id, searchQuery);
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Experience Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobRoles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setSelectedJobRole(role);
              fetchSalaryInsights(role.id);
              fetchMarketTrends(role.id);
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-blue-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{role.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{role.description}</p>
              </div>
              {role.remote_friendly && (
                <span className="px-2 py-1 bg-green-900 text-green-400 text-xs rounded border border-green-700">
                  Remote
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {role.required_skills?.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-800 text-blue-400 text-xs rounded border border-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Job Role Details Modal */}
      {selectedJobRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{selectedJobRole.title}</h3>
                <p className="text-gray-400">{selectedJobRole.description}</p>
              </div>
              <button
                onClick={() => setSelectedJobRole(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Salary Insights */}
            {salaryData && salaryData.data && salaryData.data.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-4">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-400" />
                  Salary Range
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-400 mb-1">
                      ${salaryData.min_salary?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Minimum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-400 mb-1">
                      ${salaryData.avg_median?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-yellow-400 mb-1">
                      ${salaryData.max_salary?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Maximum</div>
                  </div>
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-4">
              <h4 className="text-lg font-medium text-white mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJobRole.required_skills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-900 text-blue-400 text-sm rounded border border-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            {marketTrends.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Market Trends
                </h4>
                <div className="space-y-3">
                  {marketTrends.slice(0, 3).map((trend) => (
                    <div key={trend.id} className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-white capitalize">{trend.trend_type}</h5>
                        <p className="text-sm text-gray-400">{trend.insights}</p>
                      </div>
                      <div className={`text-sm font-medium ${
                        trend.trend_direction === 'up' ? 'text-green-400' : 
                        trend.trend_direction === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {trend.growth_rate >= 0 ? '+' : ''}{trend.growth_rate}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2 flex items-center">
            <GlobeAltIcon className="w-8 h-8 mr-3 text-blue-400" />
            Labor Market Intelligence
          </h1>
          <p className="text-gray-400">Explore job market data, salary trends, and career insights</p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setView('overview')}
            className={`px-5 py-2 rounded font-medium transition-colors ${
              view === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('industries')}
            className={`px-5 py-2 rounded font-medium transition-colors ${
              view === 'industries' || view === 'roles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Industries & Roles
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'overview' && <OverviewView />}
          {view === 'industries' && <IndustriesView />}
          {view === 'roles' && <RolesView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LaborMarket;
