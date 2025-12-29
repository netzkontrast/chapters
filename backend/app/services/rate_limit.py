import redis
from fastapi import Request, HTTPException, status
from app.config import settings

# Initialize Redis client
# We use a single global client for simplicity and connection pooling
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

class RateLimiter:
    """
    Rate limiter dependency for FastAPI routes.
    Uses Redis to track request counts.
    """
    def __init__(self, times: int, seconds: int, key_prefix: str = "limiter"):
        self.times = times
        self.seconds = seconds
        self.key_prefix = key_prefix

    async def __call__(self, request: Request):
        # Identify the client:
        # 1. User ID if authenticated (not available in login/register usually)
        # 2. IP address

        # Try to get IP address from headers (useful if behind proxy/load balancer)
        # X-Forwarded-For is common
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0]
        else:
            ip = request.client.host if request.client else "unknown"

        # Construct the key
        # key format: rate_limit:{prefix}:{ip}
        key = f"rate_limit:{self.key_prefix}:{ip}"

        try:
            # Atomic increment
            # incr returns the new value
            current = redis_client.incr(key)

            # If it's the first request (value is 1), set the expiration
            if current == 1:
                redis_client.expire(key, self.seconds)

            # Check against limit
            if current > self.times:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again in {self.seconds} seconds."
                )

        except redis.RedisError:
            # Fail open if Redis is down? Or fail closed?
            # For security, failing closed (blocking) might be safer but bad UX.
            # Failing open (allowing request) ensures availability.
            # Given this is MVP, let's log and fail open (pass) to avoid blocking users if Redis hiccups.
            # In a strict security env, we might want to fail closed.
            print("Rate limiter Redis error. Passing request.")
            pass
