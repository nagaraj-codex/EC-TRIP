import uvicorn
import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse, Response
import sys
from pydantic import BaseModel
from typing import List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# --- 1. BACKEND INITIALIZATION ---
app = FastAPI(title="QueueCut v3.0 | PWA & Telemetry Demo")

# --- 2. IN-MEMORY CACHE (Simulating Redis) ---
simulated_redis_cache = {}

# --- 3. WEBSOCKET CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- 4. DATA SCHEMAS ---
class VisitRequest(BaseModel):
    park_id: str
    target_date: str

# --- 5. CORE ENDPOINTS ---

@app.post("/api/v1/recommend")
async def get_recommendation(req: VisitRequest):
    cache_key = f"{req.park_id}_{req.target_date}"
    
    # Check Cache First
    if cache_key in simulated_redis_cache:
        print(f"[CACHE HIT] Serving data for {cache_key} instantly.")
        data = dict(simulated_redis_cache[cache_key])
        data["source"] = "Redis Cache (0ms latency)"
        return data

    # Simulate API Processing Time (Miss)
    print(f"[CACHE MISS] Fetching fresh data from 30-API Hub for {cache_key}...")
    await asyncio.sleep(1.5) 
    
    fresh_data = {
        "date": req.target_date,
        "visit_score": 88,
        "crowd_level": "Low",
        "weather": "Sunny",
        "fasttrack_verdict": "SKIP (Save ₹1,500)",
        "source": "Live External APIs (1.5s latency)"
    }
    
    # Store in Cache
    simulated_redis_cache[cache_key] = fresh_data
    return fresh_data

@app.post("/api/v1/trigger-alert")
async def trigger_live_alert():
    # This endpoint proves the server can push data to clients unprompted
    alert_msg = "⛈️ WEATHER ALERT: Sudden rain detected near Wonderla. Move to indoor rides!"
    await manager.broadcast(alert_msg)
    return {"status": "Alert broadcasted"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- 6. PWA REQUIREMENTS (Manifest & Service Worker) ---
@app.get("/manifest.json")
async def get_manifest():
    return JSONResponse(content={
        "name": "QueueCut v3.0",
        "short_name": "QueueCut",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0f172a",
        "theme_color": "#0f172a",
        "description": "Intelligent Park Optimization",
        "icons": [{"src": "https://cdn-icons-png.flaticon.com/512/808/808476.png", "sizes": "512x512", "type": "image/png"}]
    })

@app.get("/sw.js")
async def get_service_worker():
    sw_code = """
    self.addEventListener('install', (e) => {
        console.log('[Service Worker] Installed');
        e.waitUntil(caches.open('queuecut-v3').then((cache) => cache.addAll(['/'])));
    });
    self.addEventListener('fetch', (e) => {
        e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
    });
    """
    return Response(content=sw_code, media_type="application/javascript")

# --- 7. FRONTEND WEB INTERFACE (HTML/JS) ---
FRONTEND_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QueueCut v3.0</title>
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#0f172a">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0f172a; color: white; font-family: sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .toast { transition: opacity 0.5s, transform 0.5s; }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4">

    <!-- Toast Notification Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2"></div>

    <div class="glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-blue-400">QueueCut v3.0</h1>
                <p class="text-gray-400 text-sm">PWA + Redis Cache + WebSockets</p>
            </div>
            <!-- Live Indicator -->
            <div class="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                <div id="ws-status" class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-xs text-gray-300">Telemetry</span>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <input type="date" id="date" class="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500">
            </div>
            
            <button onclick="analyzeVisit()" id="analyze-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors">
                Analyze Date (Test Cache)
            </button>

            <button onclick="simulateAlert()" class="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 font-bold py-3 rounded transition-colors mt-2">
                Simulate Live Alert (Test WebSockets)
            </button>
        </div>

        <!-- Results Section -->
        <div id="results" class="mt-8 hidden border-t border-gray-700 pt-6">
            <span id="data-source" class="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded mb-4 inline-block"></span>
            <div class="grid grid-cols-2 gap-4 mt-2">
                <div class="bg-gray-800 p-3 rounded">
                    <p class="text-xs text-gray-400">Overall Score</p>
                    <p id="res-score" class="text-2xl font-bold text-white">--</p>
                </div>
                <div class="bg-gray-800 p-3 rounded">
                    <p class="text-xs text-gray-400">FastTrack</p>
                    <p id="res-ft" class="text-sm font-bold text-green-400 mt-1">--</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 1. Service Worker Registration (PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log("Service Worker Registered - PWA Ready"));
        }

        // 2. WebSocket Connection (Live Telemetry)
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        
        ws.onopen = () => {
            document.getElementById('ws-status').classList.replace('bg-red-500', 'bg-emerald-500');
        };

        ws.onmessage = (event) => {
            showToast(event.data);
        };

        // 3. Application Logic
        document.getElementById('date').valueAsDate = new Date();

        async function analyzeVisit() {
            const btn = document.getElementById('analyze-btn');
            btn.innerText = "Processing...";
            
            const payload = {
                park_id: "wonderla-chennai",
                target_date: document.getElementById('date').value
            };

            const response = await fetch('/api/v1/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            document.getElementById('res-score').innerText = data.visit_score + "/100";
            document.getElementById('res-ft').innerText = data.fasttrack_verdict;
            document.getElementById('data-source').innerText = "⚡ " + data.source;
            document.getElementById('results').classList.remove('hidden');
            
            btn.innerText = "Analyze Date (Test Cache)";
        }

        async function simulateAlert() {
            await fetch('/api/v1/trigger-alert', { method: 'POST' });
        }

        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = "bg-red-500/90 backdrop-blur text-white px-4 py-3 rounded shadow-lg border border-red-400 flex items-center gap-3 transform translate-x-full transition-transform duration-300";
            toast.innerHTML = `<span class="text-sm font-bold">${message}</span>`;
            
            container.appendChild(toast);
            
            // Slide in
            setTimeout(() => toast.classList.remove('translate-x-full'), 10);
            
            // Remove after 4 seconds
            setTimeout(() => {
                toast.classList.add('opacity-0');
                setTimeout(() => toast.remove(), 500);
            }, 4000);
        }
    </script>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    return FRONTEND_HTML

# --- 8. SERVER EXECUTION ---
if __name__ == "__main__":
    print("Starting QueueCut v3.0 PWA Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
