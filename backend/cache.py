import os
import time
import json
import threading
from dotenv import load_dotenv

load_dotenv()

class InMemoryCache:
    """Thread-safe fallback in-memory cache with TTL (Time To Live)."""
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> str:
        with self._lock:
            if key not in self._cache:
                return None
            data, expires_at = self._cache[key]
            if time.time() > expires_at:
                del self._cache[key]  # Clean expired item
                return None
            return data

    def set(self, key: str, value: str, ex: int = 3600) -> bool:
        with self._lock:
            expires_at = time.time() + ex
            self._cache[key] = (value, expires_at)
            return True

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

# Initialize Redis cache if configured, otherwise fall back to InMemoryCache
REDIS_URL = os.getenv("REDIS_URL")
redis_client = None

if REDIS_URL:
    try:
        import redis
        print(f"[Winston Cache] Connecting to Redis at: {REDIS_URL.split('@')[-1] if '@' in REDIS_URL else REDIS_URL}")
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        # Ping to test connection
        redis_client.ping()
        print("[Winston Cache] Redis connected and ready.")
    except Exception as e:
        print(f"[Winston Cache] Failed to connect to Redis: {e}. Falling back to In-Memory Cache.")
        redis_client = None

# Unified Cache Wrapper
class WinstonCache:
    def __init__(self):
        self.local_cache = InMemoryCache()

    def get(self, key: str) -> dict:
        try:
            if redis_client:
                data = redis_client.get(key)
            else:
                data = self.local_cache.get(key)
            
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"[Winston Cache] Read error: {e}")
        return None

    def set(self, key: str, value: dict, expire_seconds: int = 3600) -> bool:
        try:
            serialized = json.dumps(value)
            if redis_client:
                return redis_client.set(key, serialized, ex=expire_seconds)
            else:
                return self.local_cache.set(key, serialized, ex=expire_seconds)
        except Exception as e:
            print(f"[Winston Cache] Write error: {e}")
            return False

    def delete(self, key: str) -> bool:
        try:
            if redis_client:
                return bool(redis_client.delete(key))
            else:
                return self.local_cache.delete(key)
        except Exception as e:
            print(f"[Winston Cache] Delete error: {e}")
            return False

winston_cache = WinstonCache()
