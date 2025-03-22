import asyncio
import random
from openai import RateLimitError, BadRequestError, APIError
import logging

logger = logging.getLogger(__name__)


def retry_with_exponential_backoff(
    initial_delay: float = 1,
    exponential_base: float = 2,
    jitter: bool = True,
    max_retries: int = 3,
):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            delay = initial_delay

            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)

                except RateLimitError as e:
                    if attempt == max_retries:
                        logger.error(
                            f"Rate limit error after {max_retries} retries: {str(e)}"
                        )
                        raise
                    delay_with_jitter = (
                        delay * exponential_base * (1 + jitter * random.random())
                    )
                    await asyncio.sleep(delay_with_jitter)
                    delay = delay_with_jitter

                except BadRequestError as e:
                    # Don't retry bad requests
                    raise

                except APIError as e:
                    if attempt == max_retries:
                        logger.error(f"API error after {max_retries} retries: {str(e)}")
                        raise
                    await asyncio.sleep(1)

                except Exception as e:
                    logger.error(f"Unexpected error: {str(e)}")
                    raise

        return wrapper

    return decorator