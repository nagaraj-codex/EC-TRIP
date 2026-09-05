import httpx
import os

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY", "dummy_secret_key")

async def verify_recaptcha(token: str) -> bool:
    """
    Secures the crowdsourced ground-truth pipeline using reCAPTCHA v3.
    """
    url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {
        "secret": RECAPTCHA_SECRET_KEY,
        "response": token
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=payload)
        result = response.json()

    # ReCaptcha v3 requires a score, usually > 0.5 is considered human
    if result.get("success") and result.get("score", 0) >= 0.5:
        return True
    return False
