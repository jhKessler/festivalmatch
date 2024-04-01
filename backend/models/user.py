from __future__ import annotations
from models import BaseModel
import datetime as dt
from peewee import CharField, DateTimeField, ForeignKeyField
from playhouse.postgres_ext import JSONField


class User(BaseModel):
    id = CharField(max_length=255, primary_key=True)
    name = CharField(max_length=255)
    picture_url = CharField(max_length=255)


class UserAuthorizationData(BaseModel):
    """Stores user data for the recommendation system
    top tracks and top artist are sorted, so the first element is the most listened to artist/track an  the last is the least listened to."""

    access_token = CharField(max_length=255, primary_key=True)
    created_at = DateTimeField(default=dt.datetime.now)
    user = ForeignKeyField(User, backref="suggestions", field="id")
    top_tracks = JSONField()
    top_artists = JSONField()
    json = JSONField()
    top_3_artists = CharField(max_length=255, null=True)
