import sys
import os
import asyncio
import time
from typing import List, Optional
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add apps/api to path so production engine and services are loaded
api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "apps", "api"))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# Import production FastAPI application
from app.main import app
from app.api.ws import manager as ws_telemetry_manager

# Remove default JSON root route so React SPA can be served at /
app.router.routes = [
    r for r in app.router.routes 
    if not (hasattr(r, 'path') and r.path == '/' and getattr(r, 'tags', None) == ['System'])
]

# --- In-Memory Cache (Redis Simulator for Quick Demo) ---
cache_db = {}

# --- Schemas for Quick Demo ---
class VisitRequest(BaseModel):
    park_id: str
    target_date: str

# --- Quick Demo Endpoints ---
@app.post("/api/v1/recommend", tags=["Demo Simulator"])
async def get_recommendation(req: VisitRequest):
    key = f"{req.park_id}_{req.target_date}"
    
    if key in cache_db:
        data = dict(cache_db[key])
        data["source"] = "Redis Cache (0ms latency)"
        return data

    await asyncio.sleep(1.2) # Simulate 30-API Hub Processing
    
    fresh_data = {
        "visit_score": 92,
        "crowd_level": "Low (Optimized)",
        "weather": "28°C, Clear Skies",
        "fasttrack_verdict": "SKIP (Save ₹1,500/ticket)",
        "source": "30-API Live Intelligence (1.2s latency)"
    }
    cache_db[key] = fresh_data
    return fresh_data

@app.post("/api/v1/trigger-alert", tags=["Demo Simulator"])
async def trigger_live_alert():
    alert_payload = {
        "type": "telemetry_alert",
        "title": "Sudden Crowd Alert",
        "message": "⚠️ LIVE ALERT: Sudden crowd spike at Wonderla entrance. Route recalculated.",
        "level": "warning",
        "park_id": "wonderla-chennai",
        "badge": "LIVE"
    }
    await ws_telemetry_manager.broadcast(alert_payload)
    return {"status": "Alert sent", "payload": alert_payload}

# --- Quick Demo HTML UI ---
HTML_UI = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QueueCut | Final MVP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0f172a; color: white; font-family: system-ui; }
        .glass-panel { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2"></div>
    <div class="glass-panel p-8 rounded-2xl w-full max-w-md relative">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">QueueCut</h1>
                <p class="text-slate-400 text-sm">Intelligent Park Optimization</p>
            </div>
            <div class="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <div id="ws-dot" class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-xs text-slate-300">Live</span>
            </div>
        </div>
        <div class="space-y-4">
            <select id="park" class="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500">
                <option value="wonderla">Wonderla Chennai</option>
                <option value="mgm">MGM Dizzee World</option>
                <option value="blackthunder">Black Thunder</option>
            </select>
            <input type="date" id="date" class="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500">
            <button onclick="analyze()" id="btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors shadow-lg shadow-blue-500/30">
                Analyze Date
            </button>
            <button onclick="simulatePush()" class="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-2 rounded transition-colors">
                Simulate Push Notification
            </button>
            <a href="/" class="block text-center text-xs text-blue-400 hover:underline pt-2">Switch to Full Production React UI &rarr;</a>
        </div>
        <div id="results" class="mt-6 border-t border-slate-700 pt-6 animate-fade-in hidden">
            <span id="source" class="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded mb-4 block text-center"></span>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p class="text-xs text-slate-400">Score</p>
                    <p id="r-score" class="text-2xl font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p class="text-xs text-slate-400">Crowd</p>
                    <p id="r-crowd" class="text-lg font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 col-span-2">
                    <p class="text-xs text-slate-400">Weather</p>
                    <p id="r-weather" class="text-sm font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 col-span-2">
                    <p class="text-xs text-slate-400">FastTrack Recommendation</p>
                    <p id="r-ft" class="text-sm font-bold text-emerald-400">--</p>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.getElementById('date').valueAsDate = new Date();
        const ws = new WebSocket(`ws://${window.location.host}/api/v1/telemetry/ws`);
        ws.onopen = () => document.getElementById('ws-dot').classList.replace('bg-red-500', 'bg-emerald-500');
        ws.onmessage = (e) => {
            try {
                const d = JSON.parse(e.data);
                showToast(d.message || JSON.stringify(d));
            } catch {
                showToast(e.data);
            }
        };

        async function analyze() {
            const btn = document.getElementById('btn');
            btn.innerText = "Analyzing 30 Data Points...";
            const res = await fetch('/api/v1/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ park_id: document.getElementById('park').value, target_date: document.getElementById('date').value })
            });
            const data = await res.json();
            document.getElementById('r-score').innerText = data.visit_score + "/100";
            document.getElementById('r-crowd').innerText = data.crowd_level;
            document.getElementById('r-weather').innerText = data.weather;
            document.getElementById('r-ft').innerText = data.fasttrack_verdict;
            document.getElementById('source').innerText = "⚡ " + data.source;
            document.getElementById('results').classList.remove('hidden');
            btn.innerText = "Analyze Date";
        }

        async function simulatePush() { await fetch('/api/v1/trigger-alert', { method: 'POST' }); }

        function showToast(msg) {
            const t = document.createElement('div');
            t.className = "bg-amber-500/90 text-white px-4 py-3 rounded-lg shadow-xl border border-amber-400 text-sm font-bold";
            t.innerText = msg;
            document.getElementById('toast-container').appendChild(t);
            setTimeout(() => t.remove(), 5000);
        }
    </script>
</body>
</html>
"""

@app.get("/quick-demo", response_class=HTMLResponse, tags=["Demo Simulator"])
async def serve_quick_demo():
    return HTMLResponse(content=HTML_UI)

# --- Mount React Production Frontend (Single Host Unified Engine) ---
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "apps", "web", "dist"))

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Static root files: favicon, robots, manifest, service-worker
    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        fav = os.path.join(DIST_DIR, "favicon.ico")
        return FileResponse(fav) if os.path.exists(fav) else HTMLResponse("", status_code=204)

    @app.get("/manifest.webmanifest", include_in_schema=False)
    async def manifest():
        return FileResponse(os.path.join(DIST_DIR, "manifest.webmanifest"))

    @app.get("/registerSW.js", include_in_schema=False)
    async def register_sw():
        return FileResponse(os.path.join(DIST_DIR, "registerSW.js"), media_type="application/javascript")

    @app.get("/sw.js", include_in_schema=False)
    async def sw():
        return FileResponse(os.path.join(DIST_DIR, "sw.js"), media_type="application/javascript")

    # Serve SPA index.html for all page routes
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_spa(full_path: str):
        if full_path.startswith(("api", "docs", "openapi.json", "redoc", "ws", "health")):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(DIST_DIR, "index.html")
        return FileResponse(index_file)
else:
    @app.get("/", response_class=HTMLResponse, tags=["System"])
    async def serve_fallback_ui():
        return HTMLResponse(content=HTML_UI)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
