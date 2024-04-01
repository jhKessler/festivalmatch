from __future__ import annotations

import datetime as dt

from loguru import logger
from peewee import (
    CharField,
    DateTimeField,
    ForeignKeyField,
)

from core.common.apis import spotify
from models import BaseModel
from .festival import Festival


class Artist(BaseModel):
    id = CharField(max_length=255, primary_key=True)
    name = CharField(max_length=255)
    img_url = CharField(max_length=255, null=True)
    last_updated_at = DateTimeField(default=dt.datetime.now)


class ArtistMapping(BaseModel):
    source_name = CharField(max_length=255, primary_key=True)
    artist = ForeignKeyField(Artist, backref="mappings", field="id")
    last_updated_at = DateTimeField(default=dt.datetime.now)

    @staticmethod
    def from_name(name: str) -> ArtistMapping:
        if artist_mapping := ArtistMapping.get_or_none(
            ArtistMapping.source_name == name
        ):
            return artist_mapping
        try:
            matched_id, matched_name, matched_img_url = spotify.search_for_artist(name)
        except Exception as e:
            logger.error(f"Failed to search for {name}: {e}")
            return None
        artist = Artist.get_or_create(
            id=matched_id, name=matched_name, img_url=matched_img_url
        )[0]
        return ArtistMapping.get_or_create(source_name=name, artist=artist)[0]


class ArtistAppearance(BaseModel):
    artist = ForeignKeyField(Artist, backref="appearances", field="id")
    festival = ForeignKeyField(Festival, backref="artist_appearances", field="id")
    last_updated_at = DateTimeField(default=dt.datetime.now)
