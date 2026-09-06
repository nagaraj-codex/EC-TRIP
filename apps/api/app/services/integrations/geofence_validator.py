import math

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points on the earth.
    """
    R = 6371.0 # Earth radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

async def is_verified_on_site(user_lat: float, user_lon: float, park_lat: float, park_lon: float, threshold_km: float = 1.5) -> bool:
    """
    Verifies if user coordinates are within threshold_km of park centroid.
    Optionally, BigDataCloud Reverse Geocoding could be used for locality validation,
    but precise haversine distance is most strictly reliable for a geofence.
    """
    distance = calculate_haversine_distance(user_lat, user_lon, park_lat, park_lon)
    return distance <= threshold_km
