from __future__ import annotations
import os

from peewee import (
    Model,
    PostgresqlDatabase,
)

db = PostgresqlDatabase(
    database=os.environ["POSTGRES_DB"],
    user=os.environ["POSTGRES_USER"],
    password=os.environ["POSTGRES_PASSWORD"],
    host=os.environ["POSTGRES_HOST"],
    port=os.environ["POSTGRES_PORT"],
    autorollback=True,
)


class BaseModel(Model):
    class Meta:
        database = db
