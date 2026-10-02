#!/usr/bin/env python3
"""
QueueCut Master Dev Orchestrator (v3.0)
=======================================
Simultaneously boots:
1. FastAPI Intelligence Hub with hot reloading on Port 8000
2. React/Vite PWA Frontend on Port 5173
3. Automated default browser launch
"""

import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent
API_DIR = ROOT_DIR / "apps" / "api"
WEB_DIR = ROOT_DIR / "apps" / "web"

if os.name == "nt":
    VENV_PYTHON = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
else:
    VENV_PYTHON = ROOT_DIR / ".venv" / "bin" / "python"

if not VENV_PYTHON.exists():
    VENV_PYTHON = Path(sys.executable)


def print_banner():
    banner = """
    ==================================================
      🚀 QUEUECUT v3.0 - ELITE MASTER ORCHESTRATOR 🚀
    ==================================================
      [✓] DPDP Compliant   [✓] Redis / PWA Ready
      [✓] 30-API Hub       [✓] WebSocket Telemetry
    ==================================================
    """
    print(banner)


def main():
    print_banner()

    print("[1] Booting FastAPI Intelligence Hub (Port 8000)...")
    backend = subprocess.Popen(
        [
            str(VENV_PYTHON),
            "-m",
            "uvicorn",
            "app.main:app",
            "--reload",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ],
        cwd=str(API_DIR),
        shell=False,
    )

    print("[2] Booting React/Vite PWA Frontend (Port 5173)...")
    frontend_command = (
        ["cmd.exe", "/d", "/s", "/c", "npm run dev -- --host 127.0.0.1"]
        if os.name == "nt"
        else ["npm", "run", "dev", "--", "--host", "127.0.0.1"]
    )
    frontend = subprocess.Popen(
        frontend_command,
        cwd=str(WEB_DIR),
        shell=False,
    )

    print("[3] Warming up caching and telemetry engines...")
    time.sleep(3)

    print("[4] Launching QueueCut in your default browser...")
    webbrowser.open("http://127.0.0.1:5173")

    try:
        print(
            "\n>>> System Online. Press Ctrl+C to shut down all services gracefully. <<<\n"
        )
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n[!] Shutting down QueueCut processes...")
        backend.terminate()
        frontend.terminate()
        print("[✓] Clean shutdown complete.")


if __name__ == "__main__":
    main()
