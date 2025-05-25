# tex_to_json.py
import openai
import json
import re



def extract_cv_from_tex(tex_source: str,
                        model: str = "gpt-4o",
                        temperature: float = 0.4) -> dict:
    """
    Optimize edilmiş CV’nin .tex içeriğini alır, gpt-4o’ya özetlettirerek
    makul bir JSON şemasına çevirir.  Dönüş değeri Python dict’tir.
    """

    # LaTeX’ten büyük blokları (komutlar, comment, vs.) temizle – LLM’e
    # göndereceğimiz metni biraz küçültür.
    def _strip_latex(s: str) -> str:
        s = re.sub(r"\\begin\{.*?}.*?\\end\{.*?}", " ", s, flags=re.S)  # env’ler
        s = re.sub(r"%.*?$", " ", s, flags=re.M)                        # yorumlar
        s = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*])?(?:\{[^}]*})?", " ", s)  # komutlar
        return re.sub(r"\s+", " ", s).strip()

    plain_text = _strip_latex(tex_source)

    prompt = (
        "Below is the plain text of a résumé (originally generated from LaTeX). "
        "EXTRACT the candidate’s structured information in **valid JSON**. "
        "Use English KEYS (name, email, phone, summary, education, experience, "
        "projects, skills) but **keep every VALUE exactly in the original language**; "
        "do NOT translate anything. Do NOT wrap the answer in markdown fences."
        f"\n\nRESUME TEXT:\n\"\"\"\n{plain_text}\n\"\"\""
    )

    resp = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system",
             "content": "You are an expert CV parser that outputs concise JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature
    )

    content = resp.choices[0].message.content.strip()
    # LLM bazen ```json bloklarına sarabilir, ayıkla:
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        # JSON parse edilemezse ham yanıtı tut
        data = {"raw_response": content}

    return data
