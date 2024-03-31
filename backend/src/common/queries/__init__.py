from src.database import ArtistAppearance
from src.common.apis.responses.spotify_responses import (
    TopArtistResponse,
    TopTracksResponse,
)


def get_relevant_appearances(
    top_artists: TopArtistResponse = None, top_tracks: TopTracksResponse = None
) -> list[ArtistAppearance]:
    """Returns a list of artist appearances that contain artists from the user's top tracks and artists

    Args:
        top_tracks (TopTracksResponse): User's top tracks
        top_artists (TopArtistResponse): User's top artists

    Returns:
        list[ArtistAppearance]: List of artist appearances
    """
    artist_ids = set()
    if top_tracks is None:
        top_tracks = TopTracksResponse(tracks=[])
    if top_artists is None:
        top_artists = TopArtistResponse(artists=[])
    for track in top_tracks.tracks:
        artist_ids.update(track.artist_ids)
    for artist in top_artists.artists:
        artist_ids.add(artist.id)
    return ArtistAppearance.select().where(
        ArtistAppearance.artist.in_(artist_ids)
    )
