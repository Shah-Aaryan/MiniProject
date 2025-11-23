import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  CheckCircleIcon,
  FireIcon,
  LightBulbIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const AdaptiveQuizDashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [skillProfile, setSkillProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalTime: 0,
    topCategory: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories
      const categoriesResponse = await axios.get(`${API_BASE_URL}/adaptive-quiz/categories/`);
      setCategories(categoriesResponse.data.results || categoriesResponse.data);

      // Fetch quiz history
      const historyResponse = await axios.get(`${API_BASE_URL}/adaptive-quiz/quizzes/`);
      const quizzes = historyResponse.data.results || historyResponse.data;
      setQuizHistory(quizzes.slice(0, 5)); // Last 5 quizzes

      // Calculate stats
      if (quizzes.length > 0) {
        const completed = quizzes.filter(q => q.is_completed);
        const avgScore = completed.reduce((sum, q) => sum + q.total_score, 0) / (completed.length || 1);
        const totalTime = completed.reduce((sum, q) => sum + q.time_taken, 0);
        
        setStats({
          totalQuizzes: completed.length,
          averageScore: avgScore.toFixed(1),
          totalTime: Math.floor(totalTime / 60), // Convert to minutes
          topCategory: completed[0]?.category?.name || 'N/A'
        });
      }

      // Try to fetch skill profile
      try {
        const profileResponse = await axios.get(`${API_BASE_URL}/adaptive-quiz/skill-profiles/my_profile/`);
        setSkillProfile(profileResponse.data);
      } catch (profileError) {
        console.log('No skill profile yet:', profileError);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (categoryId) => {
    navigate(`/quiz/categories`);
  };

  const getDifficultyColor = (level) => {
    if (level === 1) return 'text-green-400';
    if (level === 2) return 'text-yellow-400';
    if (level === 3) return 'text-orange-400';
    if (level >= 4) return 'text-red-400';
    return 'text-gray-400';
  };

  const getDifficultyLabel = (level) => {
    if (level === 1) return 'Beginner';
    if (level === 2) return 'Easy';
    if (level === 3) return 'Medium';
    if (level === 4) return 'Hard';
    if (level >= 5) return 'Expert';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="chat-bg-image min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="text-white mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-bg-image min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-8 max-w-md">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-bg-image min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl border-2 border-cyan-500/50 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Adaptive Quiz System</h1>
                <p className="text-gray-300">Challenge yourself with intelligent quizzes that adapt to your skill level</p>
              </div>
              <SparklesIcon className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-md p-6 rounded-xl border-2 border-blue-500/50"
          >
            <TrophyIcon className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-gray-300 text-sm">Quizzes Completed</p>
            <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md p-6 rounded-xl border-2 border-green-500/50"
          >
            <ChartBarIcon className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-300 text-sm">Average Score</p>
            <p className="text-3xl font-bold text-white">{stats.averageScore}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md p-6 rounded-xl border-2 border-purple-500/50"
          >
            <ClockIcon className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-gray-300 text-sm">Total Time (mins)</p>
            <p className="text-3xl font-bold text-white">{stats.totalTime}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-md p-6 rounded-xl border-2 border-yellow-500/50"
          >
            <FireIcon className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-gray-300 text-sm">Top Category</p>
            <p className="text-lg font-bold text-white truncate">{stats.topCategory}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Categories */}
          <div className="lg:col-span-2">
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <AcademicCapIcon className="w-7 h-7 mr-2 text-cyan-400" />
                  Available Quizzes
                </h2>
                <button
                  onClick={() => navigate('/quiz/categories')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center transition-all"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.slice(0, 4).map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border-2 border-gray-700 hover:border-cyan-500 transition-all cursor-pointer group"
                    onClick={() => handleStartQuiz(category.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {category.name}
                      </h3>
                      <span className={`text-sm font-bold ${getDifficultyColor(category.difficulty_level)}`}>
                        {getDifficultyLabel(category.difficulty_level)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{category.question_count} Questions</span>
                      <ArrowRightIcon className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity & Skill Profile */}
          <div className="space-y-6">
            {/* Recent Quizzes */}
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border-2 border-cyan-500/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-cyan-400" />
                Recent Activity
              </h2>
              
              {quizHistory.length === 0 ? (
                <div className="text-center py-8">
                  <LightBulbIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No quizzes taken yet</p>
                  <button
                    onClick={() => navigate('/quiz/categories')}
                    className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                  >
                    Start Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizHistory.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all cursor-pointer"
                      onClick={() => quiz.is_completed && navigate(`/quiz/results/${quiz.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold truncate">{quiz.category_name}</p>
                        {quiz.is_completed && (
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {new Date(quiz.started_at).toLocaleDateString()}
                        </span>
                        {quiz.is_completed && (
                          <span className="text-cyan-400 font-semibold">
                            Score: {quiz.total_score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl border-2 border-cyan-500/50">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/quiz/categories')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  Start New Quiz
                </button>
                <button
                  onClick={() => navigate('/quiz/profile')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                >
                  View Skill Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveQuizDashboard;
