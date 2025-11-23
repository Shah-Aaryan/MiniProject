import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getJobRoleSalaryInsights } from '../../services/laborMarketApi';
import LineChart from '../../components/laborMarket/charts/LineChart';
import BarChart from '../../components/laborMarket/charts/BarChart';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';

const SalaryInsights = ({ jobRoleId, initialData = null }) => {
  const [salaryData, setSalaryData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
  });

  useEffect(() => {
    if (!initialData && jobRoleId) {
      fetchSalaryData();
    }
  }, [jobRoleId, filters]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const response = await getJobRoleSalaryInsights(jobRoleId, filters);
      setSalaryData(response.data);
    } catch (error) {
      console.error('Error fetching salary insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!salaryData?.data) return;
    const csv = [
      ['Location', 'Experience', 'Min Salary', 'Max Salary', 'Median Salary', 'Average Salary'],
      ...salaryData.data.map((item) => [
        `${item.city}, ${item.state}`,
        item.experience_level,
        item.min_salary,
        item.max_salary,
        item.median_salary,
        item.average_salary,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salary_data.csv';
    a.click();
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (!salaryData || !salaryData.data || salaryData.data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">No salary data available for this role.</p>
      </div>
    );
  }

  const locationData = salaryData.data.reduce((acc, item) => {
    const key = `${item.city}, ${item.state}`;
    if (!acc[key]) {
      acc[key] = {
        location: key,
        min: item.min_salary,
        max: item.max_salary,
        median: item.median_salary,
        avg: item.average_salary,
      };
    }
    return acc;
  }, {});

  const chartData = Object.values(locationData);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <CurrencyDollarIcon className="w-6 h-6 mr-2 text-green-400" />
          Salary Insights
        </h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="City or State"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
          <select
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
        </div>
      </div>

      {/* Salary Range Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Minimum</div>
          <div className="text-2xl font-bold text-red-400">
            ${salaryData.min_salary?.toLocaleString() || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Maximum</div>
          <div className="text-2xl font-bold text-green-400">
            ${salaryData.max_salary?.toLocaleString() || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Median</div>
          <div className="text-2xl font-bold text-blue-400">
            ${salaryData.avg_median?.toLocaleString() || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Average</div>
          <div className="text-2xl font-bold text-yellow-400">
            ${Math.round((salaryData.min_salary + salaryData.max_salary) / 2)?.toLocaleString() || 'N/A'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Salary by Location</h3>
          <BarChart data={chartData} dataKey="median" nameKey="location" color="#3b82f6" height={300} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Salary Range by Location</h3>
          <BarChart data={chartData} dataKey="max" nameKey="location" color="#10b981" height={300} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-medium">Location</th>
              <th className="pb-3 text-gray-400 font-medium">Experience</th>
              <th className="pb-3 text-gray-400 font-medium">Min</th>
              <th className="pb-3 text-gray-400 font-medium">Max</th>
              <th className="pb-3 text-gray-400 font-medium">Median</th>
              <th className="pb-3 text-gray-400 font-medium">Average</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-3 text-white">
                  {item.city}, {item.state}
                </td>
                <td className="py-3 text-gray-400 capitalize">{item.experience_level}</td>
                <td className="py-3 text-red-400">${item.min_salary?.toLocaleString()}</td>
                <td className="py-3 text-green-400">${item.max_salary?.toLocaleString()}</td>
                <td className="py-3 text-blue-400">${item.median_salary?.toLocaleString()}</td>
                <td className="py-3 text-yellow-400">${item.average_salary?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryInsights;

