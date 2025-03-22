# inference_bridge/data/response/goal_response.py
from pydantic import Field, BaseModel

class GoalPlanningResponse(BaseModel):
    plan: str = Field(..., description="The AI-generated savings plan")
    is_realistic: bool = Field(..., description="Whether the goal is realistic based on current finances")