import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AdaptiveQuiz = ({ userId, onComplete }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const experienceLevels = [
    { value: 'student', label: 'Student', description: 'Currently studying or new to the field' },
    { value: 'junior', label: 'Junior (0-2 years)', description: 'Some experience or entry-level position' },
    { value: 'mid', label: 'Mid-level (2-5 years)', description: 'Solid experience in the field' },
    { value: 'senior', label: 'Senior (5+ years)', description: 'Extensive experience and expertise' }
  ];

  const startAdaptiveQuiz = async () => {
    if (!experienceLevel) {
      alert('Please select your experience level');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/adaptive-quiz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          experience_level: experienceLevel
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentSession(data.session);
        setCurrentQuestion(data.session.current_question);
        setQuizStarted(true);
        setProgress(0);
      } else {
        console.error('Failed to start quiz:', data.error);
        alert('Failed to start adaptive quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!response) {
      alert('Please provide a response');
      return;
    }

    setLoading(true);
    try {
      const submitResponse = await fetch('http://localhost:8000/api/adaptive-quiz/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: currentSession.session_id,
          response: response
        })
      });

      const data = await submitResponse.json();
      if (submitResponse.ok) {
        // Add current question to history
        setQuestionHistory(prev => [...prev, {
          question: currentQuestion,
          response: response
        }]);

        // Update progress
        const newProgress = ((data.session.question_count || 0) / (data.session.max_questions || 15)) * 100;
        setProgress(newProgress);

        if (data.completed) {
          // Quiz completed
          setAnalytics(data.session);
          if (onComplete) {
            onComplete(data.session);
          }
        } else {
          // Continue with next question
          setCurrentSession(data.session);
          setCurrentQuestion(data.session.current_question);
          setResponse('');
        }
      } else {
        console.error('Failed to submit response:', data.error);
        alert('Failed to submit response. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Low (1)</span>
              <span>High ({currentQuestion.scale?.[1] || 10})</span>
            </div>
            <input
              type="range"
              min={currentQuestion.scale?.[0] || 1}
              max={currentQuestion.scale?.[1] || 10}
              value={response || (currentQuestion.scale?.[0] || 1)}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{response || (currentQuestion.scale?.[0] || 1)}</span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setResponse(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                  response === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    response === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {response === option && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setResponse(true)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-300 ${
                response === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
              Yes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setResponse(false)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-300 ${
                response === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="w-6 h-6 mx-auto mb-2 rounded-full border-2 border-current"></div>
              No
            </motion.button>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Enter your response..."
          />
        );
    }
  };

  const CompletionScreen = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
        <p className="text-gray-600">
          Your adaptive quiz has been completed successfully.
        </p>
      </div>

      {analytics && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Quiz Analytics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Questions Asked:</span>
              <div className="font-semibold">{analytics.question_count || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">Efficiency Score:</span>
              <div className="font-semibold">
                {analytics.efficiency_score ? `${(analytics.efficiency_score * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Final Ability:</span>
              <div className="font-semibold">
                {analytics.final_ability ? analytics.final_ability.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Experience Level:</span>
              <div className="font-semibold capitalize">{experienceLevel}</div>
            </div>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Take Another Quiz
      </motion.button>
    </motion.div>
  );

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎯 Adaptive Career Quiz
          </h1>
          <p className="text-gray-600">
            This intelligent quiz adapts to your responses, asking fewer but more relevant questions 
            based on your experience level and answers.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Your Experience Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceLevels.map((level) => (
                <motion.button
                  key={level.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                    experienceLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{level.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{level.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Questions adapt based on your previous answers</li>
              <li>• Fewer questions needed compared to traditional quizzes</li>
              <li>• More accurate predictions through intelligent questioning</li>
              <li>• Experience-level specific question branching</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAdaptiveQuiz}
            disabled={!experienceLevel || loading}
            className={`w-full py-4 rounded-lg font-medium transition-all duration-300 ${
              experienceLevel && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Starting Quiz...' : 'Start Adaptive Quiz'}
          </motion.button>
        </div>
      </div>
    );
  }

  if (analytics) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <CompletionScreen />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Question {(currentSession?.question_count || 0) + 1}
              </span>
              {currentQuestion?.category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {currentQuestion.category.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion?.text}
            </h2>
          </div>

          {renderQuestionInput()}

          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setResponse('')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Response
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitResponse}
              disabled={!response || loading}
              className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                response && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{loading ? 'Processing...' : 'Next Question'}</span>
              {!loading && <ChevronRightIcon className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question History */}
      {questionHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Previous Questions</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {questionHistory.map((item, index) => (
              <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-700 mb-1">
                  Q{index + 1}: {item.question.text}
                </div>
                <div className="text-gray-600">
                  Your answer: {typeof item.response === 'boolean' ? (item.response ? 'Yes' : 'No') : item.response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveQuiz;
