# inference_bridge/processors/goal_processor.py
from datetime import datetime
from inference_bridge.client.openai_client import OpenAIClient
from inference_bridge.prompt_builder.prompt_builder import PromptBuilder
from inference_bridge.data.request.goal_request import GoalPlanningRequest
from inference_bridge.data.response.goal_response import GoalPlanningResponse
import logging

logger = logging.getLogger(__name__)

class GoalProcessor:
    def __init__(self):
        self.openai_client = OpenAIClient()
    
    async def process(self, request: GoalPlanningRequest):
        """
        Process a goal planning request
        
        Args:
            request: Goal planning request data
            
        Returns:
            Goal planning response with AI-generated plan
        """
        try:
            # Build prompt using the PromptBuilder
            prompt = PromptBuilder.build_goal_planning_prompt(
                goal_description=request.goal_description,
                target_amount=request.target_amount,
                deadline=request.deadline,
                user_income=request.user_income,
                transactions=request.transactions,
                priority=request.priority
            )
            
            # Generate AI response
            plan = self.openai_client.generate_text(prompt,response_format = GoalPlanningResponse)

            return plan
        
        except Exception as e:
            logger.error(f"Error processing goal planning request: {e}")
            raise