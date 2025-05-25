import openai
import json



def jobDetails_extraction(text):
    response = openai.ChatCompletion.create(
        model='gpt-4o',
        messages=[
            {
                'role': 'system',
                'content': "You are a helpful assistant that converts given Job Details text to structured JSON format."
            },
            {
                'role': 'user',
                'content': f"Identify the key details from a job description and company overview to create a structured JSON output. Focus on extracting the most crucial and concise information that would be most relevant for tailoring a resume to this specific job.:\n\n{text}"
            }
        ],
        temperature=0.5
    )
    json_str = response.choices[0].message.content
    json_str = json_str.replace("```json", "").replace("```", "").strip()
    try:
        json_data = json.loads(json_str)
    except json.JSONDecodeError:
        json_data = {"raw_response": json_str}
    file_path = "job_details.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)