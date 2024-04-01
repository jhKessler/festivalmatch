from .base_model import BaseModel, db
import time
from .artist import Artist, ArtistAppearance, ArtistMapping
from .festival import Festival, FestivalHtml
from .user import UserAuthorizationData, User
from .crew import Crew, CrewMember
from loguru import logger

logger.debug("Connecting to database...")
db.connect()
time.sleep(1)
logger.debug("Creating tables...")
db.create_tables(
    [
        FestivalHtml,
        Festival,
        ArtistAppearance,
        ArtistMapping,
        Artist,
        UserAuthorizationData,
        User,
        CrewMember,
        Crew,
    ]
)
