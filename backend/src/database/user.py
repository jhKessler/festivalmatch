from __future__ import annotations
import uuid
from src import recommendation
from src.database.base_model import BaseModel
from loguru import logger
import datetime as dt
from peewee import CharField, DateTimeField, FloatField, UUIDField, ForeignKeyField
from playhouse.postgres_ext import JSONField
from src.common.apis import spotify, geocode


class User(BaseModel):
    id = CharField(max_length=255, primary_key=True)
    name = CharField(max_length=255)
    picture_url = CharField(max_length=255)


class UserSuggestions(BaseModel):
    """Stores user data for the recommendation system
    top tracks and top artist are sorted, so the first element is the most listened to artist/track an  the last is the least listened to."""

    access_token = CharField(max_length=255, primary_key=True)
    hash = UUIDField(unique=True, default=uuid.uuid4, index=True)
    created_at = DateTimeField(default=dt.datetime.now)
    user = ForeignKeyField(User, backref="suggestions", field="id")
    top_tracks = JSONField()
    top_artists = JSONField()
    json = JSONField()
    top_3_artists = CharField(max_length=255, null=True)

    @classmethod
    def create(
        cls, name: str, id: str, access_token: str, picture_url: str
    ) -> UserSuggestions:
        user = User.get_or_none(User.id == id)
        if not user:
            user = User.create(id=id, name=name, picture_url=picture_url)

        top_tracks = spotify.get_top_user_tracks(access_token)
        top_artists = spotify.get_top_user_artists(access_token)
        top_3_artists = ", ".join(
            artist["name"]
            for artist in spotify.get_top_user_artists(
                access_token, limit=3, time_range="long_term"
            )["items"]
        )

        return super(UserSuggestions, cls).create(
            access_token=access_token,
            user=user,
            top_tracks=top_tracks,
            top_artists=top_artists,
            top_3_artists=top_3_artists,
            json=recommendation.recommend_n_user_festivals(
                user_artists=top_artists, user_tracks=top_tracks, n=8
            ),
        )
