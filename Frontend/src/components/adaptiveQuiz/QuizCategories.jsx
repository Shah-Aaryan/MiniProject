import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBook, FaClock, FaChartBar, FaSpinner, FaBrain, FaRocket, FaStar, FaFire, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const QuizCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchTerm, difficultyFilter, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/adaptive-quiz/categories/`);
      const data = response.data.results || response.data;
      setCategories(data);
      setFilteredCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load quiz categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(cat => cat.difficulty_level === parseInt(difficultyFilter));
    }

    setFilteredCategories(filtered);
  };

  const startQuiz = async (categoryId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/adaptive-quiz/quizzes/start/`, {
        category_id: categoryId
      });
      if (response.data.quiz && response.data.quiz.id) {
        navigate(`/quiz/take/${response.data.quiz.id}`);
      } else {
        alert('Failed to start quiz. Invalid response.');
      }
    } catch (err) {
      alert('Failed to start quiz. Please try again.');
      console.error('Error starting quiz:', err);
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Loading quiz categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <FaBrain className="text-5xl text-blue-500 mr-3 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              Adaptive Quiz System
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            Test your knowledge with our intelligent adaptive quizzes
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <FaRocket className="mr-2 text-blue-500" />
              <span>10 Questions Per Quiz</span>
            </div>
            <div className="flex items-center">
              <FaTrophy className="mr-2 text-red-500" />
              <span>Adaptive Difficulty</span>
            </div>
            <div className="flex items-center">
              <FaFire className="mr-2 text-blue-400" />
              <span>Real-time Scoring</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8 border border-red-900/30">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="1">Beginner</option>
              <option value="2">Easy</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Enhanced Categories Grid with Animations */}
        {filteredCategories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No categories found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Gradient Header Bar */}
                <div className="h-2 bg-gradient-to-r from-blue-600 to-red-600"></div>
                
                <div className="p-6 bg-gray-900">
                  {/* Category Header with Icon */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-red-900 rounded-lg flex items-center justify-center mr-3">
                        <FaBrain className="text-2xl text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {category.name}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                        category.difficulty_level
                      )}`}
                    >
                      {getDifficultyLabel(category.difficulty_level)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 h-12 overflow-hidden text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-900/30 to-black p-3 rounded-lg border border-blue-800/30">
                      <div className="flex items-center mb-1">
                        <FaBook className="text-blue-400 mr-2" />
                        <span className="text-xs font-semibold text-gray-300">Questions</span>
                      </div>
                      <p className="text-lg font-bold text-blue-400">
                        {category.total_questions || 10}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/30 to-black p-3 rounded-lg border border-red-800/30">
                      <div className="flex items-center mb-1">
                        <FaClock className="text-red-400 mr-2" />
                        <span className="text-xs font-semibold text-gray-300">Duration</span>
                      </div>
                      <p className="text-lg font-bold text-red-400">~30 min</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center text-xs text-gray-300">
                      <FaStar className="text-blue-400 mr-2" />
                      <span>Exactly 10 unique questions</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-300">
                      <FaFire className="text-red-400 mr-2" />
                      <span>Adaptive difficulty progression</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-300">
                      <FaTrophy className="text-blue-500 mr-2" />
                      <span>Instant feedback & explanations</span>
                    </div>
                  </div>

                  {/* Enhanced Start Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startQuiz(category.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <FaRocket className="mr-2" />
                    Start Quiz
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Enhanced View Profile Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/quiz/profile')}
            className="inline-flex items-center px-8 py-4 bg-black/60 backdrop-blur-md text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-600 hover:border-red-600"
          >
            <FaChartBar className="mr-2" />
            View My Skill Profile
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizCategories;
