import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  </div>
);

export const ChartSkeleton = ({ height = 300 }) => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="h-full bg-gray-800 rounded" style={{ height: `${height}px` }}></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-800 rounded"></div>
      ))}
    </div>
  </div>
);

