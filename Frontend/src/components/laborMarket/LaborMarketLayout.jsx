import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  FireIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const LaborMarketLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/market/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/market/industries', label: 'Industries', icon: BuildingOfficeIcon },
    { path: '/market/jobs', label: 'Job Roles', icon: BriefcaseIcon },
    { path: '/market/skills', label: 'Skills', icon: FireIcon },
    { path: '/market/companies', label: 'Companies', icon: BuildingOffice2Icon },
    { path: '/market/emerging', label: 'Emerging Roles', icon: SparklesIcon },
    { path: '/market/recommend', label: 'Career Path', icon: UserGroupIcon },
    { path: '/market/gap-analysis', label: 'Skill Gap', icon: AcademicCapIcon },
    { path: '/market/trends', label: 'Trends', icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 overflow-y-auto">
        <div className="p-6">
          <Link to="/market/dashboard" className="flex items-center space-x-2 mb-8">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Labor Market</span>
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">{children}</div>
    </div>
  );
};

export default LaborMarketLayout;

