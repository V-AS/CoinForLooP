# inference_bridge/data/request/goal_request.py
from pydantic import Field, BaseModel
from typing import Optional

class GoalPlanningRequest(BaseModel):
    goal_id: int = Field(..., description="The ID of the goal")
    goal_description: str = Field(..., description="The description of the goal")
    target_amount: float = Field(..., description="The target amount to save")
    deadline: str = Field(..., description="The deadline date in ISO format")
    user_income: float = Field(..., description="The user's monthly income")
    avg_spending: float = Field(..., description="The user's average monthly spending")