from __future__ import annotations
from config import settings
from peewee import (
    Model,
    PostgresqlDatabase,
)

db = PostgresqlDatabase(
    database=settings.postgres_db,
    user=settings.postgres_user,
    password=settings.postgres_password,
    host=settings.postgres_host,
    port=settings.postgres_port,
    autorollback=True,
)


class BaseModel(Model):
    class Meta:
        database = db
