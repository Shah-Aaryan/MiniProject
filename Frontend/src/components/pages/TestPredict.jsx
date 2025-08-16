import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestPredict = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    question1: "5",
    question2: "2",
    question3: "7",
    question4: "6",
    question5: "1",
    question6: "1",
    question7: "Python",
    question8: "Web Technologies",
    question9: "1",
    question10: "2",
    question11: "3",
    question12: "3",
    question13: "4",
    question14: "1",
    question15: "5",
    question16: "1",
    question17: "1",
    question18: "1",
    question19: "0"
  });

  const handleTestPrediction = async () => {
    try {
      console.log('Testing prediction with data:', testData);
      
      const response = await fetch('http://localhost:8000/api/get/quiz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        alert(`Prediction successful! Role: ${data.prediction}, Confidence: ${data.probability}`);
        navigate('/predict', {
          state: {
            prediction: data.prediction,
            probability: data.probability,
            confidence_percentage: data.confidence_percentage,
          },
        });
      } else {
        alert(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-cyan-400">
          Prediction Test Page
        </h1>
        
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Data:</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleTestPrediction}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Test Prediction
          </button>
          
          <button
            onClick={() => navigate('/quiz')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Go to Quiz
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Go Home
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            This page tests the prediction functionality with sample data.
            Check the browser console for detailed logs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPredict;
