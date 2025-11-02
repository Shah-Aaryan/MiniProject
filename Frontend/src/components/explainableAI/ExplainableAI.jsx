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
      <div className="bg-gray-100 p-6 rounded-lg">
        <p className="text-gray-600">No explainable AI data available</p>
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
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-blue-100 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-800">{feature}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          data.impact_level === 'High' ? 'bg-red-100 text-red-800' :
          data.impact_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {data.impact_level}
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Your Score:</span>
        <span className="font-medium">{data.user_value}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${(data.importance_score * 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{data.explanation}</p>
    </motion.div>
  );

  const CounterfactualTip = ({ tip, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-purple-800">{tip.feature}</h4>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
          +{(tip.impact_score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-2">
        <span className="font-medium">Current:</span> {tip.current_value}/10 → 
        <span className="font-medium text-green-600 ml-1">Suggested:</span> {tip.suggested_value}/10
      </div>
      <p className="text-sm text-gray-600">{tip.tip}</p>
      <div className="mt-2">
        <span className="text-xs text-purple-600 font-medium">Target Role: {tip.target_role}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🔍 Why {prediction}?
        </h2>
        <p className="text-gray-600">
          Understand the factors behind your career prediction with AI explanations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Feature Importance Chart</h3>
                {featureImportanceData.length > 0 ? (
                  <Bar data={importanceChartData} options={importanceChartOptions} />
                ) : (
                  <p className="text-gray-500">No feature importance data available</p>
                )}
              </div>
              
              {selectedFeature && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Selected Feature Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Feature:</span> {selectedFeature.name}
                    </div>
                    <div>
                      <span className="font-medium">Your Score:</span> {selectedFeature.user_value}/10
                    </div>
                    <div>
                      <span className="font-medium">Impact Level:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedFeature.impact_level === 'High' ? 'bg-red-100 text-red-800' :
                        selectedFeature.impact_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedFeature.impact_level}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Explanation:</span>
                      <p className="text-gray-700 mt-1">{selectedFeature.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Top Contributing Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                💡 Personalized Improvement Suggestions
              </h3>
              <p className="text-purple-700">
                These tips show you exactly what to improve to increase your chances for different career roles.
              </p>
            </div>
            
            <div className="space-y-4">
              {counterfactual_tips && counterfactual_tips.length > 0 ? (
                counterfactual_tips.map((tip, index) => (
                  <CounterfactualTip key={index} tip={tip} index={index} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No improvement suggestions available at this time.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'confidence' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Career Role Probabilities</h3>
                {sortedConfidences.length > 0 ? (
                  <Doughnut data={confidenceChartData} options={confidenceChartOptions} />
                ) : (
                  <p className="text-gray-500">No confidence data available</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Model Calibration</h3>
                {calibrationPlotData.prob_pred ? (
                  <Line data={calibrationChartData} />
                ) : (
                  <p className="text-gray-500">No calibration data available</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Confidence Breakdown</h3>
              <div className="space-y-3">
                {sortedConfidences.map(([role, confidence], index) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="font-medium">{role}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-blue-800">
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
