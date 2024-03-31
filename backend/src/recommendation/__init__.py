from src.common.apis.responses.spotify_responses import (
    TopArtistResponse,
    TopTracksResponse,
)
from src.database.user import UserSuggestions
from src.recommendation import user as recommend_user
from src.recommendation import crew as recommend_crew


def recommend_n_user_festivals(
    user_tracks: dict,
    user_artists: dict,
    n: int,
) -> list[dict]:
    """Recommends n festivals based on the top artists and tracks of a user

    Args:
        top_artists (TopArtistResponse): Top artists of a user
        relevant_appearances (list[db.ArtistAppearance]): List of appearances of the top artists and tracks
        top_tracks (TopTracksResponse): Top tracks of a user
        n (int): Number of festivals to return

    Returns:
        list[int]: List of festival IDs
    """
    tracks = TopTracksResponse.from_dict(obj=user_tracks)
    artists = TopArtistResponse.from_dict(obj=user_artists)
    top_n = recommend_user.get_top_n_festivals(artists, tracks, n)
    suggestions = [
        recommend_user.build_user_festival_response(festival_id, artists)
        for festival_id in top_n
    ]
    return suggestions


def recommend_n_crew_festivals(
    users: list[UserSuggestions],
    user_n: int,
    result_n: int,
) -> list[dict]:
    """
    Recommends n festivals for a group of users

    Args:
        users (list[UserData]): List of users
        user_n (int): Internal number of festivals to predict for each user
        result_n (int): Number of results to return
    """
    by_user = []
    for user in users:
        tracks = TopTracksResponse.from_dict(obj=user.top_tracks)
        artists = TopArtistResponse.from_dict(obj=user.top_artists)
        top_n = recommend_user.get_top_n_festivals(artists, tracks, user_n)
        by_user.append((user, top_n))
    top_n_crew_festivals = recommend_crew.make_crew_suggestions(by_user, result_n)
    suggestions_json = [
        recommend_crew.build_crew_festival_response(users, festival_id)
        for festival_id in top_n_crew_festivals
    ]
    return suggestions_json
