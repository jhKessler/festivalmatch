import time
from tqdm import tqdm
from loguru import logger
import datetime as dt
from core.data_gathering import scrape, parse
from core.common.apis import geocode

from models import ArtistAppearance, ArtistMapping, Festival, FestivalHtml


def assert_data():
    """Checks if the db is empty and if yes, builds it from scratch"""
    if FestivalHtml.select().count():
        logger.info("Database is not empty. Skipping data gathering...")
        return

    logger.info("Database is empty. Gathering data...")
    festival_urls = scrape.get_festival_urls()

    for url in tqdm(festival_urls, desc="Scraping festivals"):
        time.sleep(2.5)
        try:
            html = scrape.get_festival_html(url)
            # create or update
            festival_html, _ = FestivalHtml.get_or_create(
                url=url, defaults={"html": html}
            )
        except Exception as e:
            logger.error(f"Failed to scrape {url}: {e}")
            continue

    for festival_html in tqdm(FestivalHtml.select(), desc="Parsing festivals"):
        add_new_festival(festival_html)


def add_new_festival(
    festival_html: FestivalHtml
) -> Festival:
    festival_data = parse.parse_festival_html(festival_html.html)
    if festival_data is None:
        logger.error(f"Failed to parse {festival_html.url}")
        return
    lat, lon = geocode.lat_lon_from_location(festival_data.location_name)
    festival = Festival.create(
        url=festival_html.url,
        name=festival_data.name.strip().strip(" 2024"),
        start_date=festival_data.start_date,
        end_date=festival_data.end_date,
        location_name=festival_data.location_name,
        location_lat=lat,
        location_lon=lon,
    )
    for artist_name in festival_data.lineup:
        artist_mapping = ArtistMapping.from_name(artist_name)
        if artist_mapping is None:
            logger.error(f"Failed to get or create artist mapping for {artist_name}")
            continue
        ArtistAppearance.create(
            artist=artist_mapping.artist, festival=festival.id
        )
