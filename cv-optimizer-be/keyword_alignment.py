#keyword_alignment.py
"""
Anahtar-kelime eşleşmesi & skor hesabı
-------------------------------------
• Tamamen saf-Python regex tokenizasyonu → NLTK 'punkt' bağımlılığı yok.
• NLTK yalnızca stop-list için kullanılıyor (stopwords).
"""

from __future__ import annotations
import re, json
from collections import Counter
from typing import List, Tuple, Set, Dict

import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer


# ────────────────────────────────────────────────────────────
#  İlk çalıştırmada yalnızca stop-list’i indir
# ────────────────────────────────────────────────────────────
try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords", quiet=True)

_STOP = set(stopwords.words("english"))


# -----------------------------------------------------------
#  Basit, hızlı, bağımsız tokenizasyon
# -----------------------------------------------------------
_TOKEN_RE = re.compile(r"[A-Za-z]{3,}")          # ≥3 harfli alfabe token

def _clean_tokens(text: str) -> List[str]:
    """lowercase + regex + stop-word filtresi"""
    return [
        m.group(0).lower()
        for m in _TOKEN_RE.finditer(text)
        if m.group(0).lower() not in _STOP
    ]


def extract_keywords(text: str, top_k: int = 50) -> List[str]:
    """En sık geçen top_k kelimeyi döndürür."""
    tokens = _clean_tokens(text)
    freq   = Counter(tokens)
    return [w for w, _ in freq.most_common(top_k)]


def _match_score(a: Set[str], b: Set[str]) -> Tuple[float, Set[str]]:
    inter = a & b
    return (len(inter) / len(b) if b else 0.0), inter


def cosine_similarity(text1: str, text2: str) -> float:
    vec = TfidfVectorizer().fit_transform([text1, text2])
    return (vec * vec.T).toarray()[0, 1]     # .A → .toarray()


def analyze_cv_alignment(original_cv: str,
                         optimized_cv: str,
                         job_description: str,
                         top_k: int = 50) -> Dict[str, object]:

    job_kw  = set(extract_keywords(job_description, top_k))
    orig_kw = set(extract_keywords(original_cv,    top_k))
    opt_kw  = set(extract_keywords(optimized_cv,   top_k))

    orig_score, orig_match = _match_score(orig_kw, job_kw)
    opt_score,  opt_match  = _match_score(opt_kw,  job_kw)

    return {
        "job_keywords"     : sorted(job_kw),
        "original_matches" : sorted(orig_match),
        "optimized_matches": sorted(opt_match),
        "added_keywords"   : sorted(opt_match - orig_match),
        "removed_keywords" : sorted(orig_match - opt_match),
        "original_score"   : round(orig_score * 100, 2),
        "optimized_score"  : round(opt_score  * 100, 2),
        # ekstra metrik
        "cosine_original"  : round(cosine_similarity(original_cv,  job_description) * 100, 2),
        "cosine_optimized" : round(cosine_similarity(optimized_cv, job_description) * 100, 2),
    }


# -----------------------------------------------------------
#  Hızlı CLI testi (opsiyonel)
# -----------------------------------------------------------
if __name__ == "__main__":
    j = "Looking for a Python developer with strong Django and REST API skills."
    o = "Experienced Java and C++ engineer. Built microservices."
    n = "Developed RESTful APIs with Django and Flask. Strong Python background."
    import pprint; pprint.pprint(analyze_cv_alignment(o, n, j))
