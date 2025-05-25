const API_BASE_URL = 'http://localhost:5000/api';

export const getTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};

export const getTemplatePreviewUrl = (templateId) => {
  return `${API_BASE_URL}/templates/${templateId}/preview`;
};

export const optimizeCV = async (jobDescription, fileData) => {
  try {
    console.log(`Preparing API request for ${fileData.fileName}`);
    
    // Format data exactly as backend expects
    const requestData = {
  jobDescription,
  pdfFile: {
    fileName: fileData.fileName,
    fileType: fileData.fileType,
    base64Data: fileData.base64Data
  },
  githubLink: fileData.githubLink || null,
  linkedinLink: fileData.linkedinLink || null, // eksik olan buydu
  templateId: fileData.templateId || 'classic'
};

    console.log("Making API request with data:", requestData); // Log the full request data
    
    // Use a longer timeout for large files or slow processing
    const controller = new AbortController();
    // Increase timeout to 180 seconds (180000 milliseconds)
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 second timeout 
    
    try {
      const response = await fetch(`${API_BASE_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Get full text response for debugging
      const responseText = await response.text();
      console.log(`API response status: ${response.status}`);
      console.log(`API response preview: ${responseText.substring(0, 200)}...`);
      
      // Try parsing as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok || !data.success) {
        console.error("API error response:", data);
        throw new Error(data.message || data.error || "Unknown server error");
      }
      
      return data;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timed out after 3 minutes. The file might be too large or the server is very busy."); // Updated error message
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("API error details:", error);
    throw error;
  }
};

export const generatePDF = async (latexCode, fileType = 'cv') => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latexCode, fileType }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
