import os
import re
import requests
from bs4 import BeautifulSoup
import pandas as pd
from config import settings
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0"
}

def build_url(path: str) -> str:
    if path.startswith("/"):
        return f"{settings.data_page_base_url}{path}"
    return f"{settings.data_page_base_url}/{path}"

def get_festival_urls() -> set[str]:
    r = requests.get(
        build_url("/festivals/countries/germany"), headers=headers
    )
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    url_pattern = r'href="(/festivals/[a-z0-9-]+)"'
    month_tables = soup.find_all("section", {"id": "festivals"})[1].find_all(
        "div", class_="row"
    )
    festivals = set()
    for month_table in month_tables:
        all_urls = re.findall(url_pattern, str(month_table))
        festivals.update(build_url(path) for path in all_urls)
    return festivals


def get_festival_html(url: str) -> str:
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.text
