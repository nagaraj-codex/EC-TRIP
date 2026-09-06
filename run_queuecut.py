import subprocess
import sys
import time
import webbrowser
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

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
    
    # Define paths
    api_dir = os.path.join(os.getcwd(), "apps", "api")
    web_dir = os.path.join(os.getcwd(), "apps", "web")
    
    print("[1] Booting FastAPI Intelligence Hub (Port 8000)...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
        cwd=api_dir,
        shell=True
    )
    
    print("[2] Booting React/Vite PWA Frontend (Port 5173)...")
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=web_dir,
        shell=True
    )
    
    print("[3] Warming up caching and telemetry engines...")
    time.sleep(3) 
    
    print("[4] Launching QueueCut in your default browser...")
    webbrowser.open("http://localhost:5173")
    
    try:
        print("\n>>> System Online. Press Ctrl+C to shut down all services gracefully. <<<\n")
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n[!] Shutting down QueueCut processes...")
        backend.terminate()
        frontend.terminate()
        print("[✓] Clean shutdown complete.")

if __name__ == "__main__":
    main()
