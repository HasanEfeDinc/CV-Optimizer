import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // App
      "appName": "CV Optimizer",
      
      // Navbar
      "navDashboard": "Dashboard",
      "navOptimizer": "Optimizer",
      "navOptimize": "Optimize CV",
      "navLogin": "Login",
      
      // Dashboard
      "dashboardTitle": "Optimize Your CV for Job Success",
      "dashboardSubtitle": "Our AI-powered tool helps you create a professional CV tailored to specific job descriptions",
      "dashboardFeature1Title": "Job-Specific Optimization",
      "dashboardFeature1Desc": "Upload your CV and paste a job description to get personalized recommendations that align with the job requirements.",
      "dashboardFeature2Title": "Professional Templates",
      "dashboardFeature2Desc": "Choose from professionally designed templates that grab employers' attention and highlight your skills.",
      "dashboardButton": "Optimize My CV",
      
      // CV Optimizer
      "optimizerTitle": "CV Optimizer",
      "optimizerJobDescLabel": "Job Description",
      "optimizerJobDescriptionPlaceholder": "Paste the job description here...",
      "optimizerCVFileLabel": "Upload your CV (PDF or Word)",
      "optimizerFileSelected": "Selected: {{fileName}}",
      "optimizerOptimizeButton": "Optimize CV",
      "optimizerOptimizingButton": "Optimizing...",
      "optimizerResultTitle": "Optimized Results",
      "optimizerErrorAlertTitle": "Error!",
      "optimizerErrorGeneric": "Please provide both a job description and upload your CV.",
      "optimizerErrorFileType": "Please upload a PDF or Word document (.pdf, .doc, .docx).",
      "optimizerErrorFileSize": "File size exceeds 3 MB limit. Please upload a smaller file.",
      "optimizerErrorFileRead": "Failed to read the file. Please try another file.",
      "optimizerErrorFileProcess": "Error processing the file: {{message}}",
      "optimizerErrorOptimizeFailed": "Failed to optimize CV: {{message}}",
      "optimizerErrorOptimizeFailedGeneric": "Failed to optimize CV. Please try again later.",
      "optimizerPdfPreviewNoLatex": "No LaTeX code to generate preview.",
      "optimizerPdfPreviewErrorGeneric": "Failed to generate PDF preview: {{message}}",
      "optimizerCLNoContent": "No cover letter content available.",
      "optimizerCopySuccess": "✅ Copied to clipboard",
      "optimizerCopyFailed": "❌ Failed to copy",
      "optimizerGithubPullLabel": "Include GitHub Projects",
      "optimizerGithubLinkPlaceholder": "https://github.com/yourusername",
      "optimizerGithubNote": "We'll extract your public repositories",
      "optimizerErrorGithubLinkMissing": "Please provide your GitHub profile URL.",
      "optimizerErrorGithubLinkInvalid": "Please provide a valid GitHub profile URL starting with https://github.com/.",
      
      // Template Selection
      "templateSelectionTitle": "CV Template",
      "selectTemplate": "Select Template",
      "selectTemplateDescription": "Choose a template for your CV",
      "templateFetchError": "Failed to load templates",
      "loading": "Loading templates...",
      
      // Template Preview Modal
      "chooseThisTemplate": "Choose This Template",
      "cancel": "Cancel",
      
      // Template names and descriptions
      "template_classic_name": "Professional Standard",
      "template_classic_description": "Time-tested, clear, and structured format. Ideal for corporate roles and ATS compatibility.",
      "template_modern_name": "Contemporary Minimalist",
      "template_modern_description": "A stylish look with clean lines and modern typography. Perfect for innovative fields and balanced presentation.",
      "template_cool_name": "Impactful Emphasis",
      "template_cool_description": "A bold and memorable design that grabs attention with visual elements. Ideal for creative roles or when you want to stand out.",
      
      // CV Facts
      "cvFact1": "A professionally optimized CV can increase your interview chances by up to 60%.",
      "cvFact2": "Recruiters spend an average of only 7 seconds scanning a CV initially.",
      "cvFact3": "Including keywords from the job description can help your CV pass Applicant Tracking Systems (ATS).",
      "cvFact4": "76% of CVs are discarded for an unprofessional email address.",
      "cvFact5": "Using data and metrics to quantify your achievements can make your CV stand out.",
      "cvFact6": "A study showed that CVs with a clean, modern layout received 70% more callbacks.",
      "cvFact7": "Including relevant skills that match the job description increases your chances by 38%.",
      "cvFact8": "93% of recruiters check candidates' social media profiles during the hiring process.",
      "cvFact9": "Using action verbs like 'achieved', 'improved', and 'managed' strengthens your CV.",
      "cvFact10": "Customizing your CV for each application can increase your chances by up to 65%.",
      
      // Loading Overlay
      "loadingOverlayTitle": "Optimizing Your CV",
      "loadingOverlaySubtitle": "Please wait while we tailor your CV to the job description",
      "loadingOverlayFactTitle": "Did You Know?",
      "loadingOverlayFactDefault": "A well-optimized CV can significantly increase your chances of getting an interview.",
      
      // CV Optimizer Additional
      "optimizerTabCV": "CV",
      "optimizerTabCoverLetter": "Cover Letter",
      "optimizerShowDiffLabel": "Show differences",
      "optimizerDiffTitle": "Changes Made to Your CV",
      "optimizerOriginalCVTitle": "Original CV",
      "optimizerOptimizedCVTitle": "Optimized CV",
      "optimizerGeneratedCLTitle": "Generated Cover Letter",
      "optimizerCLInstruction": "You can use this as a template for your cover letter",
      "optimizerCLEditButton": "Edit",
      "optimizerCLPreviewButton": "Preview",
      "optimizerCopyButtonTitle": "Copy to clipboard",
      "optimizerCopyButton": "Copy",
      "optimizerCLPlaceholder": "Edit your cover letter here...",
      "optimizerDownloadNoContent": "No content available to download",
      "optimizerDownloadTooltipSave": "Save to your device",
      "optimizerDownloadCVButton": "Download CV",
      "optimizerDownloadCLButton": "Download Cover Letter",
      "optimizerSaveCLButton": "Save Changes",
      "optimizerGeneratingPreviewButton": "Generating...",
      "optimizerPreviewPDFButton": "Preview PDF",
      "optimizerPdfPreviewErrorTitle": "Preview Error",
      "optimizerPdfPreviewTitle": "PDF Preview",
      "optimizerPdfPreviewBrowserSupport": "Your browser may not display the PDF correctly. You can",
      "optimizerPdfPreviewDownloadLink": "download it",
      "optimizerPdfPreviewInstead": "instead"
    }
  },
  tr: {
    translation: {
      // App
      "appName": "CV İyileştirici",
      
      // Navbar
      "navDashboard": "Ana Sayfa",
      "navOptimizer": "İyileştirici",
      "navOptimize": "CV'yi İyileştir",
      "navLogin": "Giriş",
      
      // Dashboard
      "dashboardTitle": "CV'nizi İş Başarısı İçin Optimize Edin",
      "dashboardSubtitle": "Yapay zeka destekli aracımız, belirli iş tanımlarına göre profesyonel CV oluşturmanıza yardımcı olur",
      "dashboardFeature1Title": "İşe Özel Optimizasyon",
      "dashboardFeature1Desc": "CV'nizi yükleyin ve iş gereksinimlerine uygun kişiselleştirilmiş öneriler almak için bir iş tanımı yapıştırın.",
      "dashboardFeature2Title": "Profesyonel Şablonlar",
      "dashboardFeature2Desc": "İşverenlerin dikkatini çeken ve becerilerinizi öne çıkaran profesyonel olarak tasarlanmış şablonlar arasından seçim yapın.",
      "dashboardButton": "CV'mi Optimize Et",
      
      // CV Optimizer
      "optimizerTitle": "CV İyileştirici",
      "optimizerJobDescLabel": "İş Tanımı",
      "optimizerJobDescriptionPlaceholder": "İş tanımını buraya yapıştırın...",
      "optimizerCVFileLabel": "CV'nizi yükleyin (PDF veya Word)",
      "optimizerFileSelected": "Seçilen: {{fileName}}",
      "optimizerOptimizeButton": "CV'yi İyileştir",
      "optimizerOptimizingButton": "İyileştiriliyor...",
      "optimizerResultTitle": "İyileştirilmiş Sonuçlar",
      "optimizerErrorAlertTitle": "Hata!",
      "optimizerErrorGeneric": "Lütfen hem bir iş tanımı girin hem de CV'nizi yükleyin.",
      "optimizerErrorFileType": "Lütfen bir PDF veya Word belgesi yükleyin (.pdf, .doc, .docx).",
      "optimizerErrorFileSize": "Dosya boyutu 3 MB limitini aşıyor. Lütfen daha küçük bir dosya yükleyin.",
      "optimizerErrorFileRead": "Dosya okunamadı. Lütfen başka bir dosya deneyin.",
      "optimizerErrorFileProcess": "Dosya işlenirken hata oluştu: {{message}}",
      "optimizerErrorOptimizeFailed": "CV iyileştirilemedi: {{message}}",
      "optimizerErrorOptimizeFailedGeneric": "CV iyileştirilemedi. Lütfen daha sonra tekrar deneyin.",
      "optimizerPdfPreviewNoLatex": "Önizleme için LaTeX kodu yok.",
      "optimizerPdfPreviewErrorGeneric": "PDF önizlemesi oluşturulamadı: {{message}}",
      "optimizerCLNoContent": "Kapak mektubu içeriği mevcut değil.",
      "optimizerCopySuccess": "✅ Panoya kopyalandı",
      "optimizerCopyFailed": "❌ Kopyalanamadı",
      "optimizerGithubPullLabel": "GitHub Projelerini Dahil Et",
      "optimizerGithubLinkPlaceholder": "https://github.com/kullaniciadi",
      "optimizerGithubNote": "Herkese açık depolarınızı çekeceğiz",
      "optimizerErrorGithubLinkMissing": "Lütfen GitHub profil URL'nizi girin.",
      "optimizerErrorGithubLinkInvalid": "Lütfen https://github.com/ ile başlayan geçerli bir GitHub profil URL'si girin.",
      
      // Template Selection
      "templateSelectionTitle": "CV Şablonu",
      "selectTemplate": "Şablon Seç",
      "selectTemplateDescription": "CV'niz için bir şablon seçin",
      "templateFetchError": "Şablonlar yüklenemedi",
      "loading": "Şablonlar yükleniyor...",
      
      // Template Preview Modal
      "chooseThisTemplate": "Bu Şablonu Seç",
      "cancel": "İptal",
      
      // Template names and descriptions
      "template_classic_name": "Profesyonel Standart",
      "template_classic_description": "Zamanla test edilmiş, net ve yapılandırılmış format. Kurumsal roller ve ATS uyumluluğu için ideal.",
      "template_modern_name": "Çağdaş Minimalist",
      "template_modern_description": "Temiz çizgiler ve modern tipografi ile şık bir görünüm. İnovatif alanlar ve dengeli sunum için mükemmel.",
      "template_cool_name": "Etkileyici Vurgu",
      "template_cool_description": "Görsel elemanlarla dikkat çeken, cesur ve akılda kalıcı bir tasarım. Yaratıcı rollerde veya fark yaratmak istediğinizde ideal.",
      
      // CV Facts
      "cvFact1": "Profesyonel olarak optimize edilmiş bir CV, mülakat şansınızı %60'a kadar artırabilir.",
      "cvFact2": "İşe alım uzmanları bir CV'yi ilk incelemede ortalama sadece 7 saniye harcarlar.",
      "cvFact3": "İş tanımından anahtar kelimeleri dahil etmek, CV'nizin Başvuru Takip Sistemlerinden (ATS) geçmesine yardımcı olabilir.",
      "cvFact4": "CV'lerin %76'sı profesyonel olmayan bir e-posta adresi nedeniyle elenir.",
      "cvFact5": "Başarılarınızı ölçmek için veri ve metrikleri kullanmak CV'nizi öne çıkarabilir.",
      "cvFact6": "Bir çalışma, temiz, modern düzene sahip CV'lerin %70 daha fazla geri dönüş aldığını gösterdi.",
      "cvFact7": "İş tanımıyla eşleşen ilgili becerileri dahil etmek şansınızı %38 artırır.",
      "cvFact8": "İşe alım uzmanlarının %93'ü işe alım sürecinde adayların sosyal medya profillerini kontrol eder.",
      "cvFact9": "'Başardım', 'geliştirdim' ve 'yönettim' gibi eylem fiilleri kullanmak CV'nizi güçlendirir.",
      "cvFact10": "CV'nizi her başvuru için özelleştirmek şansınızı %65'e kadar artırabilir.",
      
      // Loading Overlay
      "loadingOverlayTitle": "CV'niz İyileştiriliyor",
      "loadingOverlaySubtitle": "CV'nizi iş tanımına göre özelleştirirken lütfen bekleyin",
      "loadingOverlayFactTitle": "Biliyor muydunuz?",
      "loadingOverlayFactDefault": "İyi optimize edilmiş bir CV, mülakat alma şansınızı önemli ölçüde artırabilir.",
      
      // CV Optimizer Additional
      "optimizerTabCV": "CV",
      "optimizerTabCoverLetter": "Kapak Mektubu",
      "optimizerShowDiffLabel": "Farkları Göster",
      "optimizerDiffTitle": "CV'nize Yapılan Değişiklikler",
      "optimizerOriginalCVTitle": "Orijinal CV",
      "optimizerOptimizedCVTitle": "İyileştirilmiş CV",
      "optimizerGeneratedCLTitle": "Oluşturulan Kapak Mektubu",
      "optimizerCLInstruction": "Bu, kapak mektubunuz için bir şablon olarak kullanabilirsiniz",
      "optimizerCLEditButton": "Düzenle",
      "optimizerCLPreviewButton": "Önizle",
      "optimizerCopyButtonTitle": "Panoya Kopyala",
      "optimizerCopyButton": "Kopyala",
      "optimizerCLPlaceholder": "Kapak mektubunuzu burada düzenleyin...",
      "optimizerDownloadNoContent": "İçerik mevcut değil",
      "optimizerDownloadTooltipSave": "Cihaza Kaydet",
      "optimizerDownloadCVButton": "CV'yi İndir",
      "optimizerDownloadCLButton": "Kapak Mektubunu İndir",
      "optimizerSaveCLButton": "Değişiklikleri Kaydet",
      "optimizerGeneratingPreviewButton": "Oluşturuluyor...",
      "optimizerPreviewPDFButton": "PDF Önizleme",
      "optimizerPdfPreviewErrorTitle": "Önizleme Hatası",
      "optimizerPdfPreviewTitle": "PDF Önizleme",
      "optimizerPdfPreviewBrowserSupport": "Tarayıcınız PDF'yi doğru şekilde görüntüleyemeyebilir. Bunu",
      "optimizerPdfPreviewDownloadLink": "indirebilirsiniz",
      "optimizerPdfPreviewInstead": "yerine"
    }
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    supportedLngs: ['tr', 'en'], // Supported languages
    fallbackLng: 'en', // Fallback language if detection fails
    lng: 'en', // Default language
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Order of language detection methods
      caches: ['localStorage'], // Cache the selected language in localStorage
    },
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    react: {
      useSuspense: true // Use Suspense for loading translations
    }
  });

export default i18n;
