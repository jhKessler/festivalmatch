import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth

REQ_ARTIST_CLIENT = spotipy.Spotify(
    auth_manager=SpotifyClientCredentials(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    )
)


def search_for_artist(name: str) -> tuple[str, str, str]:
    """Searches for an artist on Spotify and returns the first match

    Args:
        name (str): Name to search for

    Returns:
        tuple[str, str, str]: Spotify ID, name and img url of the first match
    """
    name = name.lower().strip()
    results = REQ_ARTIST_CLIENT.search(name, limit=20, type="artist")
    for artist in results["artists"]["items"]:
        if artist["name"].lower() == name:
            return artist["id"], artist["name"], artist["images"][0]["url"]
    first_match = results["artists"]["items"][0]
    return first_match["id"], first_match["name"], first_match["images"][0]["url"]


def get_top_user_artists(
    access_token: str, limit: int = 50, time_range: str = "medium_term"
) -> dict:
    client = spotipy.Spotify(auth=access_token)
    return client.current_user_top_artists(limit=limit, time_range=time_range)


def get_top_user_tracks(access_token: str) -> dict:
    client = spotipy.Spotify(auth=access_token)
    return client.current_user_top_tracks(limit=50, time_range="medium_term")
