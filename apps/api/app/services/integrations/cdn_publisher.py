import os
import httpx
import base64
from typing import Dict, Any

async def publish_to_cdn(file_path: str, content: str, message: str) -> Dict[str, Any]:
    """
    Commits and publishes daily-crowd-price.json and weather-now.json directly
    to the GitHub repo branch to trigger Vercel static edge distribution.
    """
    token = os.environ.get("GITHUB_TOKEN")
    owner = os.environ.get("GITHUB_REPO_OWNER")
    repo = os.environ.get("GITHUB_REPO_NAME")
    
    if not token or not owner or not repo:
        return {"success": False, "error": "Missing GitHub credentials"}
        
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            # First, check if file exists to get the SHA (required for updates)
            sha = None
            get_response = await client.get(url, headers=headers)
            if get_response.status_code == 200:
                sha = get_response.json().get("sha")
                
            payload = {
                "message": message,
                "content": encoded_content,
                "branch": "main"
            }
            if sha:
                payload["sha"] = sha
                
            put_response = await client.put(url, headers=headers, json=payload)
            put_response.raise_for_status()
            return {"success": True, "data": put_response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
