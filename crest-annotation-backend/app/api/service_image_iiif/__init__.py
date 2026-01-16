import datetime
import requests_cache

# browser-like headers to avoid 403 from IIIF servers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, application/ld+json, */*",
}

# use caching to increase IIIF performance
cache = requests_cache.CachedSession(
    "iiif",
    expire_after=datetime.timedelta(minutes=30),
    timeout=30,
)

cache.headers.update(HEADERS)
