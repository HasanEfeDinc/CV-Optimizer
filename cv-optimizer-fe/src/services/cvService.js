import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Corrected port to 5000

export const cvService = {
    uploadCV: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/upload-cv`, formData);
        return response.data;
    },

    analyzeJob: async (jobDescription) => {
        const response = await axios.post(`${API_URL}/analyze-job`, {
            text: jobDescription
        });
        return response.data;
    },

    optimizeCV: async (cvText, jobDescription) => {
        try {
            console.log('Sending request:', { cv_text: cvText, job_description: jobDescription });
            
            const response = await axios.post(
                `${API_URL}/optimize`,
                {
                    cv_text: cvText,
                    job_description: jobDescription
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Received response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Optimization error:', error.response?.data || error);
            throw error;
        }
    }
};
