import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

const Dashboard = () => {
  const { t } = useTranslation(); 

  return (
    // Increased top margin and padding
    <div className="mx-auto mt-16 mb-10 max-w-4xl px-4 sm:px-6 lg:px-8"> 
      {/* Increased padding and spacing within the card */}
      <div className="card p-10 sm:p-12 space-y-10 text-center"> 
        <div className="space-y-5">
          {/* Adjusted heading size for responsiveness */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text leading-tight"> 
            {t('dashboardTitle')} 
          </h1>
          {/* Adjusted subtitle size */}
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto"> 
            {t('dashboardSubtitle')} 
          </p>
        </div>
        
        {/* Adjusted gap and text alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"> 
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-3"> 
              {t('dashboardFeature1Title')} 
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              {t('dashboardFeature1Desc')} 
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-3"> 
              {t('dashboardFeature2Title')} 
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              {t('dashboardFeature2Desc')} 
            </p>
          </div>
        </div>

        {/* Ensured button is centered */}
        <div className="flex justify-center"> 
          <Link to="/optimize" className="btn-primary inline-block text-lg px-8 py-3"> 
            {t('dashboardButton')} 
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
