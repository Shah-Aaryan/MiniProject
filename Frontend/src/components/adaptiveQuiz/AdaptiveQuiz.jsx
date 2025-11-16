import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const AdaptiveQuiz = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [skillProfile, setSkillProfile] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('categories'); // categories, quiz, results, history

  useEffect(() => {
    fetchCategories();
    fetchQuizHistory();
    fetchSkillProfile();
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && view === 'quiz') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && view === 'quiz') {
      handleSubmitAnswer();
    }
  }, [timeRemaining, view]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/adaptive-quiz/categories/');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      // Handle paginated response from DRF
      const categoriesData = data.results || data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchQuizHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/adaptive-quiz/quizzes/`);
      const data = await response.json();
      setQuizHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      setQuizHistory([]);
    }
  };

  const fetchSkillProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/adaptive-quiz/skill-profiles/`);
      const data = await response.json();
      setSkillProfile(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching skill profile:', error);
      setSkillProfile(null);
    }
  };

  const startQuiz = async (categoryId) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/adaptive-quiz/quizzes/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }
      
      const data = await response.json();
      setActiveQuiz(data.quiz || data);
      
      // If question is provided in response, set it
      if (data.question) {
        setCurrentQuestion(data.question);
        setTimeRemaining(data.question.time_limit || 60);
        setSelectedAnswer(null);
        setView('quiz');
      } else if (data.quiz && data.quiz.id) {
        // Otherwise fetch first question
        fetchNextQuestion(data.quiz.id);
        setView('quiz');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async (quizId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/adaptive-quiz/quizzes/${quizId}/get_question/`);
      const data = await response.json();
      
      if (data.quiz_complete || !data.id) {
        completeQuiz(quizId);
      } else {
        setCurrentQuestion(data);
        setTimeRemaining(data.time_limit || 60);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer && timeRemaining > 0) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/adaptive-quiz/quizzes/${activeQuiz.id}/submit_answer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          selected_option_id: selectedAnswer || currentQuestion.options[0].id,
          time_taken: (currentQuestion.time_limit || 60) - timeRemaining
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (data.error && data.error.includes('already completed')) {
          // Quiz is already completed, show results
          completeQuiz(activeQuiz.id);
          return;
        }
        console.error('Server error:', data);
        // Still try to continue
        fetchNextQuestion(activeQuiz.id);
        return;
      }
      
      // Show feedback briefly
      setTimeout(() => {
        fetchNextQuestion(activeQuiz.id);
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Continue anyway
      fetchNextQuestion(activeQuiz.id);
    } finally {
      setLoading(false);
    }
  };

  const completeQuiz = async (quizId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/adaptive-quiz/quizzes/${quizId}/complete/`, {
        method: 'POST'
      });
      const data = await response.json();
      setActiveQuiz(data.quiz || data);
      setView('results');
      fetchQuizHistory();
      fetchSkillProfile();
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Still show results view
      setView('results');
    }
  };

  const CategoryCard = ({ category }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setSelectedCategory(category);
        startQuiz(category.id);
      }}
      className="bg-gray-900 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-blue-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
          <p className="text-sm text-gray-400">{category.description}</p>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(category.difficulty_level)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{category.question_count || 0} questions</span>
        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Start Quiz
        </button>
      </div>
    </motion.div>
  );

  const QuizView = () => {
    if (!currentQuestion) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading question...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Question {activeQuiz?.current_question_number || 1} of {activeQuiz?.total_questions || '?'}
              </div>
              <div className={`px-3 py-1 rounded text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-900 text-green-400 border border-green-700' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
                currentQuestion.difficulty === 'hard' ? 'bg-orange-900 text-orange-400 border border-orange-700' :
                'bg-red-900 text-red-400 border border-red-700'
              }`}>
                {currentQuestion.difficulty}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <ClockIcon className="w-5 h-5" />
              <span className="font-medium">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((activeQuiz?.current_question_number || 1) / (activeQuiz?.total_questions || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">{currentQuestion.question_text}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedAnswer(option.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAnswer === option.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-600'
                }`}
              >
                <div className="flex items-center">
                  <span className="font-medium">{option.option_text}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <LightBulbIcon className="w-5 h-5" />
              <span>{currentQuestion.points} points</span>
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || loading}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                selectedAnswer && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const ResultsView = () => {
    if (!activeQuiz) return null;

    const accuracy = activeQuiz.total_questions > 0 
      ? ((activeQuiz.correct_answers / activeQuiz.total_questions) * 100).toFixed(1)
      : 0;

    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-blue-600 rounded-lg p-6 text-center mb-6"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrophyIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">Quiz Completed!</h2>
          <p className="text-gray-400 mb-6">Great job on completing the {selectedCategory?.name} quiz</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl font-semibold text-blue-400 mb-1">{activeQuiz.total_score}</div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl font-semibold text-green-400 mb-1">{accuracy}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl font-semibold text-yellow-400 mb-1">{Math.floor(activeQuiz.time_taken / 60)}m</div>
              <div className="text-sm text-gray-400">Time Taken</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setView('categories');
                setActiveQuiz(null);
                setCurrentQuestion(null);
              }}
              className="px-5 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Back to Categories
            </button>
            <button
              onClick={() => setView('history')}
              className="px-5 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              View History
            </button>
          </div>
        </motion.div>

        {/* Performance Breakdown */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Correct Answers</span>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">{activeQuiz.correct_answers}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Incorrect Answers</span>
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">{activeQuiz.total_questions - activeQuiz.correct_answers}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Difficulty</span>
              <span className="text-white font-medium capitalize">{activeQuiz.current_difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">Quiz History</h2>
      <div className="space-y-4">
        {quizHistory.map((quiz) => (
          <div key={quiz.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{quiz.category_name}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(quiz.started_at).toLocaleDateString()} • {quiz.total_questions} questions
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-blue-400 mb-1">{quiz.total_score}</div>
                <div className="text-sm text-gray-400">
                  {((quiz.correct_answers / quiz.total_questions) * 100).toFixed(0)}% accuracy
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkillProfileView = () => {
    if (!skillProfile) return null;

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-400" />
          Your Skill Profile
        </h3>
        <div className="space-y-3">
          {Object.entries(skillProfile.skills || {}).map(([skill, level]) => (
            <div key={skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{skill}</span>
                <span className="text-blue-400 font-medium">{level}/10</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(level / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2 flex items-center">
            <AcademicCapIcon className="w-8 h-8 mr-3 text-blue-400" />
            Adaptive Quiz System
          </h1>
          <p className="text-gray-400">Test your knowledge with smart quizzes that adapt to your skill level</p>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setView('categories')}
            className={`px-5 py-2 rounded font-medium transition-colors ${
              view === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-5 py-2 rounded font-medium transition-colors ${
              view === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Skill Profile */}
        {view === 'categories' && skillProfile && <SkillProfileView />}

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'categories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'quiz' && <QuizView />}
          {view === 'results' && <ResultsView />}
          {view === 'history' && <HistoryView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdaptiveQuiz;
