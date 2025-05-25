from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import traceback
import os
import json
import tempfile
import base64
import subprocess
import sys
from pathlib import Path

from io import BytesIO
from flask import send_file, jsonify, request, after_this_request

from flask import after_this_request, send_file, jsonify
import tempfile, subprocess, os, shutil

# Mevcut modülleri import et
import JobDetailsExtractor as job
import CVtoJSON as CV
import KeywordExtractor as keyword
import LateXConverter as LateX
import linkedinScraper as scraper
import FetchGitHub as github_fetcher # Import the new module
import linkedinScraper as linkdin_scraper
import os # Ensure os is imported for path operations in LateXConverter

app = Flask(__name__)
CORS(app)  # Cross-origin isteklerine izin ver

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Returns the list of available CV templates"""
    try:
        templates_path = os.path.join(os.path.dirname(__file__), 'templates', 'templates.json')
        with open(templates_path, 'r', encoding='utf-8') as f:
            templates = json.load(f)
        
        return jsonify({
            'success': True,
            'templates': templates
        })
    except Exception as e:
        print(f"Template listing error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Unable to retrieve templates'
        }), 500

@app.route('/api/templates/<template_id>/preview', methods=['GET'])
def get_template_preview(template_id):
    """Returns the preview image for a specific template"""
    try:
        # Validate template_id to prevent directory traversal attacks
        if not template_id or not template_id.isalnum():
            return jsonify({
                'success': False,
                'message': 'Invalid template ID'
            }), 400
        
        # Find the template preview filename from templates.json
        preview_filename = None
        templates_path = os.path.join(os.path.dirname(__file__), 'templates', 'templates.json')
        try:
            with open(templates_path, 'r', encoding='utf-8') as f:
                templates = json.load(f)
                for template in templates:
                    if template["id"] == template_id:
                        preview_filename = template.get("preview")
                        break
        except Exception as e:
            print(f"Error reading templates.json: {str(e)}")
            
        if not preview_filename:
            return jsonify({
                'success': False,
                'message': 'Template preview not found'
            }), 404
            
        preview_path = os.path.join(os.path.dirname(__file__), 'templates', preview_filename)
        
        if not os.path.exists(preview_path):
            return jsonify({
                'success': False,
                'message': 'Template preview not found'
            }), 404
        
        return send_file(preview_path, mimetype='image/png')
    except Exception as e:
        print(f"Template preview error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Unable to retrieve template preview'
        }), 500

@app.route('/api/optimize', methods=['POST'])
def optimize_cv():
    temp_cv_path = None
    original_latex = ""  # Initialize original_latex
    github_projects = None # Initialize github_projects
    linkedin_projects = None # Initialize github_projects

    try:
        # Hata ayıklama için
        print("--- Başlangıç: CV Optimizasyon ---")
        
        # Frontend'den gelen verileri al
        data = request.json
        print(f"Gelen veri anahtarları: {data.keys() if data else 'Veri yok'}")
        
        job_description = data.get('jobDescription', '')
        github_link = data.get('githubLink') # Get the GitHub link
        linkedin_link = data.get('linkedinLink')
        template_id = data.get('templateId', 'classic')  # Get template ID with default as 'classic'
        print(f"İş tanımı uzunluğu: {len(job_description)}")
        print(f"GitHub Link: {github_link}") # Log the received link
        print(f"LinkedIn Link: {linkedin_link}")
        print(f"Template ID: {template_id}") # Log the template ID
        
        cv_content = data.get('cvContent')
        pdf_file = data.get('pdfFile')
        
        if cv_content:
            print("CV içeriği metin olarak alındı")
            try:
                with tempfile.NamedTemporaryFile(suffix='.tex', delete=False) as temp_cv:
                    temp_cv.write(cv_content.encode('utf-8'))
                    temp_cv_path = temp_cv.name
                    print(f"Geçici dosya oluşturuldu: {temp_cv_path}")
                original_latex = cv_content  # Original content is the input itself
            except Exception as e:
                print(f"Metin dosyası oluşturma hatası: {str(e)}")
                raise
                
        elif pdf_file:
            print("CV içeriği PDF olarak alındı")
            try:
                # Base64 kodlu PDF dosyasını çöz
                base64_data = pdf_file.get('base64Data', '')
                if not base64_data:
                    return jsonify({
                        'success': False,
                        'message': 'PDF dosyasının base64 verisi eksik'
                    }), 400
                
                try:
                    file_data = base64.b64decode(base64_data)
                    print(f"Base64 decode başarılı, veri boyutu: {len(file_data)} bayt")
                except Exception as decode_error:
                    print(f"Base64 decode hatası: {str(decode_error)}")
                    return jsonify({
                        'success': False,
                        'error': str(decode_error),
                        'message': 'PDF dosyasını decode ederken hata oluştu'
                    }), 400
                
                with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_cv:
                    temp_cv.write(file_data)
                    temp_cv_path = temp_cv.name
                    print(f"Geçici PDF dosyası oluşturuldu: {temp_cv_path}")
                    
                # Dosyanın var olduğunu kontrol et
                if not os.path.exists(temp_cv_path):
                    return jsonify({
                        'success': False,
                        'message': 'Geçici dosya oluşturulamadı'
                    }), 500
                    
                print(f"Dosya boyutu: {os.path.getsize(temp_cv_path)} bayt")
                
                # If input is PDF, there's no original LaTeX code
                original_latex = ""  # Explicitly set to empty for PDF input
                
            except Exception as e:
                print(f"PDF dosyası oluşturma hatası: {str(e)}")
                raise
        else:
            return jsonify({
                'success': False,
                'message': 'CV içeriği veya dosyası sağlanmadı'
            }), 400
        
        # Dosya uzantısını kontrol et
        file_ext = os.path.splitext(temp_cv_path)[1].lower()
        print(f"Dosya uzantısı: {file_ext}")

        # Fetch GitHub projects if link is provided
        if github_link:
            print(f"GitHub projeleri çekiliyor: {github_link}")
            try:
                github_projects = github_fetcher.get_repos_with_languages(github_link)
                # Save fetched projects (optional, good for debugging)
                github_fetcher.save_to_json(github_projects, "github_repos.json") 
                print(f"{len(github_projects)} adet GitHub projesi çekildi ve kaydedildi.")
            except Exception as gh_error:
                print(f"GitHub projeleri çekilirken hata oluştu: {str(gh_error)}")
                github_projects = None 

        if linkedin_link:
            print(f"LinkedIn projeleri çekiliyor: {linkedin_link}")
            try:
                # LinkedIn scraper’dan profili çekiyoruz
                linkedin_projects = linkdin_scraper.fetch_profile(linkedin_link)
                # JSON’a kaydediyoruz
                linkdin_scraper.saver(linkedin_projects)
                print(f"{len(linkedin_projects)} adet LinkedIn projesi çekildi ve kaydedildi.")
            except Exception as scrape_error:
                print(f"LinkedIn projeleri çekilirken hata oluştu: {scrape_error}")
                linkedin_projects = None 
        
        # İş ilanı bilgilerini çıkar ve kaydet
        print("İş ilanı bilgilerini çıkarma başladı")
        try:
            job.jobDetails_extraction(job_description)
            job_details_path = "job_details.json"
            print("İş ilanı bilgileri başarıyla çıkarıldı")
        except Exception as e:
            print(f"İş ilanı çıkarma hatası: {str(e)}")
            raise
        
        # Dosya içeriğini oku (PDF hariç)
        if file_ext != '.pdf':
            try:
                with open(temp_cv_path, 'r', encoding='utf-8') as f:
                    original_cv_content = f.read()
                    print(f"Orijinal CV içeriği okundu, {len(original_cv_content)} karakter")
            except UnicodeDecodeError:
                print("UTF-8 decode hatası, binary dosya olabilir")
                original_cv_content = ""
            except Exception as e:
                print(f"Dosya okuma hatası: {str(e)}")
                original_cv_content = ""
        else:
            original_cv_content = ""
        
        # Anahtar kelimeleri çıkar
        print("Anahtar kelime çıkarma başladı")
        try:
            keywords = keyword.extract_and_save_to_json(job_description, "keywords.json")
            print(f"Anahtar kelimeler çıkarıldı: {len(keywords) if keywords else 0} adet")
        except Exception as e:
            print(f"Anahtar kelime çıkarma hatası: {str(e)}")
            raise
        
        # CV'yi JSON'a çevir
        print(f"CV'yi JSON'a çevirme başladı, dosya türü: {file_ext}")
        cv_json_path = "cv.json"
        try:
            if file_ext == '.pdf':
                print("PDF'ten JSON dönüşümü başladı")
                CV.PDFtoJSON(temp_cv_path)
                print("PDF'ten JSON dönüşümü tamamlandı")
            elif file_ext in ['.doc', '.docx']:
                if hasattr(CV, 'WordToJSON'):
                    CV.WordToJSON(temp_cv_path)
                else:
                    raise ValueError("WordToJSON fonksiyonu tanımlanmamış. PDF dosyası kullanın.")
            else:
                raise ValueError(f"Desteklenmeyen dosya formatı: {file_ext}. Lütfen PDF veya Word dosyası yükleyin.")
        except Exception as e:
            print(f"CV JSON dönüşüm hatası: {str(e)}")
            raise
            
        # JSON dosyasının varlığını kontrol et
            if not os.path.exists(cv_json_path):
                print(f"HATA: {cv_json_path} dosyası oluşturulmamış")
                raise FileNotFoundError(f"{cv_json_path} dosyası bulunamadı")
            else:
                try:
                    with open(cv_json_path, 'r', encoding='utf-8') as f:
                        cv_json = json.load(f)
                        print(f"CV JSON dosyası okundu, içerik: {str(cv_json)[:100]}...")
                except Exception as json_error:
                    print(f"CV JSON okuma hatası: {str(json_error)}")
                    raise
        
        # Motivation yazısı oluştur
        print("Motivasyon metni oluşturma başladı")
        try:
            short_motivation = LateX.generate_short_motivation(cv_json_path, job_details_path)
            print(f"Motivasyon metni oluşturuldu: {short_motivation[:50]}...")
        except Exception as e:
            print(f"Motivasyon metni oluşturma hatası: {str(e)}")
            short_motivation = "Highly motivated professional with relevant skills and experience."
        
        # Cover letter oluştur
        print("Kapak mektubu oluşturma başladı")
        try:
            cover_letter_plain_text = LateX.generate_plain_cover_letter(cv_json_path, job_details_path)
            print(f"Kapak mektubu oluşturuldu: {cover_letter_plain_text[:50]}...")
        except Exception as e:
            print(f"Kapak mektubu oluşturma hatası: {str(e)}")
            cover_letter_plain_text = "Cover letter content could not be generated due to an error."
        
        # LaTeX'e çevir ve optimize et
        print("LaTeX optimizasyonu başladı")
        output_tex = "optimized_cv.tex"
        try:
            # Get the template file path based on the template_id
            template_filename = "template.tex"  # Default to the root template.tex file
            templates_path = os.path.join(os.path.dirname(__file__), 'templates', 'templates.json')
            try:
                with open(templates_path, 'r', encoding='utf-8') as f:
                    templates = json.load(f)
                    for template in templates:
                        if template["id"] == template_id:
                            template_filename = template["filename"]
                            template_path = os.path.join(os.path.dirname(__file__), 'templates', template_filename)
                            break
                    else:
                        # If template not found, use default
                        template_path = os.path.join(os.path.dirname(__file__), "template.tex")
            except Exception as template_error:
                print(f"Template selection error: {str(template_error)}")
                # Continue with default template
                template_path = os.path.join(os.path.dirname(__file__), "template.tex")
            
            # Pass github_projects data to the function
            LateX.merge_json_template_with_llm(
                json_path=cv_json_path, 
                template_path=template_path, # Use the selected template
                output_tex=output_tex,
                short_motivation=short_motivation,
                github_data=github_projects, # Pass the fetched GitHub data
                linkedin_data=linkedin_projects,
                model="gpt-4o", 
                temperature=0.8
            )
            print("LaTeX optimizasyonu tamamlandı")
        except Exception as e:
            print(f"LaTeX optimizasyonu hatası: {str(e)}")
            raise
        
        # Optimize edilmiş CV'yi oku
        try:
            with open(output_tex, 'r', encoding='utf-8') as f:
                optimized_cv = f.read()
                print(f"Optimize edilmiş CV okundu, {len(optimized_cv)} karakter")
        except Exception as e:
            print(f"Optimize edilmiş CV okuma hatası: {str(e)}")
            raise
        
        # Geçici dosyayı temizle
        if temp_cv_path and os.path.exists(temp_cv_path):
            try:
                os.unlink(temp_cv_path)
                print(f"Geçici dosya silindi: {temp_cv_path}")
            except Exception as e:
                print(f"Geçici dosya silme hatası: {str(e)}")
        
        # Sonuçları gönder
        print("İşlem başarıyla tamamlandı, sonuçlar gönderiliyor")
        return jsonify({
            'success': True,
            'latexCode': optimized_cv,
            'originalLatexCode': original_latex, 
            'coverLetterPlainText': cover_letter_plain_text,
            'message': 'CV başarıyla optimize edildi'
        })
    
    except Exception as e:
        print(f"HATA OLUŞTU: {str(e)}")
        print("Detaylı hata bilgisi:")
        traceback.print_exc()
        
        # Geçici dosyayı temizlemeyi dene
        if temp_cv_path and os.path.exists(temp_cv_path):
            try:
                os.unlink(temp_cv_path)
                print(f"Hata sonrası geçici dosya silindi: {temp_cv_path}")
            except:
                pass
        
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'CV optimizasyonu sırasında bir hata oluştu'
        }), 500


@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        req        = request.json or {}
        latex_code = req.get("latexCode")
        file_type  = req.get("fileType", "cv")     # "cv" / "coverletter"

        if not latex_code:
            return jsonify(error="LaTeX kodu gelmedi"), 400

        tmp_dir = tempfile.mkdtemp()               # elle aç, sonra biz sileceğiz
        tex_path = os.path.join(tmp_dir, f"{file_type}.tex")
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_code)

        # iki kez pdflatex
        cmd = ["pdflatex", "-halt-on-error", "-interaction=nonstopmode",
               f"{file_type}.tex"]
        for _ in range(2):
            p = subprocess.run(cmd, cwd=tmp_dir,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT)
            if p.returncode:
                log = p.stdout.decode(errors="ignore")
                shutil.rmtree(tmp_dir, ignore_errors=True)
                print("pdflatex hata:\n", log)
                return jsonify(error="LaTeX derlemesi başarısız", log=log), 500

        pdf_path = os.path.join(tmp_dir, f"{file_type}.pdf")

        # yanıt döndükten sonra temp klasörünü sil
        @after_this_request
        def _cleanup(resp):
            shutil.rmtree(tmp_dir, ignore_errors=True)
            return resp

        return send_file(pdf_path, mimetype="application/pdf")

    except Exception:
        print(traceback.format_exc())
        return jsonify(error="Sunucu PDF oluştururken beklenmeyen hata"), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
