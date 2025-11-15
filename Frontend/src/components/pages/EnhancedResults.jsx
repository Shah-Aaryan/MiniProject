import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ExplainableAI from '../explainableAI/ExplainableAI';
import LearningPath from '../learningPath/LearningPath';
import { styles } from '../../styles';
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  LightBulbIcon,
  ArrowPathIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const EnhancedResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('results');
  const [predictionData, setPredictionData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [savedToProfile, setSavedToProfile] = useState(false);

  useEffect(() => {
    // Get prediction data from navigation state or localStorage
    const data = location.state?.predictionData || 
                 JSON.parse(localStorage.getItem('latestPrediction') || 'null');
    
    if (data) {
      setPredictionData(data);
      // Save to localStorage for persistence
      localStorage.setItem('latestPrediction', JSON.stringify(data));
    } else {
      // Redirect to quiz if no data
      navigate('/quiz');
    }

    // Get user ID from localStorage or context
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, [location, navigate]);

  const saveToProfile = async () => {
    if (!userId || !predictionData) return;

    try {
      // Create or update user profile with prediction results
      const response = await fetch('http://localhost:8000/api/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skills: extractSkillsFromPrediction(predictionData),
          preferences: {
            predicted_role: predictionData.prediction,
            confidence: predictionData.confidence_percentage,
            last_prediction_date: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        setSavedToProfile(true);
        // Show success message
        setTimeout(() => setSavedToProfile(false), 3000);
      }
    } catch (error) {
      console.error('Error saving to profile:', error);
    }
  };

  const extractSkillsFromPrediction = (data) => {
    // Extract skills from feature importance data
    const skills = {};
    if (data.explainable_ai?.feature_importance?.feature_importance) {
      Object.entries(data.explainable_ai.feature_importance.feature_importance).forEach(([skill, info]) => {
        skills[skill] = info.user_value || 0;
      });
    }
    return skills;
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Career Prediction Results',
          text: `I got ${predictionData?.prediction} with ${predictionData?.confidence_percentage}% confidence!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `My Career Prediction: ${predictionData?.prediction} (${predictionData?.confidence_percentage}% confidence)`;
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  const retakeQuiz = () => {
    localStorage.removeItem('latestPrediction');
    navigate('/quiz');
  };

  if (!predictionData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your results...</p>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg' 
          : 'bg-transparent text-white hover:bg-gray-900 border border-white/20 hover:border-white/40'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </motion.button>
  );

  const ResultsSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <div className="bg-gradient-to-r from-red-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">🎯</span>
          </motion.div>
          
          <h1 className="text-2xl font-semibold mb-2 text-white">Your Predicted Career Path</h1>
          <h2 className="text-5xl font-bold mb-6 text-white">
            {predictionData.prediction}
          </h2>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="text-4xl font-bold text-white">{predictionData.confidence_percentage}%</div>
            <div className="text-xl text-white/90">Confidence</div>
          </div>
          
          <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-4 mb-6">
            <motion.div 
              className="bg-white h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${predictionData.confidence_percentage}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            ></motion.div>
          </div>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Based on your responses, this career path aligns well with your skills and interests.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveToProfile}
          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
            savedToProfile 
              ? 'border-green-500 bg-green-500/20 text-green-400' 
              : 'border-white/20 bg-transparent text-white hover:bg-indigo-600 hover:border-indigo-600'
          }`}
        >
          <BookmarkIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">
            {savedToProfile ? 'Saved!' : 'Save to Profile'}
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareResults}
          className="p-4 rounded-lg border-2 border-white/20 bg-transparent text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
        >
          <ShareIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Share Results</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={retakeQuiz}
          className="p-4 rounded-lg border-2 border-white/20 bg-transparent text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300"
        >
          <ArrowPathIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Retake Quiz</div>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <ChartBarIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{predictionData.confidence_percentage}%</div>
            <div className="text-white/70 text-sm">Prediction Confidence</div>
          </div>
        </div>

        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <LightBulbIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {predictionData.explainable_ai?.counterfactual_tips?.length || 0}
            </div>
            <div className="text-white/70 text-sm">Improvement Tips</div>
          </div>
        </div>

        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <AcademicCapIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {Object.keys(predictionData.explainable_ai?.feature_importance?.feature_importance || {}).length}
            </div>
            <div className="text-white/70 text-sm">Skills Analyzed</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-transparent border border-white/20 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Recommended Next Steps
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <div className="font-medium text-white mb-1">Explore the AI Explanation</div>
              <div className="text-sm text-white/70">Understand why this career was recommended for you</div>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div>
              <div className="font-medium text-white mb-1">Review Improvement Tips</div>
              <div className="text-sm text-white/70">See specific ways to strengthen your profile</div>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <div>
              <div className="font-medium text-white mb-1">Generate Learning Path</div>
              <div className="text-sm text-white/70">Get a personalized roadmap to achieve your career goals</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.sectionHeadText}
          >
            Career Prediction Results
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mt-4"
          >
            Comprehensive analysis of your career prediction with AI-powered insights
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <TabButton 
            id="results" 
            label="Results Overview" 
            icon={ChartBarIcon}
            isActive={activeTab === 'results'}
            onClick={setActiveTab}
          />
          <TabButton 
            id="explanation" 
            label="AI Explanation" 
            icon={LightBulbIcon}
            isActive={activeTab === 'explanation'}
            onClick={setActiveTab}
          />
          <TabButton 
            id="learning" 
            label="Learning Path" 
            icon={AcademicCapIcon}
            isActive={activeTab === 'learning'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'results' && <ResultsSummary />}
            
            {activeTab === 'explanation' && (
              <ExplainableAI 
                explainableData={predictionData.explainable_ai}
                prediction={predictionData.prediction}
              />
            )}
            
            {activeTab === 'learning' && userId && (
              <LearningPath 
                userId={userId}
                targetRole={predictionData.prediction}
                currentSkills={extractSkillsFromPrediction(predictionData)}
              />
            )}
            
            {activeTab === 'learning' && !userId && (
              <div className="text-center py-12 bg-transparent border border-white/20 rounded-xl p-8">
                <AcademicCapIcon className="w-16 h-16 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Please sign in to access personalized learning paths and track your progress.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signin')}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                >
                  Sign In
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedResults;
