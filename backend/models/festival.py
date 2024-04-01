from __future__ import annotations
import datetime as dt
from models import BaseModel
from peewee import CharField, DateTimeField, FloatField, TextField, UUIDField
import uuid


class FestivalHtml(BaseModel):
    url = CharField(max_length=255, primary_key=True)
    last_updated_at = DateTimeField(default=dt.datetime.now)
    html = TextField()


class Festival(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    url = CharField(max_length=255, unique=True)
    name = CharField(max_length=255)
    start_date = DateTimeField(null=True)
    end_date = DateTimeField(null=True)
    location_name = CharField(max_length=255, null=True)
    location_lat = FloatField(null=True)
    location_lon = FloatField(null=True)
    last_updated_at = DateTimeField(default=dt.datetime.now)
