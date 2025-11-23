import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  TrophyIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      color: 'blue',
    },
    {
      name: 'Features Dashboard',
      path: '/features',
      icon: ChartBarIcon,
      color: 'blue',
    },
    {
      name: 'Career Prediction',
      path: '/predict',
      icon: ChartBarIcon,
      color: 'red',
    },
    {
      name: 'Adaptive Quiz',
      path: '/adaptive-quiz',
      icon: AcademicCapIcon,
      color: 'blue',
    },
    {
      name: 'Portfolio Builder',
      path: '/portfolio',
      icon: BriefcaseIcon,
      color: 'blue',
    },
    {
      name: 'Skill Assessment',
      path: '/skill-assessment',
      icon: TrophyIcon,
      color: 'red',
    },
    {
      name: 'Labor Market',
      path: '/labor-market',
      icon: GlobeAltIcon,
      color: 'red',
    },
    {
      name: 'AI Chat',
      path: '/chat',
      icon: ChatBubbleLeftRightIcon,
      color: 'blue',
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getActiveColor = (item) => {
    if (isActive(item.path)) {
      return item.color === 'blue' ? 'bg-blue-600' : 'bg-red-600';
    }
    return 'hover:bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                  Career Guidance AI
                </span>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.slice(0, 5).map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? item.color === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signin')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white font-medium text-sm"
              >
                Sign In
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween' }}
              className="fixed top-16 left-0 bottom-0 w-64 bg-gray-900 border-r border-red-900/50 z-40 overflow-y-auto md:hidden"
            >
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? item.color === 'blue'
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
