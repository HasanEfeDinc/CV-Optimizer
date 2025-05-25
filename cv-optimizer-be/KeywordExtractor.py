# keyword_extractor.py
import json, re, unicodedata
import openai

openai.api_key = "YOUR_API_KEY"

# ———————————————————————————————————————————————————————————
#  Yardımcı: LLM’e kısa, kesin ve tekrar-eğitici prompt
# ———————————————————————————————————————————————————————————
_PROMPT_TMPL = """
You will be given a job description or résumé fragment.

**Task**
1. Identify the most specific, *technical* concepts, tools, skills,
   programming languages, frameworks, model-names, cloud services,
   AND important role words (e.g. “data-scientist”).
2. Omit vague words (e.g. “team”, “project”, “good”, “experience”).
3. Return **ONLY** a comma-separated list – *lower-case*,
   spaces → hyphens, no duplicates, max {k} items.

Text:
\"\"\"{text}\"\"\"
"""

# ———————————————————————————————————————————————————————————
def _post_process(raw: str, max_k: int) -> list[str]:
    """LLM çıktısını normalize et, çakışanları ayıkla."""
    # virgül + satır sonu + tire bazlı split
    toks = re.split(r"[,\n]+", raw)
    norm = []
    seen = set()

    for t in toks:
        t = t.strip().lower()
        if not t:
            continue
        # türkçe/İngilizce fark etmez – noktalama & accent temizle
        t = unicodedata.normalize("NFKD", t)
        t = re.sub(r"[^\w\s\-+.#]", "", t)          # harf / rakam / - _ . + #
        t = re.sub(r"\s+", "-", t)                  # boşluk → -
        if t not in seen:
            seen.add(t)
            norm.append(t)
        if len(norm) == max_k:
            break
    return norm


def extract_keywords(text: str,
                     model: str = "gpt-4o",
                     temperature: float = 0.0,
                     max_keywords: int = 30) -> list[str]:
    """
    • İstemi özelleştirir          (→ tek tip çıktılar)
    • Sıfır sıcaklık              (→ tutarlı sonuç)
    • Son-işlemde filtre / normalizasyon
    """
    prompt = _PROMPT_TMPL.format(text=text.strip()[:6_000],   # ↯ token tasarrufu
                                 k=max_keywords)

    resp = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system",
             "content": "You are an expert NLP assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature,
        top_p=0.9,
    )

    raw = resp.choices[0].message.content
    return _post_process(raw, max_keywords)


def extract_and_save_to_json(text: str,
                             file_path: str = "keywords.json",
                             **kw) -> list[str]:
    kws = extract_keywords(text, **kw)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(kws, f, ensure_ascii=False, indent=2)
    return kws
