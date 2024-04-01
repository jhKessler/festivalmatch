from collections import defaultdict
import random
from typing import TypedDict
import numpy as np
from core.common.queries import get_relevant_appearances
from core.common.apis.responses.spotify_responses import (
    TopArtistResponse,
    TopTracksResponse,
)
import uuid
from models import ArtistAppearance, Festival
from .common import filter_top_n, combine_subscores

weightings = np.sqrt(np.arange(50, 0, -1))
weightings[:10] *= 2  # Give more weight to the first 10 artists


class SuggestedUserFestival(TypedDict):
    name: str
    url: str
    location: str
    lineup: list[str]
    headliner_img_url: str
    date_str: str


def calculate_artist_scores(
    top_artists: TopArtistResponse,
    relevant_appearances: list[ArtistAppearance],
) -> defaultdict[uuid.UUID, float]:
    artist_scores = defaultdict(float)

    for appeareance in relevant_appearances:
        if (
            appeareance.artist not in top_artists.artists
        ):  # artist has songs in top tracks but not in top artists so it is in the relevant appearances but not in the top artists
            continue
        artist_scores[appeareance.festival.id] += weightings[
            top_artists.artists.index(appeareance.artist)
        ]

    return artist_scores


def calculate_track_scores(
    top_tracks: TopTracksResponse,
    relevant_appearances: list[ArtistAppearance],
) -> list[uuid.UUID]:
    track_scores = defaultdict(float)

    for appearance in relevant_appearances:
        for track in top_tracks.tracks:
            if track.is_from(appearance.artist.id):
                track_scores[appearance.festival.id] += 0.2

    return track_scores


def get_top_n_festivals(
    top_artists: TopArtistResponse,
    top_tracks: TopTracksResponse,
    n: int,
) -> list[uuid.UUID]:
    """Returns the top n festivals based on the top artists and tracks of a user

    Args:
        top_artists (TopArtistResponse): Top artists of a user
        top_tracks (TopTracksResponse): Top tracks of a user
        n (int): Number of festivals to return
        user_lat (float): Latitude of the user
        user_lon (float): Longitude of the user

    Returns:
        list[int]: List of festival IDs
    """
    relevant_appearances = get_relevant_appearances(top_artists, top_tracks)
    artist_scores = calculate_artist_scores(top_artists, relevant_appearances)
    track_scores = calculate_track_scores(top_tracks, relevant_appearances)
    combined_scores = combine_subscores(artist_scores, track_scores)
    return filter_top_n(combined_scores, n)


def build_user_lineup(
    festival: Festival, top_user_artists: TopArtistResponse
) -> tuple[list[str], str]:
    """Reorders the artists in the festival to show the most relevant ones for the user at the start

    Args:
        festival (Festival): The festival
        top_user_artists (TopArtistResponse): The top artists of the user

    Returns:
        tuple[list[str], str]: The lineup and the img url of the headliner
    """
    lineup = []
    appearances = {appearance.artist for appearance in festival.artist_appearances}
    headliner_img_url = None

    for artist in top_user_artists.artists:
        if artist in appearances:
            if not headliner_img_url:
                headliner_img_url = artist.img_url
            lineup.append({"name": artist.name, "id": artist.id})
            appearances.remove(artist)

    if len(lineup) < 12:
        other_artists_sample = random.sample(
            list(appearances), min(12 - len(lineup), len(appearances))
        )
        lineup.extend(
            {"name": artist.name, "id": artist.id} for artist in other_artists_sample
        )
    return lineup, headliner_img_url


def build_user_festival_response(
    festival_id: uuid.UUID, top_user_artists: TopArtistResponse
) -> SuggestedUserFestival:
    festival = Festival.get_by_id(festival_id)
    date_str = (
        festival.start_date.strftime("%d.%m.%Y")
        if not festival.end_date
        else f"{festival.start_date.strftime('%d.%m.%Y')} - {festival.end_date.strftime('%d.%m.%Y')}"
    )
    lineup, headliner_img_url = build_user_lineup(festival, top_user_artists)
    return {
        "name": festival.name,
        "url": festival.url,
        "location": festival.location_name,
        "lineup": lineup,
        "headliner_img_url": headliner_img_url,
        "date_str": date_str,
    }
