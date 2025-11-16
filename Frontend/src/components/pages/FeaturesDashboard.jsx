import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const FeaturesDashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Adaptive Quiz System',
      description: 'Take intelligent quizzes that adapt to your skill level. Get personalized questions and track your progress across different categories.',
      icon: AcademicCapIcon,
      color: 'blue',
      route: '/adaptive-quiz',
      features: ['Smart difficulty adjustment', 'Real-time timer', 'Skill profiling', 'Quiz history']
    },
    {
      id: 2,
      title: 'Portfolio Builder',
      description: 'Create professional portfolios with customizable templates. Showcase your projects, experience, and skills to potential employers.',
      icon: BriefcaseIcon,
      color: 'green',
      route: '/portfolio',
      features: ['Multiple templates', 'Project showcase', 'Public sharing', 'Custom domains']
    },
    {
      id: 3,
      title: 'Skill Assessment',
      description: 'Test your skills with comprehensive assessments. Earn badges, identify skill gaps, and get personalized improvement recommendations.',
      icon: TrophyIcon,
      color: 'yellow',
      route: '/skill-assessment',
      features: ['Multiple question types', 'Auto-grading', 'Badge system', 'Skill gap analysis']
    },
    {
      id: 4,
      title: 'Labor Market Intelligence',
      description: 'Access real-time job market data, salary insights, and trending skills. Make informed career decisions with comprehensive market analysis.',
      icon: GlobeAltIcon,
      color: 'red',
      route: '/labor-market',
      features: ['Salary insights', 'Trending skills', 'Industry analysis', 'Career recommendations']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        border: 'border-blue-600',
        text: 'text-blue-400',
        bg: 'bg-blue-600',
        hover: 'hover:border-blue-500'
      },
      green: {
        border: 'border-green-600',
        text: 'text-green-400',
        bg: 'bg-green-600',
        hover: 'hover:border-green-500'
      },
      yellow: {
        border: 'border-yellow-600',
        text: 'text-yellow-400',
        bg: 'bg-yellow-600',
        hover: 'hover:border-yellow-500'
      },
      red: {
        border: 'border-red-600',
        text: 'text-red-400',
        bg: 'bg-red-600',
        hover: 'hover:border-red-500'
      }
    };
    return colors[color];
  };

  return (
    <div className="chat-bg-image min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <div className="bg-black/70 backdrop-blur-md px-12 py-6 rounded-2xl border-2 border-cyan-500/50 shadow-2xl">
              <div className="flex items-center justify-center mb-3">
                <SparklesIcon className="w-10 h-10 text-cyan-400 mr-3 drop-shadow-lg" />
                <h1 className="text-6xl font-black text-cyan-300 drop-shadow-[0_6px_16px_rgba(0,0,0,1)] tracking-tight">Explore Features</h1>
              </div>
              <p className="text-xl text-cyan-400 font-semibold drop-shadow-lg">Accelerate Your Career Growth</p>
            </div>
          </motion.div>
          <div className="bg-black/60 backdrop-blur-sm px-8 py-4 rounded-xl border border-cyan-500/30 shadow-lg max-w-4xl mx-auto">
            <p className="text-xl text-white font-medium drop-shadow-[0_3px_8px_rgba(0,0,0,1)]">
              Comprehensive suite of AI-powered tools for skill development, portfolio building, and career planning.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = getColorClasses(feature.color);
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative group cursor-pointer"
                onClick={() => navigate(feature.route)}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
                <div className="relative bg-black/85 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-8 shadow-2xl transition-all hover:border-cyan-500/50">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl ${colors.bg}/20 backdrop-blur-sm border-2 ${colors.border}/50 shadow-xl`}>
                      <Icon className={`w-10 h-10 ${colors.text} drop-shadow-lg`} />
                    </div>
                    <ArrowRightIcon className="w-6 h-6 text-cyan-400 drop-shadow-lg group-hover:translate-x-2 transition-transform" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">{feature.title}</h3>
                  <p className="text-gray-300 mb-6 text-base leading-relaxed drop-shadow-md">{feature.description}</p>

                  <div className="space-y-3 mb-6">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-base text-white font-medium">
                        <div className={`w-2 h-2 rounded-full ${colors.bg} mr-3 shadow-lg`}></div>
                        <span className="drop-shadow-md">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`w-full ${colors.bg}/90 backdrop-blur-sm hover:${colors.bg} text-white py-3 rounded-xl font-bold text-lg shadow-2xl border-2 ${colors.border}/50 hover:scale-105 transition-all duration-200`}>
                    Launch Feature →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative bg-black/85 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">Platform Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center bg-blue-500/10 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
                <ClipboardDocumentCheckIcon className="w-12 h-12 text-blue-400 mx-auto mb-3 drop-shadow-lg" />
                <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">1000+</div>
                <div className="text-base text-gray-300 font-medium drop-shadow-md">Assessment Questions</div>
              </div>
              <div className="text-center bg-green-500/10 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
                <BriefcaseIcon className="w-12 h-12 text-green-400 mx-auto mb-3 drop-shadow-lg" />
                <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">50+</div>
                <div className="text-base text-gray-300 font-medium drop-shadow-md">Portfolio Templates</div>
              </div>
              <div className="text-center bg-yellow-500/10 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/30">
                <ChartBarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-3 drop-shadow-lg" />
                <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">500+</div>
                <div className="text-base text-gray-300 font-medium drop-shadow-md">Job Market Insights</div>
              </div>
              <div className="text-center bg-red-500/10 backdrop-blur-sm p-6 rounded-xl border border-red-500/30">
                <CurrencyDollarIcon className="w-12 h-12 text-red-400 mx-auto mb-3 drop-shadow-lg" />
                <div className="text-4xl font-black text-white mb-2 drop-shadow-lg">Real-time</div>
                <div className="text-base text-gray-300 font-medium drop-shadow-md">Salary Data</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Help */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800/80 backdrop-blur-md hover:bg-gray-700/80 text-white font-semibold px-8 py-3 rounded-xl shadow-xl border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesDashboard;
