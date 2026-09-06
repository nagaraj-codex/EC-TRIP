import os
import httpx
from typing import Dict, Any

async def dispatch_alert(device_token: str, title: str, body: str) -> Dict[str, Any]:
    """
    Dispatch push notifications when top ride queue wait drops below 20 minutes 
    or severe weather alerts occur using Firebase Cloud Messaging.
    """
    project_id = os.environ.get("FIREBASE_PROJECT_ID")
    # In a real scenario, you'd use google-auth to get a bearer token based on FIREBASE_SERVICE_ACCOUNT_PATH
    # For this architecture mockup, we simulate the HTTP v1 payload
    bearer_token = os.environ.get("FIREBASE_BEARER_TOKEN", "mock_token")
    
    if not project_id:
        return {"success": False, "error": "FIREBASE_PROJECT_ID not set"}
        
    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "message": {
            "token": device_token,
            "notification": {
                "title": title,
                "body": body
            }
        }
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            # We wrap this in try-except to avoid crashing if token is mock
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
