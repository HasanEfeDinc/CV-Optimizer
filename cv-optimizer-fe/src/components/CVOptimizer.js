import React, { useState, useEffect } from 'react';
import { optimizeCV, generatePDF } from '../services/api';
import { diffLines } from 'diff';
import LoadingOverlay from './LoadingOverlay'; // Import the new component
import { useTranslation } from 'react-i18next'; // Import useTranslation
import TemplateSelector from './TemplateSelector'; // Import the TemplateSelector component

// Define an array of translation keys for the facts
const cvFactKeys = [
    'cvFact1', 'cvFact2', 'cvFact3', 'cvFact4', 'cvFact5',
    'cvFact6', 'cvFact7', 'cvFact8', 'cvFact9', 'cvFact10'
];

function CVOptimizer() {
    const { t } = useTranslation(); // Get the t function
    const [jobDescription, setJobDescription] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [originalLatexCode, setOriginalLatexCode] = useState('');
    const [latexCode, setLatexCode] = useState('');
    const [coverLetterText, setCoverLetterText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeDocument, setActiveDocument] = useState('cv');
    const [optimizationComplete, setOptimizationComplete] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [highlightedText, setHighlightedText] = useState('');
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [currentFact, setCurrentFact] = useState(''); 
    const [factIntervalId, setFactIntervalId] = useState(null);
    const [isCoverLetterEdited, setIsCoverLetterEdited] = useState(false);
    const [coverLetterPreviewMode, setCoverLetterPreviewMode] = useState(true); // Default to preview mode
    const [copySuccess, setCopySuccess] = useState(''); // State for copy confirmation message

    // GitHub states
    const [pullGithubProjects, setPullGithubProjects] = useState(false);
    const [githubLink, setGithubLink] = useState('');

    // LinkedIn states (added)
    const [pullLinkedinProjects, setPullLinkedinProjects] = useState(false);
    const [linkedinLink, setLinkedinLink] = useState('');

    const [selectedTemplate, setSelectedTemplate] = useState('classic'); // State for selected template

    useEffect(() => {
        const currentUrl = pdfPreviewUrl; 
        return () => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
                console.log("Revoked PDF preview URL:", currentUrl);
            }
        };
    }, [pdfPreviewUrl]);

    useEffect(() => {
        if (loading) {
            // Select a random key and get the translated fact
            const randomKey = cvFactKeys[Math.floor(Math.random() * cvFactKeys.length)];
            setCurrentFact(t(randomKey)); // Use t() to get the translated string

            const intervalId = setInterval(() => {
                // Select a new random key and update the fact
                const newRandomKey = cvFactKeys[Math.floor(Math.random() * cvFactKeys.length)];
                setCurrentFact(t(newRandomKey)); // Use t() for subsequent updates
            }, 8000); // 8 seconds
            setFactIntervalId(intervalId);

            return () => {
                clearInterval(intervalId);
                setFactIntervalId(null);
                setCurrentFact('');
            };
        }
    }, [loading, t]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const fileType = file.type;
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const fileName = file.name.toLowerCase();
        
        if (
            !validTypes.includes(fileType) && 
            !fileName.endsWith('.pdf') && 
            !fileName.endsWith('.doc') && 
            !fileName.endsWith('.docx')
        ) {
            setError(t('optimizerErrorFileType'));
            return;
        }
        
        setCvFile(file);
    };

    const handleOptimize = async () => {
        if (!jobDescription || !cvFile) {
            setError(t('optimizerErrorGeneric'));
            return;
        }
        
        // GitHub validation
        if (pullGithubProjects && !githubLink.trim()) {
            setError(t('optimizerErrorGithubLinkMissing'));
            return;
        }
        if (pullGithubProjects && !githubLink.startsWith('https://github.com/')) {
            setError(t('optimizerErrorGithubLinkInvalid'));
            return;
        }

        // LinkedIn validation (added)
        if (pullLinkedinProjects && !linkedinLink.trim()) {
            setError(t('optimizerErrorLinkedinLinkMissing'));
            return;
        }
        if (pullLinkedinProjects && !linkedinLink.startsWith('https://www.linkedin.com/')) {
            setError(t('optimizerErrorLinkedinLinkInvalid'));
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setPdfPreviewUrl(null);
            setPdfError(null);
            
            if (cvFile.size > 3 * 1024 * 1024) {
                setError(t('optimizerErrorFileSize'));
                setLoading(false);
                return;
            }
            
            const reader = new FileReader();
            reader.readAsDataURL(cvFile);
            
            reader.onload = async () => {
                try {
                    const base64Data = reader.result.split(',')[1];
                    
                    const payload = {
                        fileName: cvFile.name,
                        fileType: cvFile.type,
                        base64Data,
                        githubLink: pullGithubProjects ? githubLink : null,
                        linkedinLink: pullLinkedinProjects ? linkedinLink : null, // added
                        templateId: selectedTemplate
                    };
                    
                    const result = await optimizeCV(jobDescription, payload);
                    handleOptimizeResult(result);
                } catch (apiError) {
                    setError(t('optimizerErrorOptimizeFailed', { message: apiError.message }));
                    setLoading(false);
                }
            };
            
            reader.onerror = () => {
                setError(t('optimizerErrorFileRead'));
                setLoading(false);
            };
        } catch (err) {
            setError(t('optimizerErrorFileProcess', { message: err.message }));
            setLoading(false);
        }
    };
    
    const handleOptimizeResult = (result) => {
        if (result.success) {
            setLatexCode(result.latexCode || '');
            setCoverLetterText(result.coverLetterPlainText || '');
            setOptimizationComplete(true);
            setActiveDocument('cv');
            setIsCoverLetterEdited(false);
            
            if (result.originalLatexCode) {
                setOriginalLatexCode(result.originalLatexCode);
                generateHighlightedDiff(result.originalLatexCode, result.latexCode || '');
                setShowDiff(false);
            } else {
                setOriginalLatexCode('');
                setHighlightedText(result.latexCode || '');
                setShowDiff(false);
            }
        } else {
            setError(result.message || result.error || t('optimizerErrorOptimizeFailedGeneric'));
        }
        setLoading(false);
    };

    const generateHighlightedDiff = (original, optimized) => {
        if (!original) {
            setHighlightedText(optimized);
            return;
        }
        const differences = diffLines(original, optimized);
        let html = '';
        differences.forEach((part) => {
            const color = part.added
                ? 'bg-green-100 text-green-800'
                : part.removed
                ? 'bg-red-100 text-red-800 line-through'
                : '';
            const value = part.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<span class="${color}">${value}</span>`;
        });
        setHighlightedText(html);
    };

    const handleGeneratePreview = async () => {
        if (!latexCode) {
            setPdfError(t('optimizerPdfPreviewNoLatex'));
            return;
        }
        setPdfLoading(true);
        setPdfError(null);
        if (pdfPreviewUrl) {
             URL.revokeObjectURL(pdfPreviewUrl);
        }
        try {
            const pdfBlob = await generatePDF(latexCode, 'cv');
            const url = URL.createObjectURL(pdfBlob);
            setPdfPreviewUrl(url);
        } catch (error) {
            setPdfError(t('optimizerPdfPreviewErrorGeneric', { message: error.message }));
            setPdfPreviewUrl(null);
        } finally {
            setPdfLoading(false);
        }
    };

    const handleCoverLetterChange = (event) => {
        setCoverLetterText(event.target.value);
        setIsCoverLetterEdited(true);
    };

    const handleSaveCoverLetter = () => {
        setIsCoverLetterEdited(false);
    };

    const handleCopyCoverLetter = () => {
        if (!coverLetterText) return;
        navigator.clipboard.writeText(coverLetterText).then(() => {
            setCopySuccess(t('optimizerCopySuccess'));
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess(t('optimizerCopyFailed'));
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const highlightPlaceholders = (text) => {
        if (!text) return t('optimizerCLNoContent');
        const parts = text.split(/(\[[^\]]+\])/g);
        return parts.map((part, index) => (
            part.startsWith('[') && part.endsWith(']')
                ? <span key={index} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-yellow-100 font-medium rounded px-1 mx-0.5">{part}</span>
                : <span key={index}>{part}</span>
        ));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <LoadingOverlay isLoading={loading} fact={currentFact} t={t} />
            
            <div className="card p-6">
                <h2 className="text-2xl font-bold mb-4">{t('optimizerTitle')}</h2>
                <div className="space-y-6">
                    <div>
                        <label className="form-label">{t('optimizerJobDescLabel')}</label>
                        <textarea
                            className="w-full h-24 p-2 border rounded"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder={t('optimizerJobDescriptionPlaceholder')}
                        />
                    </div>
                    
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">{t('templateSelectionTitle')}</h2>
                        <TemplateSelector
                            selectedTemplate={selectedTemplate}
                            onSelectTemplate={setSelectedTemplate}
                        />
                    </div>
                    
                    <div>
                        <label className="form-label">{t('optimizerCVFileLabel')}</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="mt-1 block w-full"
                            disabled={loading}
                        />
                        {cvFile && !loading && (
                            <p className="mt-2 text-sm text-green-600">
                                {t('optimizerFileSelected', { fileName: cvFile.name })}
                            </p>
                        )}
                    </div>

                    {/* GitHub Project Pulling Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <label className="form-label flex items-center cursor-pointer mb-0">
                            <input
                                type="checkbox"
                                checked={pullGithubProjects}
                                onChange={(e) => setPullGithubProjects(e.target.checked)}
                                className="form-checkbox mr-2"
                                disabled={loading}
                            />
                            {t('optimizerGithubPullLabel')}
                        </label>
                        {pullGithubProjects && (
                            <div className="flex-grow flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={githubLink}
                                    onChange={(e) => setGithubLink(e.target.value)}
                                    className="form-input flex-grow"
                                    placeholder={t('optimizerGithubLinkPlaceholder')}
                                    disabled={loading}
                                />
                                <span className="text-xs text-neutral-500">
                                    {t('optimizerGithubNote')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* LinkedIn Project Pulling Section (added) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <label className="form-label flex items-center cursor-pointer mb-0">
                            <input
                                type="checkbox"
                                checked={pullLinkedinProjects}
                                onChange={(e) => setPullLinkedinProjects(e.target.checked)}
                                className="form-checkbox mr-2"
                                disabled={loading}
                            />
                            {t('Include Linkedin Projects')}
                        </label>
                        {pullLinkedinProjects && (
                            <div className="flex-grow flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={linkedinLink}
                                    onChange={(e) => setLinkedinLink(e.target.value)}
                                    className="form-input flex-grow"
                                    placeholder={t('www.linkedin.com/in/yourusername')}
                                    disabled={loading}
                                />
                                <span className="text-xs text-neutral-500">  
                                    {t('We will extract your Linkedin projects')}
                                </span>
                            </div>
                        )}
                    </div>

                    {error && !loading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                            <strong className="font-bold">{t('optimizerErrorAlertTitle')} </strong>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <button
                            onClick={handleOptimize}
                            disabled={loading || !cvFile || !jobDescription}
                            className={`btn-primary w-full ${loading || !cvFile || !jobDescription ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? t('optimizerOptimizingButton') : t('optimizerOptimizeButton')}
                        </button>
                    </div>
                </div>
            </div>
            
            {optimizationComplete && !loading && (
                <div className="card p-6"> 
                    <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">{t('optimizerResultTitle')}</h3> {/* Use translation key */}
                    
                    <div className="mb-4">
                        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
                            <button
                                onClick={() => setActiveDocument('cv')}
                                className={`py-2 px-4 font-medium text-sm transition-colors ${
                                    activeDocument === 'cv'
                                        ? 'text-primary-DEFAULT border-b-2 border-primary-DEFAULT dark:text-primary-light dark:border-primary-light'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 border-b-2 border-transparent'
                                }`}
                            >
                                {t('optimizerTabCV')} {/* Use translation key */}
                            </button>
                            <button
                                onClick={() => setActiveDocument('coverLetter')}
                                className={`py-2 px-4 font-medium text-sm transition-colors ${
                                    activeDocument === 'coverLetter'
                                        ? 'text-primary-DEFAULT border-b-2 border-primary-DEFAULT dark:text-primary-light dark:border-primary-light'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 border-b-2 border-transparent'
                                }`}
                            >
                                {t('optimizerTabCoverLetter')} {/* Use translation key */}
                            </button>
                        </div>
                    </div>
                    
                    {activeDocument === 'cv' && originalLatexCode && (
                        <div className="flex items-center my-4">
                            <label className="form-label flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showDiff}
                                    onChange={(e) => setShowDiff(e.target.checked)}
                                    className="form-checkbox mr-2"
                                />
                                {t('optimizerShowDiffLabel')} {/* Use translation key */}
                            </label>
                        </div>
                    )}
                    
                    <div className="mt-6 space-y-6">
                        {activeDocument === 'cv' ? (
                            showDiff && originalLatexCode ? (
                                <div>
                                    <h4 className="text-md font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('optimizerDiffTitle')}</h4> {/* Use translation key */}
                                    <div className="bg-neutral-900 rounded-lg p-4 overflow-x-auto max-h-96"> 
                                        <div 
                                            className="text-neutral-300 text-sm font-mono leading-relaxed whitespace-pre" 
                                            dangerouslySetInnerHTML={{ __html: highlightedText }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {originalLatexCode && (
                                        <div>
                                            <h4 className="text-md font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('optimizerOriginalCVTitle')}</h4> {/* Use translation key */}
                                            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 overflow-x-auto h-96">
                                                <pre className="text-neutral-800 dark:text-neutral-200 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                                                    {originalLatexCode}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                    <div className={originalLatexCode ? '' : 'md:col-span-2'}> 
                                        <h4 className="text-md font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('optimizerOptimizedCVTitle')}</h4> {/* Use translation key */}
                                        <div className="bg-neutral-900 rounded-lg p-4 overflow-x-auto h-96">
                                            <pre className="text-neutral-300 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                                                {latexCode || "No optimized LaTeX code received."}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="relative"> {/* Add relative positioning to parent */}
                                <h4 className="text-md font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('optimizerGeneratedCLTitle')}</h4> {/* Use translation key */}
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {t('optimizerCLInstruction')} {/* Use translation key */}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCoverLetterPreviewMode(false)}
                                            className={`px-3 py-1 text-xs rounded-l-md ${!coverLetterPreviewMode 
                                                ? 'bg-primary-light/40 dark:bg-primary-dark/40 font-medium' 
                                                : 'bg-neutral-200 dark:bg-neutral-700'}`}
                                        >
                                            {t('optimizerCLEditButton')} {/* Use translation key */}
                                        </button>
                                        <button
                                            onClick={() => setCoverLetterPreviewMode(true)}
                                            className={`px-3 py-1 text-xs rounded-r-md ${coverLetterPreviewMode 
                                                ? 'bg-primary-light/40 dark:bg-primary-dark/40 font-medium' 
                                                : 'bg-neutral-200 dark:bg-neutral-700'}`}
                                        >
                                            {t('optimizerCLPreviewButton')} {/* Use translation key */}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Floating Copy Button */}
                                <button
                                    onClick={handleCopyCoverLetter}
                                    className="absolute top-24 right-4 z-10 px-3 py-1 text-xs rounded bg-neutral-600 hover:bg-neutral-700 text-white transition-colors"
                                    title={t('optimizerCopyButtonTitle')} // Add title translation key if needed
                                >
                                    {copySuccess || t('optimizerCopyButton')} {/* Use translation key */}
                                </button>

                                {coverLetterPreviewMode ? (
                                    <div className="form-textarea w-full h-96 overflow-y-auto text-sm p-4 whitespace-pre-wrap relative"> {/* Add relative positioning */}
                                        {highlightPlaceholders(coverLetterText)}
                                    </div>
                                ) : (
                                    <div className="relative"> {/* Add relative positioning */}
                                        <textarea
                                            className="form-textarea w-full h-96 text-sm"
                                            value={coverLetterText || t('optimizerCLNoContent')} // Use translation key
                                            onChange={handleCoverLetterChange}
                                            placeholder={t('optimizerCLPlaceholder')} // Use translation key
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex items-center space-x-4">
                        {/* Download button */}
                        <button
                            onClick={() => {
                                const content = activeDocument === 'cv' ? latexCode : coverLetterText;
                                if (!content) {
                                    alert(t('optimizerDownloadNoContent')); // Use translation key
                                    return;
                                }
                                const fileName = activeDocument === 'cv' ? 'optimized_cv.tex' : 'cover_letter.txt';
                                const mimeType = activeDocument === 'cv' ? 'application/x-latex' : 'text/plain';
                                
                                const blob = new Blob([content], { type: mimeType });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = fileName;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                URL.revokeObjectURL(url);
                            }}
                            className={`btn-primary ${
                                // Disable if no content OR if cover letter is active and has unsaved edits
                                (!(activeDocument === 'cv' ? latexCode : coverLetterText) || 
                                (activeDocument === 'coverLetter' && isCoverLetterEdited)) 
                                ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!(activeDocument === 'cv' ? latexCode : coverLetterText) || 
                                    (activeDocument === 'coverLetter' && isCoverLetterEdited)}
                            title={activeDocument === 'coverLetter' && isCoverLetterEdited ? 
                                t('optimizerDownloadTooltipSave') : ""} // Use translation key
                        >
                            {activeDocument === 'cv' ? t('optimizerDownloadCVButton') : t('optimizerDownloadCLButton')} {/* Use translation keys */}
                        </button>

                        {/* Save button */}
                        {activeDocument === 'coverLetter' && isCoverLetterEdited && !coverLetterPreviewMode && (
                            <button
                                onClick={handleSaveCoverLetter}
                                className="px-4 py-2.5 border border-green-500 rounded-lg shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-neutral-800 transition-colors duration-300"
                            >
                                {t('optimizerSaveCLButton')} {/* Use translation key */}
                            </button>
                        )}

                        {/* Preview PDF button */}
                        {activeDocument === 'cv' && (
                            <button
                                onClick={handleGeneratePreview}
                                disabled={pdfLoading || !latexCode}
                                className={`px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary-DEFAULT hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-light dark:focus:ring-offset-neutral-800 transition-colors duration-300 ${ (pdfLoading || !latexCode) ? 'opacity-50 cursor-not-allowed' : '' }`}
                            >
                                {pdfLoading ? t('optimizerGeneratingPreviewButton') : t('optimizerPreviewPDFButton')} {/* Use translation keys */}
                            </button>
                        )}
                    </div>

                    {pdfError && (
                         <div className="mt-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">{t('optimizerPdfPreviewErrorTitle')} </strong> {/* Use translation key */}
                            <span className="block sm:inline">{pdfError}</span>
                        </div>
                    )}

                    {pdfPreviewUrl && activeDocument === 'cv' && (
                        <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                             <h4 className="text-md font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('optimizerPdfPreviewTitle')}</h4> {/* Use translation key */}
                             <iframe
                                src={pdfPreviewUrl}
                                title={t('optimizerPdfPreviewTitle')} // Use translation key for title attribute
                                width="100%"
                                height="600px"
                                className="rounded-md border border-neutral-300 dark:border-neutral-600"
                             >
                                {t('optimizerPdfPreviewBrowserSupport')} <a href={pdfPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-primary-DEFAULT hover:underline">{t('optimizerPdfPreviewDownloadLink')}</a> {t('optimizerPdfPreviewInstead')}. {/* Use translation keys */}
                             </iframe>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CVOptimizer;