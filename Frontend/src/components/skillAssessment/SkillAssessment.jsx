import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  CodeBracketIcon,
  LightBulbIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const SkillAssessment = ({ userId }) => {
  const [categories, setCategories] = useState([]);
  const [skillSets, setSkillSets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [view, setView] = useState('categories'); // categories, assessment, results, badges, gaps
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAssessmentHistory();
    fetchBadges();
  }, [userId]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSkillSets(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (timeRemaining > 0 && view === 'assessment') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && view === 'assessment' && currentQuestion) {
      handleSubmitAnswer();
    }
  }, [timeRemaining, view]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/skill-categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSkillSets = async (categoryId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/skill-sets/?category=${categoryId}`);
      const data = await response.json();
      setSkillSets(data);
    } catch (error) {
      console.error('Error fetching skill sets:', error);
    }
  };

  const fetchAssessmentHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/skill-assessments/?user_id=${userId}`);
      const data = await response.json();
      setAssessmentHistory(data);
    } catch (error) {
      console.error('Error fetching assessment history:', error);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/skill-badges/?user_id=${userId}`);
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const startAssessment = async (skillSetId) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/skill-assessments/start_assessment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_set_id: skillSetId, user_id: userId })
      });
      const data = await response.json();
      setActiveAssessment(data);
      fetchNextQuestion(data.id);
      setView('assessment');
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async (assessmentId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/skill-assessments/${assessmentId}/get_question/`);
      const data = await response.json();
      if (data.question) {
        setCurrentQuestion(data.question);
        setTimeRemaining(data.question.time_limit);
        setSelectedAnswer('');
      } else {
        completeAssessment(assessmentId);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeAssessment || !currentQuestion) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/skill-assessments/${activeAssessment.id}/submit_answer/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: currentQuestion.id,
            answer: selectedAnswer,
            time_taken: currentQuestion.time_limit - timeRemaining
          })
        }
      );
      const data = await response.json();
      
      setTimeout(() => {
        fetchNextQuestion(activeAssessment.id);
      }, 1500);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeAssessment = async (assessmentId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/skill-assessments/${assessmentId}/complete_assessment/`,
        { method: 'POST' }
      );
      const data = await response.json();
      setActiveAssessment(data);
      setView('results');
      fetchAssessmentHistory();
      fetchBadges();
      
      // Fetch skill gaps
      const gapsResponse = await fetch(`http://127.0.0.1:8000/api/skill-gaps/?user_id=${userId}`);
      const gapsData = await gapsResponse.json();
      setSkillGaps(gapsData);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const CategoryCard = ({ category }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedCategory(category)}
      className="bg-gray-900 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-blue-600 transition-colors"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{category.icon || '📚'}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          <p className="text-sm text-gray-400">{category.skill_sets_count || 0} assessments</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">{category.description}</p>
    </motion.div>
  );

  const SkillSetCard = ({ skillSet }) => {
    const userAttempt = assessmentHistory.find(a => a.skill_set_id === skillSet.id);
    const hasPassed = userAttempt && userAttempt.percentage_score >= skillSet.passing_score;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{skillSet.name}</h3>
            <p className="text-sm text-gray-400">{skillSet.description}</p>
          </div>
          {hasPassed && (
            <CheckBadgeIcon className="w-6 h-6 text-green-400" />
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            {skillSet.estimated_time} min
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            skillSet.difficulty_level === 'beginner' ? 'bg-green-900 text-green-400 border border-green-700' :
            skillSet.difficulty_level === 'intermediate' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
            skillSet.difficulty_level === 'advanced' ? 'bg-orange-900 text-orange-400 border border-orange-700' :
            'bg-red-900 text-red-400 border border-red-700'
          }`}>
            {skillSet.difficulty_level}
          </div>
        </div>

        {userAttempt && (
          <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Best Score:</span>
              <span className={`font-medium ${
                userAttempt.percentage_score >= skillSet.passing_score ? 'text-green-400' : 'text-red-400'
              }`}>
                {userAttempt.percentage_score}%
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => startAssessment(skillSet.id)}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          {userAttempt ? 'Retake Assessment' : 'Start Assessment'}
        </button>
      </motion.div>
    );
  };

  const AssessmentView = () => {
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
        {/* Assessment Header */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Question {activeAssessment?.current_question_number || 1}
              </span>
              <div className={`px-3 py-1 rounded text-xs font-medium ${
                currentQuestion.question_type === 'mcq' ? 'bg-blue-900 text-blue-400 border border-blue-700' :
                currentQuestion.question_type === 'coding' ? 'bg-purple-900 text-purple-400 border border-purple-700' :
                'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {currentQuestion.question_type.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <ClockIcon className="w-5 h-5" />
              <span className="font-medium">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-6">{currentQuestion.question_text}</h3>

          {currentQuestion.code_snippet && (
            <div className="bg-black border border-gray-700 rounded p-4 mb-6">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{currentQuestion.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* MCQ Options */}
          {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => (
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
                  {option.option_text}
                </motion.button>
              ))}
            </div>
          )}

          {/* Coding Answer */}
          {currentQuestion.question_type === 'coding' && (
            <div className="mb-6">
              <textarea
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="w-full p-4 bg-black border border-gray-700 rounded text-white font-mono text-sm"
                rows="10"
                placeholder="Write your code here..."
              />
            </div>
          )}

          {/* True/False */}
          {currentQuestion.question_type === 'true-false' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedAnswer('true')}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedAnswer === 'true'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-600'
                }`}
              >
                True
              </button>
              <button
                onClick={() => setSelectedAnswer('false')}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedAnswer === 'false'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-600'
                }`}
              >
                False
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
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
        </div>
      </div>
    );
  };

  const ResultsView = () => {
    if (!activeAssessment) return null;

    const passed = activeAssessment.percentage_score >= activeAssessment.passing_score;

    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border rounded-lg p-6 text-center mb-6 ${
            passed ? 'bg-gray-900 border-green-600' : 'bg-gray-900 border-red-600'
          }`}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {passed ? (
              <CheckBadgeIcon className="w-10 h-10 text-white" />
            ) : (
              <TrophyIcon className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">
            {passed ? 'Congratulations!' : 'Assessment Complete'}
          </h2>
          <p className="text-gray-400 mb-6">
            {passed
              ? 'You passed the assessment and earned a badge!'
              : 'Keep practicing to improve your score'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className={`text-3xl font-semibold mb-1 ${
                passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {activeAssessment.percentage_score}%
              </div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl font-semibold text-blue-400 mb-1">
                {activeAssessment.correct_answers}/{activeAssessment.total_questions}
              </div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl font-semibold text-yellow-400 mb-1">
                {Math.floor(activeAssessment.time_taken / 60)}m
              </div>
              <div className="text-sm text-gray-400">Time</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setView('categories');
                setActiveAssessment(null);
                setSelectedCategory(null);
              }}
              className="px-5 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Back to Assessments
            </button>
            {!passed && (
              <button
                onClick={() => startAssessment(activeAssessment.skill_set_id)}
                className="px-5 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Areas to Improve</h3>
            <div className="space-y-3">
              {skillGaps.slice(0, 3).map((gap, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded">
                  <FireIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">{gap.skill_name}</h4>
                    <p className="text-sm text-gray-400 mt-1">{gap.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const BadgesView = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">Your Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center"
          >
            <div className="w-16 h-16 bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-yellow-600">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <h4 className="font-medium text-white mb-1">{badge.skill_name}</h4>
            <p className="text-xs text-gray-400">
              {new Date(badge.earned_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
      {badges.length === 0 && (
        <div className="text-center py-12">
          <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No badges earned yet. Start taking assessments!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
            Skill Assessments
          </h1>
          <p className="text-gray-400">Test your skills and earn professional badges</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setView('categories')}
            className={`px-5 py-2 rounded font-medium transition-colors ${
              view === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setView('badges')}
            className={`px-5 py-2 rounded font-medium transition-colors flex items-center space-x-2 ${
              view === 'badges'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            <TrophyIcon className="w-5 h-5" />
            <span>Badges ({badges.length})</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'categories' && !selectedCategory && (
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

          {view === 'categories' && selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className="mb-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Categories
              </button>
              <h2 className="text-2xl font-semibold text-white mb-6">{selectedCategory.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillSets.map((skillSet) => (
                  <SkillSetCard key={skillSet.id} skillSet={skillSet} />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'assessment' && <AssessmentView />}
          {view === 'results' && <ResultsView />}
          {view === 'badges' && <BadgesView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkillAssessment;
