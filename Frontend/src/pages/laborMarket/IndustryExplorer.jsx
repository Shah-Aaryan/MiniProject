import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon, ArrowTrendingUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getIndustries, getIndustryJobRoles } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

const IndustryExplorer = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const [sortBy, setSortBy] = useState('growth');

  useEffect(() => {
    fetchIndustries();
  }, []);

  useEffect(() => {
    if (selectedIndustry) {
      fetchJobRoles(selectedIndustry.id);
    }
  }, [selectedIndustry]);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const response = await getIndustries();
      const data = Array.isArray(response.data) ? response.data : [];
      setIndustries(data);
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobRoles = async (industryId) => {
    try {
      const response = await getIndustryJobRoles(industryId);
      const data = Array.isArray(response.data) ? response.data : [];
      setJobRoles(data);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    }
  };

  const filteredIndustries = industries.filter((ind) =>
    ind.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedIndustries = [...filteredIndustries].sort((a, b) => {
    if (sortBy === 'growth') return (b.growth_rate || 0) - (a.growth_rate || 0);
    if (sortBy === 'jobs') return (b.total_jobs || 0) - (a.total_jobs || 0);
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto space-y-6">
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
            <h1 className="text-4xl font-bold mb-2">Industry Explorer</h1>
            <p className="text-gray-400">Explore industries, growth rates, and job opportunities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search industries..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="growth">Sort by Growth Rate</option>
            <option value="jobs">Sort by Job Count</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Industry Grid */}
        {!selectedIndustry ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIndustries.map((industry) => (
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedIndustry(industry)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <BuildingOfficeIcon className="w-10 h-10 text-blue-400" />
                  <span className="text-xs text-gray-500">{industry.total_jobs?.toLocaleString() || 0} jobs</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{industry.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-400">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+{industry.growth_rate || 0}%</span>
                  </div>
                  <span className="text-xs text-blue-400 hover:text-blue-300">View Details →</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setSelectedIndustry(null);
                setJobRoles([]);
              }}
              className="mb-6 text-blue-400 hover:text-blue-300 flex items-center"
            >
              ← Back to Industries
            </button>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{selectedIndustry.name}</h2>
              <p className="text-gray-400 mb-4">{selectedIndustry.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-semibold text-green-400">+{selectedIndustry.growth_rate || 0}%</div>
                  <div className="text-sm text-gray-400">Growth Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-blue-400">
                    {selectedIndustry.total_jobs?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-yellow-400">{jobRoles.length}</div>
                  <div className="text-sm text-gray-400">Job Roles</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Top Job Roles in {selectedIndustry.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobRoles.map((role) => (
                  <Link
                    key={role.id}
                    to={`/market/jobs/${role.id}`}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors"
                  >
                    <h4 className="font-semibold text-white mb-2">{role.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{role.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {role.required_skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-900 text-blue-400 text-xs rounded border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryExplorer;

