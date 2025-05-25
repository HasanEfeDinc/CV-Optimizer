import React, { useState, useEffect } from 'react';
import { getTemplates, getTemplatePreviewUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
import TemplatePreviewModal from './TemplatePreviewModal';

function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const result = await getTemplates();
        if (result.success) {
          setTemplates(result.templates);
          // Select the first template by default if none is selected
          if (!selectedTemplate && result.templates.length > 0) {
            onSelectTemplate(result.templates[0].id);
          }
        } else {
          setError(t('templateFetchError', { defaultValue: 'Failed to load templates' }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError(t('templateFetchError', { defaultValue: 'Failed to load templates' }));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [onSelectTemplate, selectedTemplate, t]);

  const handleTemplateClick = (template) => {
    setSelectedPreviewTemplate(template);
    setPreviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full p-3 text-center">
        <div className="animate-pulse">
          {t('loading', { defaultValue: 'Loading templates...' })}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-3 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full p-2">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">
          {t('selectTemplate', { defaultValue: 'Select Template' })}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('selectTemplateDescription', { defaultValue: 'Choose a template for your CV' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
              selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="h-40 bg-gray-100 dark:bg-gray-800 relative">
              <img 
                src={getTemplatePreviewUrl(template.id)}
                alt={`${template.name} preview`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium">{t(`template_${template.id}_name`, { defaultValue: template.name })}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`template_${template.id}_description`, { defaultValue: template.description })}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        template={selectedPreviewTemplate}
        onSelect={onSelectTemplate}
      />
    </div>
  );
}

export default TemplateSelector; 