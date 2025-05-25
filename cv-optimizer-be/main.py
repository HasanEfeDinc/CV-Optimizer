import JobDetailsExtractor as job
import CVtoJSON as CV
import KeywordExtractor as keyword
import linkedinScraper as scraper
import LateXConverter as LateX

job_summary ="""
Job Summary:
We are looking for a highly skilled Game Developer to join our team as a LLM Data trainer. In this unique role, you will validate and enhance AI-generated datasets across multiple programming domains, with a focus on providing high-quality labeled data for AI models. If you have a strong background in game development using C# and Godot, and a passion for AI, this could be the perfect opportunity for you.

Key Responsibilities:
Review AI-generated queries for accuracy, clarity, and relevance across various programming languages and frameworks.
Validate and correct misleading or incorrect AI-generated responses.
Ensure grammatical accuracy, logical structure, and coherence in queries.
Categorize queries based on difficulty level and topic area.
Provide constructive feedback to refine AI query generation processes.
Collaborate with data scientists, machine learning engineers, and AI trainers to improve dataset quality.
Maintain consistency in annotation standards and validation methodologies.

Required Skills and Qualifications:
Bachelors or Master’s degree in Computer Science, Software Engineering, AI, or a related field.
4-7 years of experience in at least one of the listed domains.
Strong knowledge of Godot Engine (v4) and C# scripting.
Experience in game development and physics simulation.
Strong analytical skills and attention to detail.
Excellent communication and documentation skills.
Ability to review and annotate game AI-related datasets.

Preferred Qualifications:
Passion for AI development and improving large language model training datasets.
Ability to work independently and as part of a collaborative team.
Strong problem-solving abilities and a logical mindset.")
"""

CV.PDFtoJSON("ColakTahaYasir_CV.pdf")
#job.jobDetails_extraction(job_summary)
#keyword.extract_and_save_to_json(job_summary, "keywords.json")
#scraper.scrape_linkedin_experience_and_projects()
LateX.merge_json_template_with_llm(json_path="cv.json", template_path="template.tex", output_tex="final_cv.tex",model="gpt-4o", temperature=0.8)








