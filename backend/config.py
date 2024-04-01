from pydantic_settings import BaseSettings, SettingsConfigDict

from enum import Enum

class Mode(str, Enum):
    prod = "prod"
    dev = "dev"

class Settings(BaseSettings):
    mode: Mode
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str
    postgres_port: int
    spotify_client_id: str
    spotify_client_secret: str
    mail_sender: str
    mail_receiver: str
    mail_pw: str
    next_public_frontend_url: str
    ipinfo_access_token: str
    nextauth_url: str
    max_crew_memberships: int
    max_crew_members: int
    data_page_base_url: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()