import os
import geopy.distance
import requests
import ipinfo
from loguru import logger
from config import settings

def lat_lon_from_location(location: str) -> tuple[float, float] | None:
    r = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": location, "format": "json"},
    )
    if not r.ok:
        return None, None
    try:
        first_match = r.json()[0]
    except IndexError:
        return None, None
    lat, lon = float(first_match["lat"]), float(first_match["lon"])
    return lat, lon


def lat_lon_from_ip(ip: str | None) -> tuple[float, float] | None:
    if not ip:
        # fallback to hamburg
        return 53.551086, 9.993682
    try:
        handler = ipinfo.getHandler(settings.ipinfo_token)
        details = handler.getDetails(ip)
        logger.info(f"User is in {details.city}, {details.country}")
        return details.latitude, details.longitude
    except Exception:
        logger.error(f"Failed to get location from ip {ip}")
        return 53.551086, 9.993682


def get_distance_km(
    point_a: tuple[float, float], point_b: tuple[float, float]
) -> float:
    """Calculate distance in kilometers between two points.

    Args:
        point_a (tuple[float, float]): of format (lat, lon)
        point_b (tuple[float, float]): of format (lat, lon)

    Returns:
        float: distance in kilometers
    """
    return geopy.distance.geodesic(point_a, point_b).km
