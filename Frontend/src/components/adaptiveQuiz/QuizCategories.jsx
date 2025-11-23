import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBook, FaClock, FaChartBar, FaSpinner } from 'react-icons/fa';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading quiz categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Adaptive Quiz System
          </h1>
          <p className="text-xl text-gray-600">
            Test your knowledge with our intelligent adaptive quizzes
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No categories found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Category Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {category.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                        category.difficulty_level
                      )}`}
                    >
                      {getDifficultyLabel(category.difficulty_level)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 h-12 overflow-hidden">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FaBook className="mr-2 text-purple-600" />
                      <span className="text-sm">
                        {category.total_questions || 0} Questions
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-blue-600" />
                      <span className="text-sm">~30 mins</span>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => startQuiz(category.id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Profile Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/quiz/profile')}
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FaChartBar className="mr-2" />
            View My Skill Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCategories;
