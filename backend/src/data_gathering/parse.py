from __future__ import annotations
from bs4 import BeautifulSoup
from dataclasses import dataclass
import datetime as dt


@dataclass
class FestivalMetadata:
    name: str
    start_date: dt.date
    end_date: dt.date
    location_name: str

    @staticmethod
    def from_soup(soup: BeautifulSoup) -> FestivalMetadata | None:
        festival_header = soup.find("div", class_="futdfilterfestival") or soup.find(
            "div", class_="futdfilterlight"
        )
        if festival_header is None:
            return None

        festival_name = festival_header.find("strong").text.strip()

        # Extract and split the date and location string
        date_location_element = festival_header.find_all("span", class_="text-white")[
            -1
        ]
        country = (
            date_location_element.find("a").get("href").split("/")[-1].capitalize()
        )
        date_location_str = date_location_element.text.strip()
        date_str, location = date_location_str.split(",")

        def parse_date(date_string: str) -> dt.date | None:
            try:
                return dt.datetime.strptime(date_string.strip(), "%d.%m.%Y").date()
            except ValueError:
                return None

        # Handle date ranges
        if "-" in date_str:
            start_date_str, end_date_str = date_str.split("-")
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
        else:
            start_date = end_date = parse_date(date_str)

        return FestivalMetadata(
            name=festival_name,
            start_date=start_date,
            end_date=end_date,
            location_name=f"{location.strip()}, {country.strip()}",
        )


@dataclass
class FestivalParseResult:
    url: str
    lineup: set[str]
    name: str
    start_date: dt.date
    end_date: dt.date
    location_name: str


def _parse_festival_lineup(soup: BeautifulSoup) -> set[str]:
    artists = set()
    invalid_artists = set(["", "Alle Artists anzeigen", "UVM", "anzeigen"])
    try:
        lineup_containers = soup.find("section", {"id": "lineup"}).find_all(
            "div", class_="card-body"
        )
    except AttributeError:
        return set()
    for lineup_container in lineup_containers:
        artists.update(
            artist.text.strip() for artist in lineup_container.find_all("span")
        )
    artists = artists - invalid_artists
    return artists


def parse_festival_html(html: str) -> FestivalParseResult | None:
    soup = BeautifulSoup(html, "html.parser")
    metadata = FestivalMetadata.from_soup(soup)
    if metadata is None:
        return None
    lineup = _parse_festival_lineup(soup)
    return FestivalParseResult(
        url=html,
        lineup=lineup,
        name=metadata.name,
        start_date=metadata.start_date,
        end_date=metadata.end_date,
        location_name=metadata.location_name,
    )
