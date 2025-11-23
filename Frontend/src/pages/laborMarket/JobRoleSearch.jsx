import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getJobRoles } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

const JobRoleSearch = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    experience: '',
    remote: false,
  });

  useEffect(() => {
    fetchJobRoles();
  }, [filters]);

  const fetchJobRoles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.industry) params.industry = filters.industry;
      if (filters.experience) params.experience = filters.experience;
      if (filters.remote) params.remote = 'true';

      const response = await getJobRoles(params);
      console.log('Job roles response:', response);
      // Handle both response.data and direct array response
      const rolesData = Array.isArray(response) ? response : (response.data || []);
      setJobRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job Role Search</h1>
          <p className="text-gray-400">Find and explore job roles with detailed insights</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search job titles..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Experience</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Remote Friendly</span>
            </label>
          </div>
        </div>

        {/* Job Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobRoles.map((role) => (
            <Link key={role.id} to={`/market/jobs/${role.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-600 transition-colors h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <BriefcaseIcon className="w-8 h-8 text-blue-400" />
                  {role.remote_friendly && (
                    <span className="px-2 py-1 bg-green-900 text-green-400 text-xs rounded border border-green-700">
                      Remote
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{role.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="capitalize">{role.experience_level || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.required_skills?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-800 text-blue-400 text-xs rounded border border-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.required_skills?.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">+{role.required_skills.length - 3} more</span>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {jobRoles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No job roles found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRoleSearch;

