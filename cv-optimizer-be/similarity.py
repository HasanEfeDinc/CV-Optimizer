#similarity.py
from __future__ import annotations

# 2)  Diğer kütüphaneler bundan sonra
import nltk
import json, pathlib, sys
from typing import Any, Dict, List

from LaTeXtoJSON import extract_cv_from_tex
from keyword_alignment import analyze_cv_alignment


# ----------------------------------------------------------
# Dosya yolları - ihtiyacına göre değiştir
# ----------------------------------------------------------
JOB_FILE        = pathlib.Path("keywords.json")
ORIG_CV_FILE    = pathlib.Path("cv.json")
OPTIMIZED_TEX   = pathlib.Path("optimized_cv.tex")
REPORT_FILE     = pathlib.Path("alignment_report.json")


# ----------------------------------------------------------
#  Yardımcı: JSON’ı okunabilir düz-metne indirger
# ----------------------------------------------------------
for resource in ("punkt", "stopwords"):
    try:
        nltk.data.find(f"tokenizers/{resource}")        # punkt
    except LookupError:
        nltk.download(resource, quiet=True)

def json_to_text(data: Any) -> str:
    """İç içe JSON sözlük/listelerini recursive düz-metne dönüştürür."""
    if isinstance(data, dict):
        return " ".join(json_to_text(v) for v in data.values())
    if isinstance(data, list):
        return " ".join(json_to_text(v) for v in data)
    return str(data)


def load_json(p: pathlib.Path) -> Any:
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        sys.exit(f"[HATA] {p} okunamadı: {e}")


# ----------------------------------------------------------
# 1) Dosyaları oku
# ----------------------------------------------------------
job_json        = load_json(JOB_FILE)
orig_cv_json    = load_json(ORIG_CV_FILE)

try:
    tex_source = OPTIMIZED_TEX.read_text(encoding="utf-8")
except Exception as e:
    sys.exit(f"[HATA] {OPTIMIZED_TEX} okunamadı: {e}")

# ----------------------------------------------------------
# 2) optimize edilmiş .tex → JSON
# ----------------------------------------------------------
print("• LaTeX’ten JSON’a dönüştürülüyor…")
opt_cv_json = extract_cv_from_tex(tex_source)

# ----------------------------------------------------------
# 3) Her şeyi düz-metne çevir
# ----------------------------------------------------------
job_text        = json_to_text(job_json)
original_text   = json_to_text(orig_cv_json)
optimized_text  = json_to_text(opt_cv_json)

# ----------------------------------------------------------
# 4) Anahtar-kelime eşleşmeleri
# ----------------------------------------------------------
print("• Keyword alignment analizi…")
report = analyze_cv_alignment(original_text,
                              optimized_text,
                              job_text,
                              top_k=50)

# ----------------------------------------------------------
# 5) Kaydet & göster
# ----------------------------------------------------------
REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2),
                       encoding="utf-8")

print("\n==== ALIGNMENT REPORT ====")
for k, v in report.items():
    print(f"{k:18}: {v}")
print(f"\n✓ Rapor {REPORT_FILE} dosyasına yazıldı.")
