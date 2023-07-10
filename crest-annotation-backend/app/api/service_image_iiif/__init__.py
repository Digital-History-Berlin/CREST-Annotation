import datetime
import requests_cache

# use caching to increase IIIF performance
cache = requests_cache.CachedSession(
    "iiif", expire_after=datetime.timedelta(minutes=30)
)
