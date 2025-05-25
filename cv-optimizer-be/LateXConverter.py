import openai
import json
import os


def merge_json_template_with_llm(
    json_path="cv.json",
    template_path="/cv-optimizer-be/template.tex",
    output_tex="final_cv.tex",
    model="gpt-4o",
    temperature=0.8,
    motivation_text=None,
    short_motivation=None,
    github_data=None,
    linkedin_data=None
):
    # Read CV data
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)

    # Inject LinkedIn projects directly into the CV JSON
    if linkedin_data and isinstance(linkedin_data, dict) and linkedin_data.get("projects"):
        cv_data["linkedin_projects"] = linkedin_data["projects"]

    cv_data_str = json.dumps(cv_data, ensure_ascii=False)

    # Read LaTeX template
    script_dir = os.path.dirname(__file__)
    absolute_template_path = os.path.join(script_dir, os.path.basename(template_path))
    if not os.path.exists(absolute_template_path):
        print(f"Warning: Template file not found at {absolute_template_path}. Trying relative path '{template_path}'.")
        absolute_template_path = template_path
        if not os.path.exists(absolute_template_path):
            raise FileNotFoundError(f"LaTeX template file not found at specified paths: {template_path}")
    with open(absolute_template_path, "r", encoding="utf-8") as t:
        template_str = t.read()

    # Prepare GitHub data string if available
    github_data_str = ""
    if github_data:
        github_data_str = f"""
            Additionally, here is data fetched from the user's public GitHub repositories:
            ```json
            {json.dumps(github_data, ensure_ascii=False, indent=2)}
            ```
            If the CV JSON data does not already contain a 'Projects' section, or if you deem it appropriate to add a separate section, create a new LaTeX section titled 'GitHub Projects' using this data. List the repository name, description (if available), and primary languages. Format it similarly to other project/experience sections in the template. If a 'Projects' section already exists in the CV JSON, try to integrate relevant GitHub projects there or create the separate 'GitHub Projects' section.
            """

    # Prepare LinkedIn data string if available (legacy; JSON injection also provided)
    linkedin_data_str = ""
    if linkedin_data and isinstance(linkedin_data, dict) and linkedin_data.get("projects"):
        linkedin_data_str = f"""
            Additionally, here is the list of projects fetched from LinkedIn:
            ```json
            {json.dumps(linkedin_data['projects'], ensure_ascii=False, indent=2)}
            ```
            ALWAYS add a `\\section{{LinkedIn Projects}}` at the end. For each entry, include:
            - Title (`title`)
            - Date range (`starts_at`–`ends_at`) if present
            - Description (`description`)
            Format each as you did in other sections.
        """

    # Construct the user prompt
    prompt_parts = [
        f"Below is the LaTeX template:\n```latex\n{template_str}\n```",
        f"Below is the CV data in JSON format:\n{cv_data_str}\n"
        f"Below is the Linkedin data in JSON format:\n{linkedin_data}"
        f"Below is the Github data in JSON format:\n{github_data}\n"
    ]
    if short_motivation:
        prompt_parts.append(f"Please include this short motivation text in the Motivation section:\n```\n{short_motivation}\n```")
    elif motivation_text:
        prompt_parts.append(f"Also, please use the following motivation text for the Motivation section:\n```\n{motivation_text}\n```")
    if github_data_str:
        prompt_parts.append(github_data_str)
    if linkedin_data_str:
        prompt_parts.append(linkedin_data_str)
    prompt_parts.append("Please merge them following the rules. Output only the final LaTeX code.")
    user_prompt = "\n\n".join(prompt_parts)

    # System prompt with original rules preserved
    system_prompt = (
        "You are an expert LaTeX CV generator. You are given a LaTeX CV template and CV data in JSON format.\n"
        "Rules:\n"
        "1) If the LaTeX template has a \\section that does NOT exist in the JSON, remove that section entirely.\n"
        "2) If the JSON has data for a section not in the template, add a new \\section at the end.\n"
        "3) For shared sections, replace the template content with the user's data.\n"
        "4) If JSON is missing certain fields (like Twitter, address, date), remove the corresponding line(s) in the LaTeX.\n"
        "5) For social media links, if user provided them, show the actual link text; if not provided, remove that link.\n"
        "6) For each project or experience, if a date is missing, remove the date line.\n"
        "7) Preserve the LaTeX style, spacing, commands, and overall document structure exactly.\n"
        "8) Output ONLY the resulting LaTeX code, with no extra commentary.\n"
        "9) Do not allow lines in 'Projects' or other sections to overflow the page boundary; wrap or break lines if necessary.\n"
        "10) Keep the date (or location/time range) aligned to the right side, on the same horizontal line as the project/job title.\n"
        "11) Ensure text does not run off the page; if needed, shorten or wrap lines neatly.\n"
        "12) If GitHub project data is provided, create a 'GitHub Projects' section (or integrate into existing 'Projects') and only put the repositories which are relevant in it using the repository name, description, and languages, formatted similarly to other list items in the CV.\n"
        "13) Eğer kullanıcı Linkedin hesabının linkini paylaştıysa CV ye bir 'Linkedin Projects' adlı bir section ekle ve altına da eğer linkedin_data boş değilse kullanıcının verdiği iş tanımıyla alaklı projeleri ekle \n"
        "14) Make sure github links are correctly linked to the project repository.\n"
        "15) Always put the motivation text in the beginning of the document.\n"
        "16) In the Experience section, include **all** entries from the JSON’s `experience` array exactly, preserving both their count (4) and original order. Do not drop or merge any of them.\n"
        "17) Bil ki Github projeleri ile Linkedin projeleri farklı şeyler kullanıcıgithub veya linkedin verirse kesinlikle ekle aynı anda 2 sini de verirse 2 başlık da olmalı\n"
        "18) Bu kurallar dışında kafana göre bir başlık eklememelisin\n"
        "19) Experiences Kısmı katiyen aynı aktarılmalı 4 tane deneyim varsa 4 ü de yeni cv de olucak\n"
        "20) Yazılar sayfanın A4 ün dısına taşmamalı kesinlikle alt satıra geçmeli\n"
        "21) Eğer kullancının verdiği CV de 'CERTIFICATIONS & AWARDS' kısmı yoksa yeni cv de de olmamalı kesinlikle\n"
        "22) Eğer kullancının verdiği CV de 'REFERENCES' kısmı yoksa yeni cv de de olmamalı kesinlikle\n"
        "22)!!!!!!!!!!Bu çok önemli eğer kullanıcı hem github hem linkedin verdi ise ikisi de başlık olarak cv de bulunmalı \n"

    )

    # Call OpenAI
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=temperature
    )

    final_latex = response.choices[0].message.content.strip()
    if final_latex.startswith("```latex"):
        final_latex = final_latex.replace("```latex", "").strip()
    if final_latex.startswith("```"):
        final_latex = final_latex.replace("```", "").strip()
    if final_latex.endswith("```"):
        final_latex = final_latex[:-3].strip()

    with open(output_tex, "w", encoding="utf-8") as f:
        f.write(final_latex)

    return final_latex

def generate_short_motivation(json_path, job_details_path):
    """
    Generate a short motivation statement (2-3 lines) for CV
    
    Args:
        json_path: Path to CV JSON file
        job_details_path: Path to job details JSON file
        
    Returns:
        str: A short motivation text
    """
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    
    with open(job_details_path, "r", encoding="utf-8") as f:
        job_details = json.load(f)
    
    system_prompt = (
        "You are a professional CV consultant. Create a very short motivation statement (2-3 lines) that expresses "
        "enthusiasm and passion for the position. The text should be concise and demonstrate the candidate's "
        "interest in the specific role and company."
    )
    
    user_prompt = f"""
    CV Information:
    {json.dumps(cv_data, ensure_ascii=False, indent=2)}
    
    Job Details:
    {json.dumps(job_details, ensure_ascii=False, indent=2)}
    
    Create a very short motivation text (2-3 lines maximum) showing enthusiasm for this specific position.
    The text will be included in the CV's motivation section.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def generate_motivation(json_path, job_details_path):
    """
    Generates a personalized motivation letter using CV data and job details
    
    Args:
        json_path: Path to the CV JSON file
        job_details_path: Path to the job details JSON file
    
    Returns:
        str: Generated motivation letter
    """
    # Read CV and job details
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    
    with open(job_details_path, "r", encoding="utf-8") as f:
        job_details = json.load(f)
    
    system_prompt = (
        "You are a job application consultant. Using a candidate's CV information and job details, "
        "create a personalized and impactful motivation letter. "
        "The letter should highlight the candidate's skills and experiences that make them suitable for the position."
    )
    
    user_prompt = f"""
    CV Information:
    {json.dumps(cv_data, ensure_ascii=False, indent=2)}
    
    Job Details:
    {json.dumps(job_details, ensure_ascii=False, indent=2)}
    
    Create a personalized motivation letter. This letter should explain why the candidate is suitable for this position, 
    how their skills will be beneficial, and why they want to work at this company.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def generate_cover_letter(json_path, job_details_path):
    """
    Generates a professional cover letter using CV data and job details
    
    Args:
        json_path: Path to the CV JSON file
        job_details_path: Path to the job details JSON file
    
    Returns:
        str: Generated cover letter text
    """
    # Read CV and job details
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    
    with open(job_details_path, "r", encoding="utf-8") as f:
        job_details = json.load(f)
    
    system_prompt = (
        "You are a job application consultant. Using a candidate's CV information and job details, "
        "create a professional cover letter. The cover letter should emphasize the candidate's qualifications, "
        "show alignment with the company culture, and explain why they are suitable for this position."
    )
    
    user_prompt = f"""
    CV Information:
    {json.dumps(cv_data, ensure_ascii=False, indent=2)}
    
    Job Details:
    {json.dumps(job_details, ensure_ascii=False, indent=2)}
    
    Create a professional cover letter. This cover letter should include the following elements:
    1. Appropriate salutation
    2. Reason for applying to the position
    3. Candidate's key skills and experiences related to the position
    4. Emphasis on interest specific to the company and position
    5. Request for an interview and contact information
    6. Professional closing
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def generate_plain_cover_letter(json_path, job_details_path):
    """
    Generate a plain text cover letter (not LaTeX format)
    
    Args:
        json_path: Path to CV JSON file
        job_details_path: Path to job details JSON file
        
    Returns:
        str: Plain text cover letter
    """
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    
    with open(job_details_path, "r", encoding="utf-8") as f:
        job_details = json.load(f)
    
    system_prompt = (
        "You are a professional cover letter writer. Create a formal cover letter in plain text format "
        "(not LaTeX). The cover letter should be well-structured with appropriate sections like greeting, "
        "introduction, body paragraphs, and closing. Tailor it to the specific job position. "
        "Fill as much as you can in the cover letter, however if you need to use any placeholders enclosed in square brackets, like [Your Name], [Company Name], [Specific Skill Mentioned in Job Ad], [Date], [Your Contact Information], etc., for any information the user needs to fill in."
    )
    
    user_prompt = f"""
    CV Information:
    {json.dumps(cv_data, ensure_ascii=False, indent=2)}
    
    Job Details:
    {json.dumps(job_details, ensure_ascii=False, indent=2)}
    
    Create a professional cover letter in plain text format (NOT LaTeX).
    Include appropriate sections like greeting, introduction, why the candidate is suitable, 
    closing paragraph, and signature. 
    Use bracketed placeholders like [Your Specific Qualification] or [Company's Recent Achievement] for details if necessary.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()

def create_cover_letter(json_path, job_details_path, output_tex="cover_letter.tex", model="gpt-4o", temperature=0.7):
    """
    Creates a LaTeX file for the cover letter
    
    Args:
        json_path: Path to the CV JSON file
        job_details_path: Path to the job details JSON file
        output_tex: Path to the output LaTeX file
    """
    # Read CV data
    with open(json_path, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    
    # Generate cover letter content
    cover_letter_content = generate_cover_letter(json_path, job_details_path)
    
    # LaTeX template for the cover letter
    cover_letter_template = """
    \\documentclass[11pt, a4paper]{letter}
    \\usepackage[utf8]{inputenc}
    \\usepackage{geometry}
    \\usepackage{hyperref}
    \\usepackage{color}
    \\usepackage{xcolor}
    
    \\geometry{left=1.25in, top=1in, right=1.25in, bottom=1in}
    
    \\hypersetup{colorlinks=true, urlcolor=blue}
    
    \\begin{document}
    
    \\begin{letter}{To Whom It May Concern}
    
    \\opening{Dear Sir/Madam,}
    
    %COVER_LETTER_CONTENT%
    
    \\closing{Sincerely,}
    
    \\vspace{1cm}
    
    %FULL_NAME%
    
    \\end{letter}
    
    \\end{document}
    """
    
    # Insert content into the LaTeX template
    full_name = cv_data.get("personal_information", {}).get("name", "Full Name")
    cover_letter_latex = cover_letter_template.replace("%COVER_LETTER_CONTENT%", cover_letter_content)
    cover_letter_latex = cover_letter_latex.replace("%FULL_NAME%", full_name)
    
    # Save to file
    with open(output_tex, "w", encoding="utf-8") as f:
        f.write(cover_letter_latex)
    
    return cover_letter_latex

if __name__ == "__main__":
    # Example usage if run directly (might need adjustment based on actual file locations)
    script_dir = os.path.dirname(__file__)
    cv_json = os.path.join(script_dir, "cv.json")
    template_tex = os.path.join(script_dir, "template.tex") # Assuming template is in the same dir
    output_cv = os.path.join(script_dir, "final_cv.tex")
    
    # Example with GitHub data (load from file if previously saved)
    github_json_path = os.path.join(script_dir, "github_repos.json")
    github_example_data = None
    if os.path.exists(github_json_path):
         with open(github_json_path, "r", encoding="utf-8") as ghf:
              github_example_data = json.load(ghf)

    linkedin_json_path = os.path.join(script_dir, "linkedin_data.json") 
    linkedin_example_data = None
    if os.path.exists(linkedin_json_path):
         with open(linkedin_json_path, "r", encoding="utf-8") as ghf:
              linkedin_example_data = json.load(ghf)

    merge_json_template_with_llm(
        json_path=cv_json, 
        template_path=template_tex, 
        output_tex=output_cv, 
        model="gpt-4o", 
        temperature=0.7,
        github_data=github_example_data, # Pass example data if available
        linkedin_data=linkedin_example_data
    )