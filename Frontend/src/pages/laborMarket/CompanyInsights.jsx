import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon, MapPinIcon, BriefcaseIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getCompanies, getTopHiringCompanies, getCompanyDetails } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

const CompanyInsights = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    location: '',
    size: '',
    hiring: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.industry) params.industry = filters.industry;
      if (filters.location) params.location = filters.location;
      if (filters.size) params.size = filters.size;
      if (filters.hiring) params.hiring = filters.hiring;

      const response = await getCompanies(params);
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.company_name?.toLowerCase().includes(filters.search.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold mb-2">Company Insights</h1>
          <p className="text-gray-400">Explore companies, hiring trends, and opportunities</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Location"
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sizes</option>
              <option value="startup">Startup</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={filters.hiring}
              onChange={(e) => setFilters({ ...filters, hiring: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="active">Active Hiring</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link key={company.id} to={`/market/companies/${company.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-green-600 transition-colors h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <BuildingOfficeIcon className="w-10 h-10 text-green-400" />
                  {company.active_job_openings > 0 && (
                    <span className="px-2 py-1 bg-green-900 text-green-400 text-xs rounded border border-green-700">
                      Hiring
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{company.company_name}</h3>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {company.location}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Openings</div>
                    <div className="text-lg font-semibold text-green-400">
                      {company.active_job_openings || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Size</div>
                    <div className="text-lg font-semibold text-blue-400 capitalize">
                      {company.company_size || 'N/A'}
                    </div>
                  </div>
                </div>
                {company.employee_satisfaction_rating && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 mr-2">Rating:</span>
                    <span className="text-yellow-400 font-semibold">
                      {company.employee_satisfaction_rating}/5
                    </span>
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No companies found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInsights;

