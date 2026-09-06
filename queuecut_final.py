import uvicorn
import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import List

app = FastAPI(title="QueueCut Final MVP")

# --- In-Memory Cache (Redis Simulator) ---
cache_db = {}

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
    async def broadcast(self, msg: str):
        for ws in self.active:
            await ws.send_text(msg)

manager = ConnectionManager()

# --- Schemas ---
class VisitRequest(BaseModel):
    park_id: str
    target_date: str

# --- Endpoints ---
@app.post("/api/v1/recommend")
async def get_recommendation(req: VisitRequest):
    key = f"{req.park_id}_{req.target_date}"
    
    if key in cache_db:
        data = cache_db[key]
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

@app.post("/api/v1/trigger-alert")
async def trigger_live_alert():
    await manager.broadcast("⚠️ LIVE ALERT: Sudden crowd spike at Wonderla entrance. Route recalculated.")
    return {"status": "Alert sent"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Frontend UI ---
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
        
        // WebSocket
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        ws.onopen = () => document.getElementById('ws-dot').classList.replace('bg-red-500', 'bg-emerald-500');
        ws.onmessage = (e) => showToast(e.data);

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

@app.get("/")
async def serve_ui():
    return HTMLResponse(content=HTML_UI)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
