import os
import httpx
from typing import Dict, Any

async def validate_recaptcha(token: str) -> Dict[str, Any]:
    """
    Validate tokens with Google verification endpoint. 
    Enforce risk threshold: reject submissions if score < 0.5.
    """
    secret_key = os.environ.get("RECAPTCHA_SECRET_KEY")
    if not secret_key:
        # If no key is configured, pass validation safely for dev mode
        return {"success": True, "score": 1.0, "action": "dev_bypass"}
        
    url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {
        "secret": secret_key,
        "response": token
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            # API expects form-encoded data
            response = await client.post(url, data=payload)
            response.raise_for_status()
            data = response.json()
            
            success = data.get("success", False)
            score = data.get("score", 0.0)
            
            # Enforce risk threshold
            if success and score < 0.5:
                success = False
                
            return {
                "success": success,
                "score": score,
                "action": data.get("action")
            }
        except Exception:
            return {"success": False, "score": 0.0}
