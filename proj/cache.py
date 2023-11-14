import logging
import redis
import json
from django.conf import settings

logger = logging.Logger(__name__)
CacheValue = bytes | memoryview | str | int | float


class _RedisCache:
    def __init__(self, prefix="", db=0):
        self.db = db
        self.prefix = prefix
        try:
            self.cache = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=self.db)
        except Exception as exc:
            logger.error(f"There was a problem connecting to cache with exception: {exc}")
            raise exc

    def get_all_keys(self):
        """Get all the keys in the cache"""
        try:
            return self.cache.keys(f'*{self.prefix}*')
        except Exception as exc:
            logger.error(f"There was a problem getting all the keys from cache, with exception: {exc}")
            raise exc

    def get_value_by_key(self, key: str):
        """Get a specific value in cache by its key"""
        try:
            value = self.cache.get(f'{self.prefix}{key}')
            if value:
                return json.loads(str(value, 'UTF-8'))
            return value
        except Exception as exc:
            logger.error(f"There was a problem getting data from the cache, with exception: {exc}")
            raise exc

    def check_if_key_exists(self, key: str):
        """Check if a key exists in the cache"""
        try:
            return self.cache.exists(f'{self.prefix}{key}')
        except Exception as exc:
            logger.error(f"There was a problem getting data from the cache, with exception: {exc}")
            raise exc

    def set_value_by_key(self, key: str, value: CacheValue):
        """Create a value in the cache using its key"""
        try:
            return self.cache.set(f'{self.prefix}{key}', json.dumps(value))
        except Exception as exc:
            logger.error(f"There was a problem setting data in the cache, with exception: {exc}")
            raise exc

    def set_value_by_key_with_expiry(self, key: str, value: CacheValue, expiry_time_sec: int):
        """Create a value in the cache using its key, with an attached expiry time"""
        try:
            return self.cache.setex(f'{self.prefix}{key}', expiry_time_sec, json.dumps(value))
        except Exception as exc:
            logger.error(f"There was a problem setting expiry data in the cache, with exception: {exc}")
            raise exc

    def delete_value_by_key(self, key: str):
        """Delete all values in the cache with the specified key"""
        try:
            return self.cache.delete(f'{self.prefix}{key}')
        except Exception as exc:
            logger.error(f"There was a problem deleting data from the cache, with exception: {exc}")
            raise exc

    def flush_cache(self):
        """Delete all values in the cache"""
        try:
            self.cache.flushall()
        except Exception as exc:
            logger.error(f"There was a problem flushing the cache, with exception: {exc}")
            raise exc

    def enqueue(self, queue: str, value: CacheValue):
        """Push item into a queue"""
        try:
            self.cache.lpush(queue, json.dumps(value))
        except Exception as exc:
            logger.error(f"There was a problem adding an item to the queue, with exception: {exc}")
            raise exc

    def dequeue(self, queue: str):
        """Pop last element from a queue"""
        try:
            value = self.cache.rpop(queue)
            if value:
                value = json.loads(str(value, 'UTF-8'))
            return value
        except Exception as exc:
            logger.error(f"There was a problem removing an item from the queue, with exception: {exc}")
            raise exc


cache = _RedisCache()
