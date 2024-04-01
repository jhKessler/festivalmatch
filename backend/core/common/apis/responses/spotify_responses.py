from __future__ import annotations
from dataclasses import dataclass
from models import Artist


@dataclass
class TopTracksResponse:
    tracks: list[Track]

    @staticmethod
    def from_dict(obj: dict) -> TopTracksResponse:
        return TopTracksResponse(
            tracks=[Track.from_dict(track) for track in obj["items"]],
        )


@dataclass
class Track:
    artist_ids: set[str]
    name: str

    @staticmethod
    def from_dict(obj: dict) -> Track:
        return Track(
            artist_ids={artist["id"] for artist in obj["artists"]},
            name=obj["name"],
        )

    def is_from(self, artist_id: str) -> bool:
        return artist_id in self.artist_ids


@dataclass
class TopArtistResponse:
    artists: list[Artist]

    @staticmethod
    def from_dict(obj: dict[str, str]) -> TopArtistResponse:
        return TopArtistResponse(
            artists=[
                Artist.get_or_create(id=artist["id"], name=artist["name"])[0]
                for artist in obj["items"]
            ]
        )
