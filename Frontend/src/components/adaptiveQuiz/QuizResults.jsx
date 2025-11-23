import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaHome, FaChartBar, FaSpinner } from 'react-icons/fa';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
          borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
          borderWidth: 2,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-xl text-gray-600">{results.category_name}</p>
        </div>

        {/* Main Results Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-3 rounded-full ${performance.bg} ${performance.color} text-2xl font-bold mb-4`}>
              {performance.label}
            </div>
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {results.percentage.toFixed(1)}%
            </div>
            <p className="text-xl text-gray-600">Overall Score</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 md:p-6 rounded-xl text-center shadow-md hover:shadow-lg transition">
              <FaTrophy className="text-3xl md:text-4xl text-purple-600 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{results.total_score}</p>
              <p className="text-xs md:text-sm text-gray-600">Total Points</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 md:p-6 rounded-xl text-center shadow-md hover:shadow-lg transition">
              <FaCheckCircle className="text-3xl md:text-4xl text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{results.correct_answers}</p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-50 p-6 rounded-xl text-center">
              <FaTimesCircle className="text-4xl text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">
                {results.total_questions - results.correct_answers}
              </p>
              <p className="text-sm text-gray-600">Incorrect Answers</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl text-center">
              <FaClock className="text-4xl text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">
                {formatTime(results.time_taken || 0)}
              </p>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Answer Accuracy
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
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Difficulty Performance Chart */}
          {results.difficulty_stats && Object.keys(results.difficulty_stats).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Performance by Difficulty
              </h3>
              {getDifficultyChartData() && (
                <Bar
                  data={getDifficultyChartData()}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              )}
            </div>
          )}
        </div>

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

        {/* Answer Review Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <button
            onClick={() => setShowAnswerReview(!showAnswerReview)}
            className="w-full flex items-center justify-between text-xl font-bold text-gray-800 hover:text-purple-600 transition"
          >
            <span>📝 Review Answers</span>
            <span className="text-2xl">{showAnswerReview ? '▼' : '▶'}</span>
          </button>

          {showAnswerReview && results.question_review && (
            <div className="mt-6 space-y-4">
              {results.question_review.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    item.is_correct
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex-1">
                      {index + 1}. {item.question_text}
                    </h4>
                    {item.is_correct ? (
                      <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 ml-2" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Your Answer:</span> {item.selected_answer}
                  </p>
                  {!item.is_correct && (
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Correct Answer:</span> {item.correct_answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/quiz/categories')}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FaRedo className="mr-2" />
            Take Another Quiz
          </button>

          <button
            onClick={() => navigate('/quiz/profile')}
            className="flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300 shadow-lg border-2 border-purple-600"
          >
            <FaChartBar className="mr-2" />
            View Skill Profile
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-lg"
          >
            <FaHome className="mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
