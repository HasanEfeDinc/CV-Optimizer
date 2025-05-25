# CV-Optimizer

CV-Optimizer is an AI-powered web application that helps users generate personalized resumes and cover letters tailored to specific job descriptions. Developed as a capstone project, the system integrates LinkedIn and GitHub data, applies prompt engineering techniques, and uses OpenAI's GPT-4 to produce bilingual LaTeX-based documents.

## 🚀 Features

- ✨ **AI-Driven Resume & Cover Letter Generation**  
  Uses GPT-4 to tailor CVs and cover letters based on job descriptions.

- 🌐 **LinkedIn & GitHub Data Extraction**  
  Dynamically parses public data to enrich project sections and technical skills.

- 🧠 **Prompt Engineering**  
  Job-specific context is used to guide GPT outputs via structured prompts.

- 🖥️ **Frontend** – React  
  - Interactive form inputs  
  - PDF preview and download  
  - Template selector  

- ⚙️ **Backend** – Flask  
  - Integrates with OpenAI API (GPT-4)  
  - Processes JSON and LaTeX templates  
  - Generates bilingual `.pdf` outputs (EN + TR)

- 📄 **Document Output** – LaTeX  
  - Well-formatted professional CVs and letters  
  - PDF export with multilingual support

## 🛠️ Tech Stack

- Frontend: React, JavaScript, CSS
- Backend: Flask, Python
- AI: OpenAI GPT-4 API
- Parsing: JSON, REST APIs (GitHub, LinkedIn)
- Output: LaTeX, PDF

## 📌 How It Works

1. User uploads their CV in JSON format.
2. Enters a job description.
3. System fetches external data from LinkedIn/GitHub.
4. GPT-4 processes everything and fills in the LaTeX template.
5. Final CV and Cover Letter are generated as a bilingual PDF.

## 📂 Project Structure (Simplified)

cv-optimizer/
│
├── backend/
│ ├── api.py # Flask server and API routes
│ ├── LatexConverter.py # LaTeX + JSON + LLM integration
│
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── services.js/ # API calls
│ │ └── CVOptimizer.js # Main entry point
│
├── linkedin_data.json # Sample LinkedIn parsed data
├── github_repos.json # Sample GitHub parsed data
├── CV.json # Sample GitHub parsed data
├── job_Description.json # Sample GitHub parsed data

## 🎓 Academic Context

This project was developed as a graduation capstone project focused on practical AI integration into career tools. It highlights the use of LLMs in document generation, job matching, and data-driven personalization.
