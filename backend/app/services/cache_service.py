import json
from typing import Optional

# Simple in-memory cache fallback (no Redis required)
_cache: dict = {}


def cache_get(key: str) -> Optional[dict]:
    try:
        import redis as redis_lib
        from app.config import settings
        r = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        data = r.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass

    # Fallback to in-memory
    entry = _cache.get(key)
    if entry:
        return entry
    return None


def cache_set(key: str, value: dict, ttl: int = 3600):
    try:
        import redis as redis_lib
        from app.config import settings
        r = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        r.setex(key, ttl, json.dumps(value))
        return
    except Exception:
        pass

    # Fallback to in-memory
    _cache[key] = value


def cache_delete(key: str):
    try:
        import redis as redis_lib
        from app.config import settings
        r = redis_lib.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        r.delete(key)
    except Exception:
        pass
    _cache.pop(key, None)
