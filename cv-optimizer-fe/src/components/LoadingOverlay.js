import React, { useState, useEffect } from 'react';

const LoadingOverlay = ({ isLoading, fact, t }) => { // Accept t as a prop
  const [progress, setProgress] = useState(0);
  
  // Simulate progress for visual effect
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(oldProgress => {
          // Slow down progress as it approaches 90%
          const increment = Math.max(1, Math.floor((90 - oldProgress) / 10));
          const newProgress = Math.min(oldProgress + increment, 90);
          return newProgress;
        });
      }, 800);
      
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  // The 'fact' prop now already contains the translated string or the default one
  // No need to strip "Did you know?" or use t() here for the fact itself
  const factContent = fact || t('loadingOverlayFactDefault'); 

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"></div>
      
      {/* Enlarged card */}
      <div className="relative z-10 max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-10 transform transition-all duration-500 ease-out border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center space-y-8">
          {/* Enlarged loading animation */}
          <div className="relative">
            <svg className="w-32 h-32 animate-spin text-primary" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          {/* Status text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('loadingOverlayTitle')}</h3> {/* Use translation key */}
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{t('loadingOverlaySubtitle')}</p> {/* Use translation key */}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* CV Fact */}
          <div className="bg-primary-light/10 dark:bg-primary-dark/20 p-6 rounded-lg border border-primary-light/20 dark:border-primary-dark/30 w-full">
            <h4 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-2 text-center">
              {t('loadingOverlayFactTitle')} {/* Use translation key for the title */}
            </h4>
            <p className="text-neutral-700 dark:text-neutral-300 text-center">
              {factContent} {/* Display the already translated fact */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
