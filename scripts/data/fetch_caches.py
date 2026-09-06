import os
import json
import argparse
import urllib.request

def fetch_weather():
    print("Fetching Open-Meteo weather data...")
    # Wonderla Chennai Coordinates
    url = "https://api.open-meteo.com/v1/forecast?latitude=12.75&longitude=80.19&current_weather=true&hourly=temperature_2m,precipitation_probability"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        out_path = "apps/web/public/data/weather-now.json"
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Weather cache saved to {out_path}")
    except Exception as e:
        print(f"Failed to fetch weather: {e}")

def fetch_crowds():
    print("Fetching daily crowd projection...")
    # Simulate hitting the backend aggregator
    data = {
        "wonderla-chennai": {
            "projections": [
                {"date": "2026-09-06", "crowd_level": "medium", "price": 1312},
                {"date": "2026-09-07", "crowd_level": "low", "price": 1312}
            ]
        }
    }
    out_path = "apps/web/public/data/daily-crowd-price.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Crowd cache saved to {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--type", choices=["weather", "crowds"], required=True)
    args = parser.parse_args()
    
    if args.type == "weather":
        fetch_weather()
    elif args.type == "crowds":
        fetch_crowds()
