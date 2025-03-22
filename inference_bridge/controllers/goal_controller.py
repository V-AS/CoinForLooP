# inference_bridge/controllers/goal_controller.py
from data.request.goal_request import GoalPlanningRequest
from data.response.goal_response import GoalPlanningResponse
from processors.goal_processor import GoalProcessor
import logging

logger = logging.getLogger(__name__)

async def process_goal_planning(request: GoalPlanningRequest) -> GoalPlanningResponse:
    """
    Process a goal planning request by passing it to the appropriate processor
    
    Args:
        request: The goal planning request data
        
    Returns:
        The goal planning response with AI-generated plan
    """
    try:
        # Create processor instance
        processor = GoalProcessor()
        
        # Process the request
        result = await processor.process(request)
        
        return result
    
    except Exception as e:
        logger.error(f"Error in goal planning controller: {e}")
        raise