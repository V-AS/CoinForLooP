# inference_bridge/client/openai_client.py
import os
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"  # Use the cost-efficient model as specified

    def generate_text(self, prompt):
        """
        Generate text using the OpenAI API
        
        Args:
            prompt: The prompt to send to the API
            
        Returns:
            The generated text response
        """
        try:
            response = self.client.chat.completions.create(
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