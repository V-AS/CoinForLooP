import logging
from typing import Any, Dict, List, Tuple, Type, TypeVar, Optional
from openai import AsyncOpenAI, APIError, BadRequestError, RateLimitError
from openai.types.chat.parsed_chat_completion import ParsedChatCompletion
import os
from inference_bridge.exception.inference_exception import (
    EmptyResponseException,
    OpenaiInferenceException,
)
from petopredict_agent.utils.retry_async import retry_with_exponential_backoff
from pydantic import BaseModel

logger: logging.Logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class OpenaiClient:
    def __init__(self) -> None:
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.MODEL = "gpt-4o-mini"

    async def inference(
        self, messages: List[Dict[str, Any]], response_format: Type[T]
    ) -> Tuple[ParsedChatCompletion, T]:
        try:
            completion = await self.run_inference_with_retry(
                messages=messages, response_format=response_format
            )
        except (BadRequestError, RateLimitError, APIError) as e:
            logger.error(f"OpenAI Inference error: {str(e)}", exc_info=True)
            raise OpenaiInferenceException(message=str(e))
        except Exception as e:
            logger.error(
                f"Unexpected error during openai inference: {str(e)}", exc_info=True
            )
            logger.error(messages)
            raise

        gen_result: Optional[T] = completion.choices[0].message.parsed
        if gen_result is None:
            raise EmptyResponseException()

        return (completion, gen_result)

    @retry_with_exponential_backoff()
    async def run_inference_with_retry(
        self, messages: List[Dict[str, Any]], response_format: Type[T]
    ) -> ParsedChatCompletion:
        return await self.client.beta.chat.completions.parse(
            model=self.MODEL, messages=messages, response_format=response_format
        )
