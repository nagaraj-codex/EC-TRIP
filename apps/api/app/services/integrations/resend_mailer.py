import os
import httpx

async def send_itinerary_email(to_email: str, park_name: str, visit_date: str, visit_score: float):
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print(f"[FALLBACK MAILER] Sending to {to_email}: Best day for {park_name} is {visit_date} (Score: {visit_score})")
        return
        
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    html_content = f"<h2>Your QueueCut Itinerary</h2><p>Park: {park_name}</p><p>Optimal Date: {visit_date}</p><p>Visit Score: {visit_score}</p>"
    
    payload = {
        "from": "QueueCut <noreply@queuecut.com>",
        "to": [to_email],
        "subject": f"Your QueueCut Itinerary for {park_name}",
        "html": html_content
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            await client.post(url, headers=headers, json=payload)
        except Exception as e:
            print(f"Failed to send email: {e}")
