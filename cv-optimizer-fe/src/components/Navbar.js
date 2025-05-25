import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Navbar = () => {
  const { t, i18n } = useTranslation(); // Get t function and i18n instance

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Reduced font size slightly and added margin */}
            <Link to="/" className="text-xl sm:text-2xl font-bold gradient-text mr-4"> 
              {t('appName')} 
            </Link>
          </div>
          {/* Adjusted spacing for right-side elements */}
          <div className="flex items-center space-x-4 sm:space-x-6"> 
            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="form-input py-1 px-2 sm:px-3 text-xs sm:text-sm bg-transparent dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-primary-light focus:border-primary-light"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            {/* Adjusted padding/margin implicitly via space-x */}
            <Link to="/optimize" className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 hover:text-primary-DEFAULT dark:hover:text-primary-light transition-colors whitespace-nowrap"> 
              {t('navOptimize')} 
            </Link>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
