from core import recommendation
from models import User, UserAuthorizationData
from core.common.apis import spotify


def handle_user_authorization(
    username: str, user_id: str, user_access_token: str, user_picture_url: str
):
    user = User.get_or_none(User.id == user_id)
    if not user:
        user = User.create(id=user_id, name=username, picture_url=user_picture_url)

    top_tracks = spotify.get_top_user_tracks(user_access_token)
    top_artists = spotify.get_top_user_artists(user_access_token)
    top_3_artists = ", ".join(
        artist["name"]
        for artist in spotify.get_top_user_artists(
            user_access_token, limit=3, time_range="long_term"
        )["items"]
    )

    return UserAuthorizationData.create(
        access_token=user_access_token,
        user=user,
        top_tracks=top_tracks,
        top_artists=top_artists,
        top_3_artists=top_3_artists,
        json=recommendation.recommend_n_user_festivals(
            user_artists=top_artists, user_tracks=top_tracks, n=8
        ),
    )
