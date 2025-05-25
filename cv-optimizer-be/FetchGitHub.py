import base64
import requests
import json

def get_readme(owner, repo_name):
    """
    Fetches and decodes the README for a given repo.
    Returns the README in plain text if available, otherwise None.
    """
    readme_url = f"https://api.github.com/repos/{owner}/{repo_name}/readme"
    response = requests.get(readme_url)

    if response.status_code == 200:
        readme_data = response.json()
        content_encoded = readme_data.get("content")
        if content_encoded:
            content_decoded = base64.b64decode(content_encoded).decode("utf-8")
            return content_decoded
    return None


def get_repos_with_languages(profile_link):
    """
    Fetches all public repositories of a given GitHub profile (profile_link).
    Returns a list of dictionaries with repo name, description, language usage, and readme content.
    """
    username = profile_link.rstrip("/").split("/")[-1]
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"İstek başarısız oldu. Status code: {response.status_code}")
        return []

    repos = response.json()
    repo_list = []

    for repo in repos:
        repo_name = repo["name"]
        repo_description = repo.get("description", None)
        lang_url = repo["languages_url"]

        lang_response = requests.get(lang_url)
        if lang_response.status_code == 200:
            languages_data = lang_response.json()
            total_lines = sum(languages_data.values()) if languages_data else 0
            if total_lines > 0:
                language_percentages = {
                    lang: round((lines / total_lines) * 100, 1)
                    for lang, lines in languages_data.items()
                }
            else:
                language_percentages = {}
        else:
            language_percentages = {}

        readme_content = get_readme(username, repo_name)

        repo_info = {
            "Name": repo_name,
            "About": repo_description,
            "Languages": language_percentages,
            "Readme": readme_content
        }

        repo_list.append(repo_info)

    return repo_list


def save_to_json(data, filename="repos.json"):
    """
    Saves the given data (list of dictionaries) to a JSON file.
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    profile_url = "https://github.com/HasanEfeDinc"
    repositories = get_repos_with_languages(profile_url)

    save_to_json(repositories, "repos.json")

