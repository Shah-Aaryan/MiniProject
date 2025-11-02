import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  LightBulbIcon,
  CpuChipIcon,
  BookOpenIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const AdvancedFeatures = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'adaptive-quiz',
      title: 'Adaptive Quiz',
      description: 'Take an intelligent quiz that adapts to your responses for more accurate predictions',
      icon: CpuChipIcon,
      color: 'from-blue-500 to-purple-600',
      path: '/adaptive-quiz'
    },
    {
      id: 'learning-path',
      title: 'Learning Paths',
      description: 'Get personalized roadmaps with milestones to achieve your career goals',
      icon: BookOpenIcon,
      color: 'from-green-500 to-teal-600',
      path: '/learning-path'
    },
    {
      id: 'ai-explanation',
      title: 'AI Explanations',
      description: 'Understand why certain careers were recommended with detailed AI insights',
      icon: LightBulbIcon,
      color: 'from-yellow-500 to-orange-600',
      path: '/results'
    },
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Manage your skills, preferences, and track your learning progress',
      icon: UserCircleIcon,
      color: 'from-pink-500 to-rose-600',
      path: '/profile'
    }
  ];

  const FeatureCard = ({ feature }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(feature.path)}
      className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10`}>
            <feature.icon className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 ml-3">{feature.title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {feature.description}
        </p>
        
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
          <span>Explore Feature</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          🚀 Advanced Features
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Discover powerful AI-driven tools to enhance your career prediction experience
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 Complete Career Journey
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start with our traditional quiz or try the adaptive version, then explore AI explanations 
            and generate personalized learning paths to achieve your career goals.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quiz')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Traditional Quiz
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/adaptive-quiz')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try Adaptive Quiz
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6">
          <div className="text-3xl mb-2">🧠</div>
          <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
          <p className="text-sm text-gray-600">
            Advanced machine learning algorithms provide accurate career predictions
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-800 mb-2">Data-Driven</h3>
          <p className="text-sm text-gray-600">
            Insights based on comprehensive analysis of skills and preferences
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold text-gray-800 mb-2">Personalized</h3>
          <p className="text-sm text-gray-600">
            Tailored recommendations and learning paths for your unique profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
