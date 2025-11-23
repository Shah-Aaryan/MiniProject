import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LaborMarket = ({ userId }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to new dashboard
    navigate('/market/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default LaborMarket;
