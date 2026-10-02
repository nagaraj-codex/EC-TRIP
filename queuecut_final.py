#!/usr/bin/env python3
"""
QueueCut Unified Production Engine & Telemetry Hub (v3.0)
=========================================================
All-in-one orchestrator serving:
- FastAPI Intelligence Hub & 30-API Aggregation Engine
- Realtime WebSocket Telemetry Broadcaster
- In-Memory Redis Caching Simulator
- Production React PWA Single Page Application (SPA)
- Interactive Quick Demo Simulator (/quick-demo)
"""

import argparse
import os
import sys
from pathlib import Path

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ROOT_DIR = Path(__file__).resolve().parent
API_DIR = ROOT_DIR / "apps" / "api"
WEB_DIR = ROOT_DIR / "apps" / "web"
for path in [str(API_DIR), str(ROOT_DIR)]:
    if path not in sys.path:
        sys.path.insert(0, path)

if os.name == "nt":
    VENV_PYTHON = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
else:
    VENV_PYTHON = ROOT_DIR / ".venv" / "bin" / "python"

if not VENV_PYTHON.exists():
    VENV_PYTHON = Path(sys.executable)

# UTF-8 stdout configuration for Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# =========================================================
# 1. System Path Configuration & Environment Setup
# =========================================================
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
API_DIR = os.path.abspath(os.path.join(ROOT_DIR, "apps", "api"))
WEB_DIR = os.path.abspath(os.path.join(ROOT_DIR, "apps", "web"))
DIST_DIR = os.path.abspath(os.path.join(WEB_DIR, "dist"))

for path in [API_DIR, ROOT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# =========================================================
# 2. Production Engine Integration
# =========================================================
from app.main import app
from app.api.ws import manager as ws_telemetry_manager
from app.api.routes.recommendation import get_recommendation as canonical_recommendation
from app.api.routes.recommendation import QueueCutRequest

# Remove the default API root route so the React SPA owns "/".
app.router.routes = [
    r for r in app.router.routes if not (hasattr(r, "path") and r.path == "/")
]

# =========================================================
# 3. Quick Demo Overlay & Redis Cache Simulator
# =========================================================
cache_db = {}


class VisitRequest(BaseModel):
    park_id: str
    target_date: str
    priority: str = "Best Balanced"


@app.post("/api/v1/recommend", tags=["Demo Simulator"])
async def get_recommendation(req: VisitRequest):
    """
    Rapid single-day crowd and FastTrack recommendation simulator
    with zero-latency in-memory Redis cache simulation.
    """
    request = QueueCutRequest(
        park_id=req.park_id,
        candidate_dates=[req.target_date],
        priority=req.priority,
    )
    return await canonical_recommendation(request, BackgroundTasks())


@app.post("/api/v1/trigger-alert", tags=["Demo Simulator"])
async def trigger_live_alert():
    """
    Webhook trigger to broadcast instant live crowd alerts across all
    connected WebSocket subscribers (PWA, mobile, and web dashboards).
    """
    raise HTTPException(
        status_code=503,
        detail="Live crowd alerts are unavailable because no verified live crowd provider is configured.",
    )


# =========================================================
# 4. Standalone Lightweight Demo UI
# =========================================================
HTML_UI = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QueueCut | Live Demo Simulator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #020617; color: #f8fafc; font-family: system-ui, sans-serif; }
        .glass-panel { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2"></div>
    <div class="glass-panel p-8 rounded-2xl w-full max-w-md relative">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">QueueCut</h1>
                <p class="text-slate-400 text-xs">Intelligent Crowd & FastTrack Optimization</p>
            </div>
            <div class="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <div id="ws-dot" class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-xs text-slate-300">Live</span>
            </div>
        </div>
        <div class="space-y-4">
            <select id="park" class="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white outline-none focus:border-blue-500">
                <option value="wonderla-chennai">Wonderla Chennai</option>
                <option value="mgm-dizzee-chennai">MGM Dizzee World</option>
                <option value="black-thunder-coimbatore">Black Thunder Coimbatore</option>
            </select>
            <input type="date" id="date" class="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white outline-none focus:border-blue-500">
            <button onclick="analyze()" id="btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                Analyze Date
            </button>
            <button onclick="simulatePush()" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2.5 rounded-xl transition-colors border border-slate-700">
                Simulate Push Notification
            </button>
            <a href="/" class="block text-center text-xs text-blue-400 hover:underline pt-2 font-medium">Launch Full Production React Dashboard &rarr;</a>
        </div>
        <div id="results" class="mt-6 border-t border-slate-700 pt-6 animate-fade-in hidden">
            <span id="source" class="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded mb-4 block text-center border border-emerald-500/20"></span>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                    <p class="text-xs text-slate-400 font-medium">Visit Score</p>
                    <p id="r-score" class="text-2xl font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                    <p class="text-xs text-slate-400 font-medium">Crowd Level</p>
                    <p id="r-crowd" class="text-lg font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 col-span-2">
                    <p class="text-xs text-slate-400 font-medium">Weather Telemetry</p>
                    <p id="r-weather" class="text-sm font-bold text-white">--</p>
                </div>
                <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 col-span-2">
                    <p class="text-xs text-slate-400 font-medium">FastTrack Verdict</p>
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


# =========================================================
# 5. Production React PWA Frontend Integration
# =========================================================
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    data_dir = os.path.join(DIST_DIR, "data")
    if os.path.exists(data_dir):
        app.mount("/data", StaticFiles(directory=data_dir), name="data")

    @app.get("/", response_class=FileResponse, include_in_schema=False)
    async def serve_root():
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return HTMLResponse(
            "<h1>QueueCut Backend Online</h1><p>Frontend DIST folder not found. Please build the React app with 'npm run build'.</p>"
        )

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        fav = os.path.join(DIST_DIR, "favicon.ico")
        return (
            FileResponse(fav)
            if os.path.exists(fav)
            else HTMLResponse("", status_code=204)
        )

    @app.get("/manifest.webmanifest", include_in_schema=False)
    async def manifest():
        return FileResponse(os.path.join(DIST_DIR, "manifest.webmanifest"))

    @app.get("/registerSW.js", include_in_schema=False)
    async def register_sw():
        return FileResponse(
            os.path.join(DIST_DIR, "registerSW.js"), media_type="application/javascript"
        )

    @app.get("/sw.js", include_in_schema=False)
    async def sw():
        return FileResponse(
            os.path.join(DIST_DIR, "sw.js"), media_type="application/javascript"
        )

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_spa(full_path: str):
        # Exclude internal and API endpoints from SPA fallback
        if full_path.startswith(
            ("api", "docs", "openapi.json", "redoc", "ws", "health", "quick-demo")
        ):
            raise HTTPException(status_code=404, detail="Route not found")

        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return HTMLResponse(
            "<h1>React Build Not Found</h1><p>Run 'npm run build' in apps/web.</p>",
            status_code=404,
        )
else:

    @app.get("/", response_class=HTMLResponse, tags=["System"])
    async def serve_fallback_ui():
        return HTMLResponse(content=HTML_UI)


# =========================================================
# 6. Banner & CLI Launcher
# =========================================================
def print_banner(host: str, port: int, reload: bool):
    url = f"http://{'localhost' if host in ('0.0.0.0', '127.0.0.1') else host}:{port}"
    print("=" * 68)
    print("   🚀 QUEUECUT v3.0 - UNIFIED PRODUCTION & TELEMETRY SERVER 🚀")
    print("=" * 68)
    print(f"  • Frontend SPA Dashboard : {url}/")
    print(f"  • Quick Demo Simulator   : {url}/quick-demo")
    print(f"  • FastAPI OpenAPI Docs   : {url}/docs")
    print(f"  • Health Endpoint        : {url}/health")
    print(
        f"  • Telemetry WebSocket    : ws://{'localhost' if host in ('0.0.0.0', '127.0.0.1') else host}:{port}/api/v1/telemetry/ws"
    )
    print(f"  • Hot Reload Mode        : {'ENABLED' if reload else 'DISABLED'}")
    print("=" * 68)


def main():
    parser = argparse.ArgumentParser(
        description="QueueCut Unified Production & Telemetry Server"
    )
    parser.add_argument(
        "--host", default="0.0.0.0", help="Host address to bind (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="Port to listen on (default: 8000)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=False,
        help="Enable uvicorn hot code reloading",
    )
    parser.add_argument(
        "--no-reload",
        dest="reload",
        action="store_false",
        help="Disable hot code reloading",
    )

    args = parser.parse_args()
    print_banner(args.host, args.port, args.reload)

    if args.reload:
        uvicorn.run(
            "queuecut_final:app",
            host=args.host,
            port=args.port,
            reload=True,
            reload_dirs=[ROOT_DIR, API_DIR],
        )
    else:
        uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
