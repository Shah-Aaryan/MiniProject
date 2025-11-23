import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  FaTrophy,
  FaChartLine,
  FaAward,
  FaExclamationTriangle,
  FaBook,
  FaSpinner,
  FaArrowLeft,
  FaCalendar,
  FaPercent
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const SkillProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/adaptive-quiz/skill-profiles/my_profile/`
      );
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load skill profile. Please try again.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (level) => {
    if (level >= 8) return 'bg-green-500';
    if (level >= 6) return 'bg-blue-500';
    if (level >= 4) return 'bg-yellow-500';
    if (level >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSkillLabel = (level) => {
    if (level >= 8) return 'Expert';
    if (level >= 6) return 'Advanced';
    if (level >= 4) return 'Intermediate';
    if (level >= 2) return 'Beginner';
    return 'Novice';
  };

  // Prepare skill progression chart
  const getProgressionChartData = () => {
    if (!profile?.quiz_history || profile.quiz_history.length === 0) return null;

    const sortedHistory = [...profile.quiz_history].sort(
      (a, b) => new Date(a.completed_at) - new Date(b.completed_at)
    );

    return {
      labels: sortedHistory.map((quiz, index) => `Quiz ${index + 1}`),
      datasets: [
        {
          label: 'Score (%)',
          data: sortedHistory.map(quiz => quiz.percentage),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading skill profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'No profile data available'}</p>
          <button
            onClick={() => navigate('/quiz/categories')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Start Taking Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Get top 5 skills
  const topSkills = Object.entries(profile.skill_levels || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get weak areas (skills with level < 4)
  const weakAreas = Object.entries(profile.skill_levels || {})
    .filter(([_, level]) => level < 4)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/quiz/categories')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4 font-semibold"
          >
            <FaArrowLeft className="mr-2" />
            Back to Quizzes
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Skill Profile</h1>
          <p className="text-xl text-gray-600">Track your learning progress and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaBook className="text-4xl text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{profile.total_quizzes_taken || 0}</p>
            <p className="text-sm text-gray-600">Quizzes Taken</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaPercent className="text-4xl text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">
              {profile.average_score ? profile.average_score.toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaTrophy className="text-4xl text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{profile.total_points || 0}</p>
            <p className="text-sm text-gray-600">Total Points</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaAward className="text-4xl text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">
              {Object.keys(profile.skill_levels || {}).length}
            </p>
            <p className="text-sm text-gray-600">Skills Assessed</p>
          </div>
        </div>

        {/* Top Skills Section */}
        {topSkills.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaChartLine className="mr-3 text-green-600" />
              Top 5 Skills
            </h2>
            <div className="space-y-4">
              {topSkills.map(([skill, level], index) => (
                <div key={skill} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold text-sm mr-3">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{skill}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        {getSkillLabel(level)}
                      </span>
                      <span className="font-bold text-purple-600">{level}/10</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getSkillColor(level)} transition-all duration-500`}
                      style={{ width: `${(level / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak Areas Section */}
        {weakAreas.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaExclamationTriangle className="mr-3 text-orange-600" />
              Areas for Improvement
            </h2>
            <div className="space-y-4">
              {weakAreas.map(([skill, level]) => (
                <div key={skill} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">{skill}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        {getSkillLabel(level)}
                      </span>
                      <span className="font-bold text-orange-600">{level}/10</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getSkillColor(level)} transition-all duration-500`}
                      style={{ width: `${(level / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                💡 <strong>Tip:</strong> Focus on taking quizzes in these categories to improve your weak areas!
              </p>
            </div>
          </div>
        )}

        {/* Skill Progression Chart */}
        {profile.quiz_history && profile.quiz_history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📈 Performance Over Time
            </h2>
            {getProgressionChartData() && (
              <Line
                data={getProgressionChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Score: ${context.parsed.y.toFixed(1)}%`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        )}

        {/* Quiz History */}
        {profile.quiz_history && profile.quiz_history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaCalendar className="mr-3 text-blue-600" />
              Recent Quiz History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profile.quiz_history.slice(0, 10).map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-800">{quiz.category_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-purple-600">{quiz.total_score} pts</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${quiz.percentage >= 75 ? 'text-green-600' : quiz.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {quiz.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(quiz.completed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/quiz/results/${quiz.id}`)}
                          className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!profile.quiz_history || profile.quiz_history.length === 0) && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Quiz History Yet</h3>
            <p className="text-gray-600 mb-6">
              Start taking quizzes to build your skill profile and track your progress!
            </p>
            <button
              onClick={() => navigate('/quiz/categories')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaBook className="mr-2" />
              Browse Quiz Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillProfile;
