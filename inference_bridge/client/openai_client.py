# inference_bridge/client/openai_client.py
import os
from openai import OpenAI
import logging
from ..utils.retry_async import retry_with_exponential_backoff

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEY environment variable not set")
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # Allow model to be configured via env var
        logger.info(f"OpenAI client initialized with model: {self.model}")

    @retry_with_exponential_backoff(max_retries=3)
    async def generate_text_async(self, prompt):
        """
        Generate text using the OpenAI API (async version with retry)
        
        Args:
            prompt: The prompt to send to the API
            
        Returns:
            The generated text response
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful financial assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating text with OpenAI: {e}")
            raise

    def generate_text(self, prompt):
        """
        Generate text using the OpenAI API (synchronous version)
        
        Args:
            prompt: The prompt to send to the API
            
        Returns:
            The generated text response
        """
        try:
            logger.info(f"Sending prompt to OpenAI (length: {len(prompt)} chars)")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful financial assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            logger.info(f"Received response from OpenAI (length: {len(content)} chars)")
            return content
            
        except Exception as e:
            logger.error(f"Error generating text with OpenAI: {e}")
            # Return a fallback response instead of crashing
            return "I'm unable to generate personalized financial advice at the moment. Please try again later."