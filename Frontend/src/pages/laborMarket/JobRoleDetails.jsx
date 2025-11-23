import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  getJobRoleDetails,
  getJobRoleSalaryInsights,
  getJobRoleMarketTrends,
  getJobRoleRequiredSkills,
} from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import BarChart from '../../components/laborMarket/charts/BarChart';
import SalaryInsights from './SalaryInsights';

const JobRoleDetails = () => {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [salaryInsights, setSalaryInsights] = useState(null);
  const [marketTrends, setMarketTrends] = useState([]);
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleDetails();
  }, [id]);

  const fetchRoleDetails = async () => {
    try {
      setLoading(true);
      const [roleRes, salaryRes, trendsRes, skillsRes] = await Promise.all([
        getJobRoleDetails(id),
        getJobRoleSalaryInsights(id),
        getJobRoleMarketTrends(id),
        getJobRoleRequiredSkills(id),
      ]);

      setRole(roleRes.data);
      setSalaryInsights(salaryRes.data);
      
      // Ensure trends is an array
      const trendsData = Array.isArray(trendsRes.data) ? trendsRes.data : [];
      setMarketTrends(trendsData);
      
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching role details:', error);
      setMarketTrends([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Job role not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/market/jobs" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          ← Back to Job Roles
        </Link>

        {/* Header */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <BriefcaseIcon className="w-12 h-12 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold mb-2">{role.title}</h1>
                <p className="text-gray-400 text-lg">{role.description}</p>
              </div>
            </div>
            {role.remote_friendly && (
              <span className="px-3 py-1 bg-green-900 text-green-400 text-sm rounded border border-green-700">
                Remote Friendly
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Experience Level</div>
              <div className="text-lg font-semibold capitalize">{role.experience_level || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Education</div>
              <div className="text-lg font-semibold">{role.education_requirements || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Required Skills</div>
              <div className="text-lg font-semibold">{role.required_skills?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Preferred Skills</div>
              <div className="text-lg font-semibold">{role.preferred_skills?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Skills Comparison */}
        {skills && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Skills Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center text-green-400">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.required_skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-900 text-green-400 text-sm rounded border border-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center text-yellow-400">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.preferred_skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-yellow-900 text-yellow-400 text-sm rounded border border-yellow-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {skills.education_requirements && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Education Requirements</h3>
                <p className="text-gray-400">{skills.education_requirements}</p>
              </div>
            )}
          </div>
        )}

        {/* Alternative Titles */}
        {role.alternative_titles && role.alternative_titles.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Alternative Titles</h2>
            <div className="flex flex-wrap gap-2">
              {role.alternative_titles.map((title, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded border border-gray-700"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Market Trends */}
        {marketTrends.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-blue-400" />
              Market Trends
            </h2>
            <div className="space-y-4">
              {marketTrends.map((trend) => (
                <div key={trend.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white capitalize mb-1">{trend.trend_type}</h4>
                      <p className="text-sm text-gray-400">{trend.insights}</p>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        trend.trend_direction === 'up'
                          ? 'text-green-400'
                          : trend.trend_direction === 'down'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {trend.growth_rate >= 0 ? '+' : ''}
                      {trend.growth_rate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary Insights Section */}
        {salaryInsights && (
          <div className="mt-6">
            <SalaryInsights jobRoleId={id} initialData={salaryInsights} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRoleDetails;

