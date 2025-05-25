import React from 'react';
import { getTemplatePreviewUrl } from '../services/api';
import { useTranslation } from 'react-i18next';

function TemplatePreviewModal({ isOpen, onClose, template, onSelect }) {
  const { t } = useTranslation();
  
  if (!isOpen || !template) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-neutral-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {t(`template_${template.id}_name`, { defaultValue: template.name })}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 max-h-[60vh] overflow-auto">
              <img 
                src={getTemplatePreviewUrl(template.id)}
                alt={`${template.name} preview`}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {t(`template_${template.id}_description`, { defaultValue: template.description })}
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 mr-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </button>
          <button 
            onClick={() => {
              onSelect(template.id);
              onClose();
            }}
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:from-primary-dark hover:to-secondary-dark transition-all duration-300"
          >
            {t('chooseThisTemplate', { defaultValue: 'Choose This Template' })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatePreviewModal; 