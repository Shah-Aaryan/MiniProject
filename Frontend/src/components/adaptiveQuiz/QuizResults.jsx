import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadarController, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaHome, FaChartBar, FaSpinner, FaBrain, FaBolt, FaAward, FaFire, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadarController, RadialLinearScale, Title, Tooltip, Legend);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const QuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [learningResources, setLearningResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [showLearningModule, setShowLearningModule] = useState(false);

  useEffect(() => {
    fetchResults();
    fetchLearningResources();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/results/`
      );
      
      // Backend returns nested structure with quiz, difficulty_stats, and performance_summary
      const data = response.data;
      const quiz = data.quiz;
      const performanceSummary = data.performance_summary;
      
      // Flatten the structure for easier access
      const flattenedResults = {
        ...quiz,
        category_name: quiz.category_name || quiz.category,
        percentage: performanceSummary.score_percentage,
        accuracy: performanceSummary.accuracy,
        difficulty_stats: data.difficulty_stats,
        performance_summary: performanceSummary
      };
      
      setResults(flattenedResults);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      // Check if quiz doesn't exist (404 error)
      if (err.response && err.response.status === 404) {
        setError('Quiz not found. It may have been deleted.');
        setTimeout(() => {
          navigate('/quiz/categories');
        }, 2000);
      } else {
        setError('Failed to load results. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningResources = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/learning_resources/`
      );
      setLearningResources(response.data);
    } catch (err) {
      console.error('Error fetching learning resources:', err);
    }
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { label: 'Great!', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 40) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Prepare difficulty performance chart data
  const getDifficultyChartData = () => {
    if (!results?.difficulty_stats) return null;

    const difficulties = Object.keys(results.difficulty_stats);
    const accuracies = difficulties.map(diff => results.difficulty_stats[diff].accuracy);

    return {
      labels: difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)),
      datasets: [
        {
          label: 'Accuracy (%)',
          data: accuracies,
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare accuracy pie chart
  const getAccuracyChartData = () => {
    if (!results) return null;

    return {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [results.correct_answers, results.total_questions - results.correct_answers],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // blue-600
            'rgba(239, 68, 68, 0.8)'    // red-600
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 3,
        },
      ],
    };
  };

  // Prepare skill performance radar chart
  const getSkillRadarData = () => {
    if (!results?.difficulty_stats) return null;

    const difficulties = ['easy', 'medium', 'hard'];
    const accuracies = difficulties
      .filter(diff => results.difficulty_stats[diff])
      .map(diff => results.difficulty_stats[diff]?.accuracy || 0);

    return {
      labels: difficulties
        .filter(diff => results.difficulty_stats[diff])
        .map(d => d.charAt(0).toUpperCase() + d.slice(1)),
      datasets: [
        {
          label: 'Performance',
          data: accuracies,
          backgroundColor: 'rgba(147, 51, 234, 0.2)', // purple with transparency
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(147, 51, 234, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/quiz/categories')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(results.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <FaTrophy className="text-5xl text-yellow-500 mr-3 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              Quiz Completed!
            </h1>
          </div>
          <p className="text-xl text-gray-300">{results.category_name}</p>
          <p className="text-sm text-gray-400 mt-2">Total Questions: 10</p>
        </motion.div>

        {/* Main Results Card with Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/60 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-8 border-t-4 border-blue-600"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className={`inline-block px-6 py-3 rounded-full ${performance.bg} ${performance.color} text-2xl font-bold mb-4 shadow-lg`}
            >
              {performance.label}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent mb-2"
            >
              {results.percentage.toFixed(1)}%
            </motion.div>
            <p className="text-xl text-gray-300">Overall Score</p>
            <div className="flex items-center justify-center mt-4 space-x-2">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i}
                  className={`text-2xl ${
                    i < Math.round((results.percentage / 100) * 5) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Stats Grid with Icons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-blue-800/50"
            >
              <FaTrophy className="text-3xl md:text-4xl text-blue-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">{results.total_score}</p>
              <p className="text-xs md:text-sm text-gray-300">Total Points</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-green-800/50"
            >
              <FaCheckCircle className="text-3xl md:text-4xl text-green-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">{results.correct_answers}</p>
              <p className="text-xs md:text-sm text-gray-300">Correct</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-red-800/50"
            >
              <FaTimesCircle className="text-3xl md:text-4xl text-red-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">
                {results.total_questions - results.correct_answers}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Incorrect</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-blue-800/50"
            >
              <FaClock className="text-3xl md:text-4xl text-blue-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatTime(results.time_taken || 0)}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Time Taken</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-red-800/50"
            >
              <FaFire className="text-3xl md:text-4xl text-red-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white">
                {results.accuracy ? Math.round(results.accuracy) : Math.round((results.correct_answers / results.total_questions) * 100)}%
              </p>
              <p className="text-xs md:text-sm text-gray-600">Accuracy</p>
            </motion.div>
          </div>

          {/* Performance Insights */}
          <div className="mt-8 pt-6 border-t-2 border-purple-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaBrain className="text-purple-600 mr-2" />
              Performance Insights
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaBolt className="text-yellow-500 mr-2" />
                  <span className="font-semibold text-gray-700">Speed</span>
                </div>
                <p className="text-sm text-gray-600">
                  Average: {Math.round((results.time_taken || 0) / results.total_questions)}s per question
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaAward className="text-blue-500 mr-2" />
                  <span className="font-semibold text-gray-700">Efficiency</span>
                </div>
                <p className="text-sm text-gray-600">
                  {results.percentage >= 80 ? 'Excellent efficiency!' : results.percentage >= 60 ? 'Good efficiency' : 'Room for improvement'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaStar className="text-purple-500 mr-2" />
                  <span className="font-semibold text-gray-700">Mastery</span>
                </div>
                <p className="text-sm text-gray-600">
                  {results.percentage >= 90 ? 'Expert level!' : results.percentage >= 75 ? 'Advanced' : results.percentage >= 60 ? 'Intermediate' : 'Beginner'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Charts Section with 3 Visualizations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Accuracy Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
              <FaCheckCircle className="text-green-600 mr-2" />
              Answer Distribution
            </h3>
            <div className="max-w-xs mx-auto">
              {getAccuracyChartData() && (
                <Pie
                  data={getAccuracyChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = results.total_questions;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Difficulty Bar Chart */}
          {results.difficulty_stats && Object.keys(results.difficulty_stats).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <FaChartBar className="text-blue-600 mr-2" />
                Difficulty Analysis
              </h3>
              {getDifficultyChartData() && (
                <Bar
                  data={getDifficultyChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          },
                          font: {
                            size: 11
                          }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: 11,
                            weight: 'bold'
                          }
                        },
                        grid: {
                          display: false
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Accuracy: ${context.parsed.y.toFixed(1)}%`;
                          }
                        }
                      }
                    },
                  }}
                />
              )}
            </div>
          )}

          {/* Skill Radar Chart */}
          {results.difficulty_stats && Object.keys(results.difficulty_stats).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <FaBrain className="text-purple-600 mr-2" />
                Skill Level Radar
              </h3>
              {getSkillRadarData() && (
                <Radar
                  data={getSkillRadarData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 25,
                          callback: function(value) {
                            return value + '%';
                          },
                          font: {
                            size: 10
                          }
                        },
                        pointLabels: {
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        },
                        grid: {
                          color: 'rgba(147, 51, 234, 0.1)'
                        },
                        angleLines: {
                          color: 'rgba(147, 51, 234, 0.2)'
                        }
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Performance: ${context.parsed.r.toFixed(1)}%`;
                          }
                        }
                      }
                    },
                  }}
                />
              )}
            </div>
          )}
        </motion.div>

        {/* Recommendations */}
        {results.recommendations && results.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              💡 Recommendations for Improvement
            </h3>
            <ul className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-center font-semibold mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enhanced Answer Review Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <button
            onClick={() => setShowAnswerReview(!showAnswerReview)}
            className="w-full flex items-center justify-between text-xl font-bold text-gray-800 hover:text-purple-600 transition group"
          >
            <span className="flex items-center">
              📝 <span className="ml-2">Detailed Answer Review</span>
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({results.question_review?.length || results.total_questions} questions)
              </span>
            </span>
            <span className={`text-2xl transform transition-transform ${showAnswerReview ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showAnswerReview && results.question_review && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-4"
            >
              {results.question_review.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-lg border-2 shadow-md hover:shadow-lg transition ${
                    item.is_correct
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-white'
                      : 'border-red-400 bg-gradient-to-br from-red-50 to-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3 ${
                          item.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {item.question_text}
                        </h4>
                      </div>
                      {item.difficulty && (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                          item.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                          item.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {item.difficulty.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {item.is_correct ? (
                      <FaCheckCircle className="text-green-600 text-2xl flex-shrink-0 ml-2" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-2xl flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="space-y-2 pl-11">
                    <div className={`p-3 rounded-lg ${
                      item.is_correct ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                      <p className="text-gray-800">{item.selected_answer}</p>
                    </div>
                    
                    {!item.is_correct && (
                      <div className="p-3 rounded-lg bg-green-100">
                        <p className="text-sm font-semibold text-green-800 mb-1">Correct Answer:</p>
                        <p className="text-green-900 font-medium">{item.correct_answer}</p>
                      </div>
                    )}

                    {item.explanation && (
                      <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center">
                          <FaBrain className="mr-2" />
                          Explanation:
                        </p>
                        <p className="text-gray-700 text-sm">{item.explanation}</p>
                      </div>
                    )}

                    {item.time_taken && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <FaClock className="mr-1" />
                        <span>Time taken: {item.time_taken}s</span>
                        {item.points && (
                          <span className="ml-4">
                            <FaTrophy className="inline mr-1 text-yellow-500" />
                            {item.is_correct ? `+${item.points}` : '0'} points
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Learning Module */}
        {learningResources && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8">
            <button
              onClick={() => setShowLearningModule(!showLearningModule)}
              className="w-full flex items-center justify-between text-xl font-bold text-gray-800 hover:text-purple-600 transition"
            >
              <span>📚 Learning Module - Improve Your Skills</span>
              <span className="text-2xl">{showLearningModule ? '▼' : '▶'}</span>
            </button>

            {showLearningModule && (
              <div className="mt-6 space-y-6">
                {/* Performance Summary */}
                {learningResources.performance_summary && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Weak Areas */}
                    {learningResources.performance_summary.weak_areas?.length > 0 && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 mb-3 flex items-center">
                          <FaTimesCircle className="mr-2" />
                          Areas Needing Improvement
                        </h4>
                        <ul className="space-y-2">
                          {learningResources.performance_summary.weak_areas.map((area, idx) => (
                            <li key={idx} className="text-red-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strong Areas */}
                    {learningResources.performance_summary.strong_areas?.length > 0 && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center">
                          <FaCheckCircle className="mr-2" />
                          Your Strong Points
                        </h4>
                        <ul className="space-y-2">
                          {learningResources.performance_summary.strong_areas.map((area, idx) => (
                            <li key={idx} className="text-green-700 flex items-start">
                              <span className="mr-2">✓</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Recommendations */}
                {learningResources.recommendations?.length > 0 && (
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      🎯 Personalized Learning Recommendations
                    </h4>
                    <div className="space-y-4">
                      {learningResources.recommendations.map((rec, idx) => (
                        <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                          <h5 className="font-bold text-purple-800 mb-2">{rec.topic}</h5>
                          <div className="space-y-2">
                            {rec.resources?.map((resource, resIdx) => (
                              <div key={resIdx} className="text-sm">
                                <span className="font-semibold text-gray-700">{resource.type}:</span>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 ml-2 underline"
                                >
                                  {resource.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {learningResources.next_steps?.length > 0 && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                      🚀 Your Learning Path Forward
                    </h4>
                    <ol className="space-y-2">
                      {learningResources.next_steps.map((step, idx) => (
                        <li key={idx} className="text-purple-700 flex items-start">
                          <span className="font-bold mr-2 flex-shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Motivational Message */}
                <div className="text-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
                  <p className="text-gray-700 italic">
                    "Continuous learning is the key to success. Focus on your weak areas, 
                    leverage your strengths, and follow the learning path to excel!"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/quiz/categories')}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            <FaRedo className="mr-2" />
            Take Another Quiz
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/quiz/profile')}
            className="flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-purple-600"
          >
            <FaChartBar className="mr-2" />
            View Skill Profile
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-semibold rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            <FaHome className="mr-2" />
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResults;
