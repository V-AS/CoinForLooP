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
    
    async def process(self, request: GoalPlanningRequest) -> GoalPlanningResponse:
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
                avg_spending=request.avg_spending
            )
            
            # Generate AI response
            plan = self.openai_client.generate_text(prompt)
            
            # Calculate if goal is realistic
            deadline_date = datetime.fromisoformat(request.deadline.replace('Z', '+00:00'))
            current_date = datetime.now()
            
            months_until_deadline = (
                (deadline_date.year - current_date.year) * 12 + 
                deadline_date.month - current_date.month
            )
            
            monthly_savings_needed = request.target_amount / max(1, months_until_deadline)
            available_monthly_savings = request.user_income - request.avg_spending
            is_realistic = available_monthly_savings >= monthly_savings_needed
            
            # Return the response
            return GoalPlanningResponse(
                plan=plan,
                is_realistic=is_realistic
            )
        
        except Exception as e:
            logger.error(f"Error processing goal planning request: {e}")
            raise