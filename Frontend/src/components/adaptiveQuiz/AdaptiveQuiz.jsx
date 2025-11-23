import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component redirects to the new dashboard
const AdaptiveQuiz = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the quiz categories page
    navigate('/quiz/categories', { replace: true });
  }, [navigate]);

  return (
    <div className="chat-bg-image min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
        <p className="text-white mt-4">Redirecting to Adaptive Quiz...</p>
      </div>
    </div>
  );
};

export default AdaptiveQuiz;
