from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
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
    ipinfo_access_token: str
    max_crew_memberships: int = 5
    max_crew_members: int = 4
    data_page_base_url: str


if ".env" in os.listdir():
    load_dotenv(dotenv_path=".env")

settings = Settings()