import openai
import PyPDF2
import json
import os
import traceback



def extract_text_from_pdf(pdf_path):
    """PDF dosyasından metin çıkarır"""
    with open(pdf_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_cv_data(text):
    """Metni JSON formatına dönüştürür"""
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system",
             "content": "You are a helpful assistant that converts CV text to structured JSON format."},
            {"role": "user", "content": f"Convert the following CV text into JSON:\n\n{text}"}
        ],
        temperature=0.5
    )

    json_str = response.choices[0].message.content
    json_str = json_str.replace("```json", "").replace("```", "").strip()

    try:
        json_data = json.loads(json_str)
    except json.JSONDecodeError:
        json_data = {
            "raw_response": json_str
        }
    return json_data

def PDFtoJSON(pdf_path):
    """PDF dosyasını JSON formatına çevirir"""
    try:
        print(f"PDF'ten JSON'a dönüşüm başladı: {pdf_path}")
        
        if not os.path.exists(pdf_path):
            print(f"HATA: PDF dosyası bulunamadı: {pdf_path}")
            raise FileNotFoundError(f"PDF dosyası bulunamadı: {pdf_path}")
            
        print(f"PDF dosya boyutu: {os.path.getsize(pdf_path)} bayt")
        
        # PDF içeriğini oku
        text = extract_text_from_pdf(pdf_path)
        if not text:
            print("HATA: PDF'ten metin çıkarılamadı")
            raise ValueError("PDF'ten metin çıkarılamadı")
            
        print(f"PDF'ten çıkarılan metin uzunluğu: {len(text)} karakter")
        print(f"Metin örneği: {text[:200]}...")
        
        # PDF içeriğini JSON'a dönüştür
        cv_data = extract_cv_data(text)
        
        # JSON dosyasını kaydet
        with open('cv.json', 'w', encoding='utf-8') as f:
            json.dump(cv_data, f, ensure_ascii=False, indent=2)
            print("CV verileri başarıyla JSON'a kaydedildi")
            
        return cv_data
        
    except Exception as e:
        print(f"PDFtoJSON işlemi hatası: {str(e)}")
        print("Detaylı hata bilgisi:")
        traceback.print_exc()
        raise
