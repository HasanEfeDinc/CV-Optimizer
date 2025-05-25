import os
import json
import time
import requests


API_ENDPOINT = "https://nubela.co/proxycurl/api/v2/linkedin"
HEADERS = {"Authorization": f"Bearer {PROXYCURL_API_KEY}"}

def fetch_profile(url: str) -> dict:
    print(f"Fetching LinkedIn data from: {url}")
    """Verilen URL'ye ait LinkedIn profil verisini çeker."""
    retry = 0
    while retry < 5:
        resp = requests.get(API_ENDPOINT, headers=HEADERS, params={"url": url}, timeout=60)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            time.sleep(2 ** retry)
            retry += 1
            continue
        raise RuntimeError(f"Proxycurl hata {resp.status_code}: {resp.text}")

def saver(data: dict, output_file: str = "linkedin_data.json") -> None:
    """LinkedIn'den çekilen veriyi 'projects' anahtarına göre sadeleştirerek kaydeder."""
    projects = data.get("accomplishment_projects", [])
    extracted = {
        "projects": projects,
    }
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(extracted, f, ensure_ascii=False, indent=4)
    print(f"[LinkedIn] Veri {output_file} dosyasına yazıldı.")

if __name__ == "__main__":
    linkedin_url = 'https://www.linkedin.com/in/hasan-efe-din%C3%A7-215352256/'
    profile_data = fetch_profile(linkedin_url)
    saver(profile_data)
