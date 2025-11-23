import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaTrophy, FaLightbulb, FaSpinner, FaCheckCircle } from 'react-icons/fa';

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
  const [totalQuestionsRequired, setTotalQuestionsRequired] = useState(20);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <p className="text-xl font-semibold">{error}</p>
          </div>
          <button
            onClick={() => navigate('/quiz/categories')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {quiz?.category_name || 'Quiz'}
              </h2>
              <p className="text-gray-600">
                Question {questionsAnswered + 1} of 20
              </p>
            </div>

            <div className="flex gap-6">
              {/* Timer */}
              <div className="flex items-center bg-blue-100 px-4 py-2 rounded-lg">
                <FaClock className="text-blue-600 mr-2" />
                <span className={`font-semibold ${timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-lg">
                <FaTrophy className="text-green-600 mr-2" />
                <span className="font-semibold text-green-600">
                  {quiz?.total_score || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-right">
              {Math.round(getProgressPercentage())}% Complete
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Difficulty Indicator */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <FaLightbulb className="text-yellow-500 mr-2" />
              <span className="text-sm text-gray-600 capitalize">
                {currentQuestion?.difficulty || 'Medium'} Difficulty
              </span>
            </div>
            <span className="text-sm text-purple-600 font-semibold">
              {currentQuestion?.points || 10} Points
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            {currentQuestion?.question_text}
          </h3>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion?.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedAnswer(option.id)}
                disabled={submitting}
                className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option.id
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedAnswer === option.id
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswer === option.id && (
                      <FaCheckCircle className="text-white text-sm" />
                    )}
                  </div>
                  <span className="text-lg text-gray-700">{option.option_text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to quit this quiz?')) {
                completeQuiz();
              }
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Quit Quiz
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer || submitting}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedAnswer && !submitting
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              'Next Question →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
