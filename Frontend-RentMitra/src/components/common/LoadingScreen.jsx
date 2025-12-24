// src/components/Common/LoadingScreen.js
import React from 'react';

const LoadingScreen = ({ message = "Please wait", minHeight = "60vh", size = 24 }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight }}>
      <div
        className="border-2 border-gray-300 rounded-full border-t-gray-900 animate-spin"
        style={{ width: size, height: size }}
      />
      <div className="text-sm font-medium text-gray-600">{message}</div>
    </div>
  );
};

export default LoadingScreen;