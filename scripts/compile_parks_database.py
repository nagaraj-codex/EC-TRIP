import os
import json
from pathlib import Path
from datetime import datetime

def compile_database():
    base_dir = Path(__file__).resolve().parent.parent
    parks_db_dir = base_dir / "data" / "parks_database"
    web_data_dir = base_dir / "apps" / "web" / "public" / "data"
    
    parks_db_dir.mkdir(parents=True, exist_ok=True)
    web_data_dir.mkdir(parents=True, exist_ok=True)
    
    park_files = [
        ("wonderla-chennai", parks_db_dir / "wonderla_chennai.json"),
        ("mgm-dizzee-chennai", parks_db_dir / "mgm_dizzee_chennai.json"),
        ("black-thunder-coimbatore", parks_db_dir / "black_thunder_coimbatore.json")
    ]
    
    compiled_parks = {}
    
    for pid, file_path in park_files:
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                compiled_parks[pid] = data
                print(f"  [LOADED] {file_path.name}")
        else:
            print(f"  [WARN] Missing {file_path.name}")
            
    unified_catalog = {
        "version": "1.0.0",
        "updated_at": datetime.now().strftime("%Y-%m-%d"),
        "parks_count": len(compiled_parks),
        "parks": compiled_parks
    }
    
    # Write unified parks catalog to data/parks_database/
    unified_path = parks_db_dir / "unified_parks_catalog.json"
    with open(unified_path, "w", encoding="utf-8") as f:
        json.dump(unified_catalog, f, indent=2, ensure_ascii=False)
    print(f"  [SAVED] {unified_path}")
    
    # Sync with apps/web/public/data/parks.json for offline frontend capabilities
    web_parks_path = web_data_dir / "parks.json"
    with open(web_parks_path, "w", encoding="utf-8") as f:
        json.dump(unified_catalog, f, indent=2, ensure_ascii=False)
    print(f"  [SYNCED] {web_parks_path}")
    
    print(">>> COMPILED ALL GROUND-TRUTH PARKS SUCCESSFULLY <<<")

if __name__ == "__main__":
    compile_database()
