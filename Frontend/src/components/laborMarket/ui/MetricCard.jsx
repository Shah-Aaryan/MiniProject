import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'border-blue-600 text-blue-400',
    green: 'border-green-600 text-green-400',
    yellow: 'border-yellow-600 text-yellow-400',
    red: 'border-red-600 text-red-400',
    purple: 'border-purple-600 text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 border ${colorClasses[color]} rounded-lg p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />}
        {trend && (
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </motion.div>
  );
};

export default MetricCard;

