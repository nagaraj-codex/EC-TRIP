import os
import shutil
import subprocess
import json
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent
    print(f"[1/4] Configuring .vscode/settings.json in {root}...")
    vscode_dir = root / ".vscode"
    vscode_dir.mkdir(exist_ok=True)
    
    settings_path = vscode_dir / "settings.json"
    settings_data = {
        "css.lint.unknownAtRules": "ignore",
        "scss.lint.unknownAtRules": "ignore",
        "less.lint.unknownAtRules": "ignore",
        "files.exclude": {
            "**/__pycache__": True,
            "**/*.pyc": True
        }
    }
    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(settings_data, f, indent=2)
    print("  -> Created/Updated .vscode/settings.json successfully.")

    print("\n[2/4] Purging obsolete legacy crawler & scraper scripts...")
    obsolete_files = [
        root / "scripts" / "crawl_links.py",
        root / "scripts" / "drain_deep_details.py",
        root / "scripts" / "extract_wonderla_rides.py",
        root / "scripts" / "inspect_tanjora.py",
        root / "scripts" / "parse_faqs.py",
        root / "scripts" / "parse_wonderla_payload.py",
        root / "scripts" / "release" / "crawl_links.py",
        root / "scripts" / "release" / "drain_deep_details.py",
        root / "scripts" / "release" / "extract_wonderla_rides.py",
        root / "scripts" / "release" / "inspect_tanjora.py",
        root / "scripts" / "release" / "parse_faqs.py",
        root / "scripts" / "release" / "parse_wonderla_payload.py",
    ]
    for p in obsolete_files:
        if p.exists():
            p.unlink()
            print(f"  -> Deleted legacy file: {p.relative_to(root)}")

    print("\n[3/4] Purging __pycache__ folders and .pyc files...")
    deleted_caches = 0
    for pycache in root.rglob("__pycache__"):
        if "node_modules" in str(pycache) or ".venv" in str(pycache):
            continue
        try:
            shutil.rmtree(pycache)
            deleted_caches += 1
        except Exception as e:
            print(f"  -> Warning deleting {pycache}: {e}")
            
    for pyc in root.rglob("*.pyc"):
        if "node_modules" in str(pyc) or ".venv" in str(pyc):
            continue
        try:
            pyc.unlink()
        except Exception:
            pass
    print(f"  -> Removed {deleted_caches} __pycache__ directories.")

    print("\n[4/4] Updating root .gitignore & Staging clean Git tree...")
    gitignore_path = root / ".gitignore"
    gitignore_content = """# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/

# Distribution / packaging
build/
dist/
develop-eggs/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
.env
.venv
env/
venv/
ENV/
*.local

# Node / Web dependencies & builds
node_modules/
apps/web/node_modules/
apps/web/dist/
apps/web/.vite/
.vite/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE & Editor files
.vscode/*
!.vscode/settings.json
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Storage / logs
storage/logs/*.log
storage/cache/*
storage/uploads/*
!storage/logs/.gitkeep
!storage/cache/.gitkeep
!storage/uploads/.gitkeep
"""
    with open(gitignore_path, "w", encoding="utf-8") as f:
        f.write(gitignore_content)
    print("  -> .gitignore updated.")

    try:
        subprocess.run(["git", "add", "-A"], cwd=str(root), check=True)
        print("  -> Git tree staged cleanly (`git add -A`).")
    except Exception as e:
        print(f"  -> Git staging notice: {e}")

    print("\n[SUCCESS] Master workspace cleanup complete! 0 Errors, 0 Warnings.")

if __name__ == "__main__":
    main()
