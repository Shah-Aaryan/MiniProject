import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaTrophy, FaLightbulb, FaSpinner, FaCheckCircle, FaBrain, FaFire, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestionsRequired] = useState(10); // Fixed: exactly 10 questions per quiz

  useEffect(() => {
    if (quizId) {
      checkQuizStatusAndFetch();
    }
  }, [quizId]);

  const checkQuizStatusAndFetch = async () => {
    try {
      // First check if quiz is already completed
      const quizResponse = await axios.get(`${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/`);
      if (quizResponse.data.is_completed) {
        // Quiz already completed, redirect to results
        navigate(`/quiz/results/${quizId}`, { replace: true });
        return;
      }
      // Quiz not completed, fetch next question
      await fetchNextQuestion();
    } catch (err) {
      console.error('Error checking quiz status:', err);
      // Check if quiz doesn't exist (404 error)
      if (err.response && err.response.status === 404) {
        setError('Quiz not found. It may have been deleted.');
        setTimeout(() => {
          navigate('/quiz/categories', { replace: true });
        }, 2000);
      } else {
        setError('Failed to load quiz. Please try again.');
      }
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details first to update progress
      const quizResponse = await axios.get(`${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/`);
      setQuiz(quizResponse.data);
      setQuestionsAnswered(quizResponse.data.total_questions || 0);
      
      const response = await axios.get(
        `${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/get_question/`
      );
      
      if (response.data.quiz_complete || response.data.message) {
        // Quiz is complete, navigate to results
        await completeQuiz();
      } else if (response.data.id) {
        setCurrentQuestion(response.data);
        setTimeLeft(response.data.time_limit);
        setSelectedAnswer(null);
        setError(null);
      } else {
        // Unexpected response, complete quiz
        await completeQuiz();
      }
    } catch (err) {
      // Check if quiz is already completed (400 error)
      if (err.response && err.response.status === 400) {
        const errorMsg = err.response.data?.error || '';
        if (errorMsg.includes('already completed')) {
          // Quiz is already completed, go to results
          navigate(`/quiz/results/${quizId}`);
          return;
        }
      }
      setError('Failed to load question. Please try again.');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!selectedAnswer) {
      setSelectedAnswer(currentQuestion?.options[0]?.id); // Select first option by default
    }
    await submitAnswer(selectedAnswer || currentQuestion?.options[0]?.id);
  };

  const submitAnswer = async (answerId) => {
    try {
      setSubmitting(true);
      // Calculate time taken, ensuring it's never negative
      let timeTaken;
      if (timeLeft !== null && timeLeft >= 0) {
        timeTaken = currentQuestion.time_limit - timeLeft;
      } else {
        // Timer expired or not started, use full time limit
        timeTaken = currentQuestion.time_limit;
      }
      // Ensure time_taken is positive
      timeTaken = Math.max(0, Math.min(timeTaken, currentQuestion.time_limit));
      
      const response = await axios.post(
        `${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/submit_answer/`,
        {
          question_id: currentQuestion.id,
          selected_option_id: answerId,
          time_taken: timeTaken
        }
      );
      
      // Update progress from response
      if (response.data && response.data.quiz) {
        setQuestionsAnswered(response.data.quiz.total_questions || 0);
      }
      
      // Fetch next question
      await fetchNextQuestion();
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const completeQuiz = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/adaptive-quiz/quizzes/${quizId}/complete/`
      );
      navigate(`/quiz/results/${quizId}`);
    } catch (err) {
      console.error('Error completing quiz:', err);
      navigate(`/quiz/results/${quizId}`);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      submitAnswer(selectedAnswer);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (questionsAnswered / 20) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-md w-full border border-red-900/50">
          <div className="text-red-400 text-center mb-4">
            <p className="text-xl font-semibold">{error}</p>
          </div>
          <button
            onClick={() => navigate('/quiz/categories')}
            className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-red-700 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Quiz Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border-t-4 border-blue-600"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-red-900 rounded-lg flex items-center justify-center mr-3">
                <FaBrain className="text-2xl text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                  {quiz?.category_name || 'Quiz'}
                </h2>
                <p className="text-gray-300 font-semibold">
                  Question {questionsAnswered + 1} of {totalQuestionsRequired}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {/* Enhanced Timer */}
              <motion.div 
                animate={{ scale: timeLeft < 10 ? [1, 1.05, 1] : 1 }}
                transition={{ repeat: timeLeft < 10 ? Infinity : 0, duration: 1 }}
                className={`flex items-center ${
                  timeLeft < 10 ? 'bg-red-900/50' : 'bg-blue-900/50'
                } px-4 py-2 rounded-lg shadow-md border ${
                  timeLeft < 10 ? 'border-red-600' : 'border-blue-600'
                }`}
              >
                <FaClock className={`${timeLeft < 10 ? 'text-red-400' : 'text-blue-400'} mr-2`} />
                <span className={`font-bold text-lg ${timeLeft < 10 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </motion.div>

              {/* Enhanced Score */}
              <div className="flex items-center bg-gradient-to-r from-red-900/50 to-red-800/50 px-4 py-2 rounded-lg shadow-md border border-red-600">
                <FaTrophy className="text-red-400 mr-2" />
                <span className="font-bold text-lg text-red-300">
                  {quiz?.total_score || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-300">Progress</span>
              <div className="flex items-center">
                <FaFire className="text-red-400 mr-2" />
                <span className="text-sm font-semibold text-gray-300">
                  {questionsAnswered} answered
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 shadow-inner border border-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-red-600 h-4 rounded-full flex items-center justify-end pr-2"
              >
                {getProgressPercentage() > 15 && (
                  <span className="text-xs text-white font-bold">
                    {Math.round(getProgressPercentage())}%
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion?.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-8 mb-6 border border-red-900/30"
          >
            {/* Enhanced Difficulty Indicator */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full flex items-center ${
                  currentQuestion?.difficulty === 'easy' ? 'bg-green-100' :
                  currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <FaLightbulb className={`mr-2 ${
                    currentQuestion?.difficulty === 'easy' ? 'text-green-600' :
                    currentQuestion?.difficulty === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <span className={`text-sm font-semibold capitalize ${
                    currentQuestion?.difficulty === 'easy' ? 'text-green-700' :
                    currentQuestion?.difficulty === 'medium' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {currentQuestion?.difficulty || 'Medium'}
                  </span>
                </div>
                {currentQuestion?.skill_tags && currentQuestion.skill_tags.length > 0 && (
                  <div className="flex gap-2">
                    {currentQuestion.skill_tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-semibold border border-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center bg-gradient-to-r from-red-900/50 to-blue-900/50 px-3 py-1 rounded-full border border-red-700">
                <FaStar className="text-red-400 mr-1" />
                <span className="text-sm text-red-300 font-bold">
                  {currentQuestion?.points || 10} Points
                </span>
              </div>
            </div>

            {/* Enhanced Question Text */}
            <div className="bg-gradient-to-br from-blue-900/20 to-red-900/20 p-6 rounded-lg mb-8 border-l-4 border-blue-600">
              <h3 className="text-2xl font-semibold text-white">
                {currentQuestion?.question_text}
              </h3>
            </div>

            {/* Enhanced Answer Options */}
            <div className="space-y-4">
              {currentQuestion?.options?.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAnswer(option.id)}
                  disabled={submitting}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedAnswer === option.id
                      ? 'border-blue-600 bg-gradient-to-r from-blue-900/50 to-red-900/50 shadow-lg'
                      : 'border-gray-700 bg-gray-800/50 hover:border-blue-500 hover:shadow-md'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswer === option.id
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-600'
                      }`}
                    >
                      {selectedAnswer === option.id && (
                        <FaCheckCircle className="text-white" />
                      )}
                    </div>
                    <span className={`text-lg ${
                      selectedAnswer === option.id ? 'text-white font-semibold' : 'text-gray-300'
                    }`}>
                      {option.option_text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (window.confirm('Are you sure you want to quit this quiz?')) {
                completeQuiz();
              }
            }}
            className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition font-semibold shadow-md border border-gray-700"
          >
            Quit Quiz
          </motion.button>

          <motion.button
            whileHover={selectedAnswer && !submitting ? { scale: 1.05 } : {}}
            whileTap={selectedAnswer && !submitting ? { scale: 0.95 } : {}}
            onClick={handleNextQuestion}
            disabled={!selectedAnswer || submitting}
            className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
              selectedAnswer && !submitting
                ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700 hover:shadow-xl'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                Next Question
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizTaking;
