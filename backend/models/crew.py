from __future__ import annotations
import datetime as dt
import uuid
from models import BaseModel
from peewee import CharField, DateTimeField, ForeignKeyField, UUIDField, BooleanField
from .user import User, UserAuthorizationData
from playhouse.postgres_ext import JSONField


class Crew(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    name = CharField(max_length=255)
    creator = ForeignKeyField(User, backref="crews", field="id")
    created_at = DateTimeField(default=dt.datetime.now)
    suggestions = JSONField()
    active = BooleanField(default=True)

    def is_member(self, user: User) -> bool:
        return user in {member.user for member in self.members if member.is_active}

    @classmethod
    def create(
        cls,
        name: str,
        creator: User,
        specified_name: str,
        crew_suggestions: dict,
        creator_suggestions: UserAuthorizationData,
    ) -> Crew:
        creator = User.get(User.id == creator)
        record = super(Crew, cls).create(
            name=name, creator=creator, suggestions=crew_suggestions
        )

        CrewMember.create(
            crew=record.id,
            user=creator,
            specified_name=specified_name,
            data=creator_suggestions,
        )

        return record


class CrewMember(BaseModel):
    crew = ForeignKeyField(Crew, backref="members", field="id")
    user = ForeignKeyField(User, backref="memberships", field="id")
    data = ForeignKeyField(UserAuthorizationData)
    specified_name = CharField(max_length=255)
    is_active = BooleanField(default=True)
