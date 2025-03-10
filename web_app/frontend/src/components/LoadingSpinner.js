import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Translating... This may take a minute for longer texts.</p>
    </div>
  );
};

export default LoadingSpinner; 