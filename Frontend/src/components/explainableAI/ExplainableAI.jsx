import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const ExplainableAI = ({ explainableData, prediction }) => {
  const [activeTab, setActiveTab] = useState('importance');
  const [selectedFeature, setSelectedFeature] = useState(null);

  if (!explainableData) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-700 p-8 rounded-2xl">
        <p className="text-gray-300 font-bold text-lg">No explainable AI data available</p>
      </div>
    );
  }

  const { feature_importance, counterfactual_tips, calibration_data } = explainableData;

  // Prepare feature importance chart data
  const featureImportanceData = feature_importance?.feature_importance ? 
    Object.entries(feature_importance.feature_importance)
      .sort(([,a], [,b]) => b.importance_score - a.importance_score)
      .slice(0, 10) : [];

  const importanceChartData = {
    labels: featureImportanceData.map(([feature]) => feature),
    datasets: [{
      label: 'Feature Importance',
      data: featureImportanceData.map(([, data]) => data.importance_score),
      backgroundColor: featureImportanceData.map((_, index) => 
        `rgba(${54 + index * 20}, ${162 + index * 10}, ${235 - index * 15}, 0.8)`
      ),
      borderColor: featureImportanceData.map((_, index) => 
        `rgba(${54 + index * 20}, ${162 + index * 10}, ${235 - index * 15}, 1)`
      ),
      borderWidth: 1
    }]
  };

  const importanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feature Importance for Your Career Prediction'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Importance Score'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Skills & Attributes'
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const [featureName, featureData] = featureImportanceData[index];
        setSelectedFeature({ name: featureName, ...featureData });
      }
    }
  };

  // Prepare confidence visualization
  const confidenceData = calibration_data?.user_prediction?.all_probabilities || {};
  const sortedConfidences = Object.entries(confidenceData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const confidenceChartData = {
    labels: sortedConfidences.map(([role]) => role),
    datasets: [{
      data: sortedConfidences.map(([, prob]) => (prob * 100).toFixed(1)),
      backgroundColor: [
        '#FF6384',
        '#36A2EB', 
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
      hoverBackgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56', 
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };

  const confidenceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Career Role Confidence Distribution'
      }
    }
  };

  // Prepare calibration plot data
  const calibrationPlotData = calibration_data?.calibration_curves?.[prediction] || {};
  const calibrationChartData = {
    labels: calibrationPlotData.prob_pred?.map((_, i) => `Bin ${i + 1}`) || [],
    datasets: [
      {
        label: 'Perfect Calibration',
        data: calibrationPlotData.prob_pred || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        type: 'line'
      },
      {
        label: 'Model Calibration',
        data: calibrationPlotData.prob_true || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        type: 'line'
      }
    ]
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-8 py-4 font-black uppercase tracking-wide rounded-xl transition-all duration-300 border-2 ${
        isActive 
          ? 'bg-gradient-to-r from-red-600 via-blue-600 to-red-600 text-white border-blue-500 shadow-lg shadow-blue-500/50' 
          : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-blue-600 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const FeatureCard = ({ feature, data, isSelected, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick({ name: feature, ...data })}
      className={`p-5 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
        isSelected 
          ? 'bg-gradient-to-br from-blue-900/50 to-black border-blue-500 shadow-lg shadow-blue-500/30' 
          : 'bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-blue-600 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-white uppercase tracking-wide">{feature}</h4>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
          data.impact_level === 'High' ? 'bg-red-900/50 text-red-400 border border-red-700' :
          data.impact_level === 'Medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
          'bg-green-900/50 text-green-400 border border-green-700'
        }`}>
          {data.impact_level}
        </span>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-400 font-bold">Your Score:</span>
        <span className="font-black text-blue-400 text-lg">{data.user_value}/10</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
        <div 
          className="bg-gradient-to-r from-red-600 to-blue-600 h-3 rounded-full shadow-lg" 
          style={{ width: `${(data.importance_score * 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-300 mt-3 leading-relaxed">{data.explanation}</p>
    </motion.div>
  );

  const CounterfactualTip = ({ tip, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-red-900/40 to-blue-900/40 p-6 rounded-xl border-l-4 border-red-600"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-black text-red-400 uppercase tracking-wide">{tip.feature}</h4>
        <span className="bg-red-900/50 text-red-300 px-3 py-2 rounded-lg text-xs font-black uppercase border border-red-700">
          +{(tip.impact_score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="text-sm text-gray-300 mb-3 font-bold">
        <span className="text-red-400">Current:</span> {tip.current_value}/10 → 
        <span className="text-blue-400 ml-2">Suggested:</span> {tip.suggested_value}/10
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{tip.tip}</p>
      <div className="mt-3">
        <span className="text-xs text-blue-400 font-bold uppercase">Target Role: {tip.target_role}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">
          🔍 Why {prediction}?
        </h2>
        <p className="text-gray-400">
          Understand the factors behind your career prediction with AI explanations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-3 mb-6">
        <TabButton 
          id="importance" 
          label="Feature Importance" 
          isActive={activeTab === 'importance'}
          onClick={setActiveTab}
        />
        <TabButton 
          id="counterfactual" 
          label="Improvement Tips" 
          isActive={activeTab === 'counterfactual'}
          onClick={setActiveTab}
        />
        <TabButton 
          id="confidence" 
          label="Confidence Analysis" 
          isActive={activeTab === 'confidence'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'importance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Feature Importance Chart</h3>
                {featureImportanceData.length > 0 ? (
                  <Bar data={importanceChartData} options={importanceChartOptions} />
                ) : (
                  <p className="text-gray-400 font-bold">No feature importance data available</p>
                )}
              </div>
              
              {selectedFeature && (
                <div className="bg-gray-800 p-5 rounded-lg border border-blue-600">
                  <h3 className="text-lg font-medium text-white mb-4">Selected Feature Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-bold text-gray-400">Feature:</span> <span className="font-black text-white text-lg">{selectedFeature.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400">Your Score:</span> <span className="font-black text-blue-400 text-lg">{selectedFeature.user_value}/10</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400">Impact Level:</span> 
                      <span className={`ml-2 px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                        selectedFeature.impact_level === 'High' ? 'bg-red-900/50 text-red-400 border-red-700' :
                        selectedFeature.impact_level === 'Medium' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' :
                        'bg-green-900/50 text-green-400 border-green-700'
                      }`}>
                        {selectedFeature.impact_level}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400">Explanation:</span>
                      <p className="text-gray-300 mt-2 leading-relaxed">{selectedFeature.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Top Contributing Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {featureImportanceData.map(([feature, data]) => (
                  <FeatureCard
                    key={feature}
                    feature={feature}
                    data={data}
                    isSelected={selectedFeature?.name === feature}
                    onClick={setSelectedFeature}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'counterfactual' && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-2 text-white">
                💡 Personalized Improvement Suggestions
              </h3>
              <p className="text-gray-400">
                These tips show you exactly what to improve to increase your chances for different career roles.
              </p>
            </div>
            
            <div className="space-y-4">
              {counterfactual_tips && counterfactual_tips.length > 0 ? (
                counterfactual_tips.map((tip, index) => (
                  <CounterfactualTip key={index} tip={tip} index={index} />
                ))
              ) : (
                <p className="text-gray-400 font-bold text-center py-8">
                  No improvement suggestions available at this time.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'confidence' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Career Role Probabilities</h3>
                {sortedConfidences.length > 0 ? (
                  <Doughnut data={confidenceChartData} options={confidenceChartOptions} />
                ) : (
                  <p className="text-gray-400 font-bold">No confidence data available</p>
                )}
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Model Calibration</h3>
                {calibrationPlotData.prob_pred ? (
                  <Line data={calibrationChartData} />
                ) : (
                  <p className="text-gray-400 font-bold">No calibration data available</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Confidence Breakdown</h3>
              <div className="space-y-4">
                {sortedConfidences.map(([role, confidence], index) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="font-bold text-white">{role}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-40 bg-gray-800 rounded-full h-3 border border-gray-700">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-blue-600 h-3 rounded-full shadow-lg" 
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-black text-blue-400 text-lg min-w-[60px]">
                        {(confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ExplainableAI;
