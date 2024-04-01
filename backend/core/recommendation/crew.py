from collections import defaultdict
from .common import filter_top_n
from models import UserAuthorizationData, Festival, Artist
from typing import TypedDict
from core.common.apis.responses.spotify_responses import TopArtistResponse
import uuid


class UserArtists(TypedDict):
    user_id: str
    artist_ids: list[str]


class SuggestedCrewFestival(TypedDict):
    name: str
    url: str
    location: str
    lineup: list[Artist]
    user_likings: list[UserArtists]
    headliner_img_url: str
    date_str: str


def make_crew_suggestions(
    user_suggestions: list[UserAuthorizationData, list[uuid.UUID]], result_n: int
) -> list[uuid.UUID]:
    """Makes suggestions for a group of users

    Args:
        user_suggestions (list[User, list[int]]): List of users and their suggestions
        result_n (int): Number of results to return
    """
    festival_scores = defaultdict(float)

    user_n = max(len(suggestions) for _, suggestions in user_suggestions)

    # calculate scores
    for _, suggestions in user_suggestions:
        for ranking, festival_id in enumerate(suggestions):
            festival_scores[festival_id] += (
                user_n - ranking
            )  # user_n if the festival is the first suggestion, 1 if it is the last

    # sort by score and return top n
    return filter_top_n(festival_scores, result_n)


def build_lineup(
    appearances: list[Artist], users: list[UserAuthorizationData]
) -> list[Artist]:
    """reorder the lineup based on the user's likings

    Args:
        appearances (list[Artist]): List of appearances
        users (list[UserAuthorizationData]): List of users
    """
    artist_scores = defaultdict(float)
    for user in users:
        artists = TopArtistResponse.from_dict(obj=user.top_artists).artists
        n_user_artists = len(artists)
        for artist_appearance in appearances:
            if artist_appearance.artist not in artists:
                continue
            # we want to give a lot of weight to a user having listened to someone in the first place
            # so that the suggestions include everyone
            artist_scores[artist_appearance.artist.id] += n_user_artists * 5
            artist_scores[artist_appearance.artist.id] += (
                n_user_artists - artists.index(artist_appearance.artist)
            )
    ids_ordered = filter_top_n(artist_scores, 12)
    return [Artist.get_by_id(artist_id) for artist_id in ids_ordered]


def get_artists_by_user(
    users: list[UserAuthorizationData], lineup_ordered: list[Artist]
) -> list[UserArtists]:
    """Get the artists that the users like from the lineup

    Args:
        users (list[UserData]): List of users
        lineup_ordered (list[Artist]): Ordered lineup
    """
    artists_by_user = []
    for user in users:
        top_artists = set(
            artist.id
            for artist in TopArtistResponse.from_dict(obj=user.top_artists).artists
        )
        user_artists = [artist for artist in lineup_ordered if artist.id in top_artists]
        artists_by_user.append(
            {
                "user_id": user.user.id,
                "artist_ids": [artist.id for artist in user_artists],
            }
        )
    return artists_by_user


def build_crew_festival_response(
    users: list[UserAuthorizationData], suggested_festival: uuid.UUID
) -> SuggestedCrewFestival:
    """Builds the response for a group of users

    Args:
        users (list[UserData]): List of users
        suggested_festival (uuid.UUID): Suggested festival
    """
    festival = Festival.get_by_id(suggested_festival)
    lineup_ordered = build_lineup(festival.artist_appearances, users)
    user_artists = get_artists_by_user(users, lineup_ordered)
    date_str = (
        festival.start_date.strftime("%d.%m.%Y")
        if not festival.end_date
        else f"{festival.start_date.strftime('%d.%m.%Y')} - {festival.end_date.strftime('%d.%m.%Y')}"
    )
    return SuggestedCrewFestival(
        name=festival.name,
        url=festival.url,
        location=festival.location_name,
        lineup=[{"name": artist.name, "id": artist.id} for artist in lineup_ordered],
        user_likings=user_artists,
        headliner_img_url=lineup_ordered[0].img_url,
        date_str=date_str,
    )
