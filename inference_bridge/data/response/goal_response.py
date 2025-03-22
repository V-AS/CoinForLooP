from pydantic import BaseModel
from typing import List


class GoalPlanningResponse(BaseModel):
    something: str
    is_realistic: bool
