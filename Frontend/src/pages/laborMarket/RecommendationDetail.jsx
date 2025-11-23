import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getRecommendationDetails } from '../../services/laborMarketApi';
import { CardSkeleton } from '../../components/laborMarket/ui/LoadingSkeleton';
import BarChart from '../../components/laborMarket/charts/BarChart';
// ReactFlow import - uncomment when reactflow is installed
// import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
// import 'reactflow/dist/style.css';

const RecommendationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendation();
  }, [id]);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      const response = await getRecommendationDetails(id);
      setRecommendation(response.data);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
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

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Recommendation not found.</p>
        </div>
      </div>
    );
  }

  const skillGap = recommendation.skill_gap_analysis || {};
  const gapChartData = [
    {
      name: 'Matching',
      value: skillGap.matching_skills?.length || 0,
    },
    {
      name: 'Missing',
      value: skillGap.missing_skills?.length || 0,
    },
  ];

  // Simple flow diagram nodes
  const nodes = [
    {
      id: '1',
      type: 'input',
      data: { label: recommendation.current_role?.title || 'Current Role' },
      position: { x: 100, y: 100 },
    },
    {
      id: '2',
      type: 'output',
      data: { label: recommendation.recommended_role?.title || 'Target Role' },
      position: { x: 400, y: 100 },
    },
  ];

  const edges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/market/recommend" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          ← Back to Recommendations
        </Link>

        {/* Header */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {recommendation.recommended_role?.title || 'Recommended Role'}
              </h1>
              <p className="text-gray-400 text-lg">{recommendation.reasoning || recommendation.reason}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {Math.round(recommendation.match_score || 0)}%
              </div>
              <div className="text-sm text-gray-400">Match Score</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Salary Potential</div>
              <div className="text-lg font-semibold text-green-400">
                {recommendation.salary_potential || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Market Demand</div>
              <div className="text-lg font-semibold text-yellow-400">
                {recommendation.market_demand_score || 0}/100
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Transition Time</div>
              <div className="text-lg font-semibold text-purple-400">
                {recommendation.estimated_transition_time || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Skill Gap</div>
              <div className="text-lg font-semibold text-red-400">
                {skillGap.gap_percentage ? `${Math.round(skillGap.gap_percentage)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Career Path Flow */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Career Path Flow</h2>
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            {/* Simple visual representation - replace with ReactFlow when installed */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 px-6 py-3 rounded-lg">
                {recommendation.current_role?.title || 'Current Role'}
              </div>
              <ArrowRightIcon className="w-8 h-8 text-gray-400" />
              <div className="bg-green-600 px-6 py-3 rounded-lg">
                {recommendation.recommended_role?.title || 'Target Role'}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Skill Gap Analysis</h2>
            <div className="mb-4">
              <BarChart data={gapChartData} dataKey="value" color="#ef4444" height={200} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Matching Skills</div>
                <div className="text-2xl font-bold text-green-400">
                  {skillGap.matching_skills?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Missing Skills</div>
                <div className="text-2xl font-bold text-red-400">
                  {skillGap.missing_skills?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Skills You Have
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillGap.matching_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-900 text-green-400 text-sm rounded border border-green-700"
                >
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-4 mt-6 flex items-center text-red-400">
              <XCircleIcon className="w-5 h-5 mr-2" />
              Skills You Need
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillGap.missing_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-900 text-red-400 text-sm rounded border border-red-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Transition Roadmap */}
        {recommendation.recommended_courses && recommendation.recommended_courses.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Transition Roadmap</h2>
            <div className="space-y-4">
              {recommendation.recommended_courses.map((course, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <BookOpenIcon className="w-6 h-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">{course.skill}</h3>
                        <p className="text-sm text-gray-400 mb-2">{course.course_suggestion}</p>
                        <div className="flex flex-wrap gap-2">
                          {course.platforms?.map((platform, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Learning Plan Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/market/learning-path')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Learning Plan
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetail;

