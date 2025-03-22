from pydantic import Field, BaseModel


class GoalPlanningRequest(BaseModel):
    goal_id: int = Field(..., description="The ID of the goal")
    goal_description: str = Field(..., description="The description of the goal")