# inference_bridge/data/request/goal_request.py
from pydantic import Field, BaseModel
from typing import Optional, List

class TransactionData(BaseModel):
    amount: float = Field(..., description="The transaction amount")
    category: str = Field(..., description="The transaction category")
    date: str = Field(..., description="The transaction date in ISO format")
    description: Optional[str] = Field(None, description="The transaction description")
    
class GoalPlanningRequest(BaseModel):
    goal_id: int = Field(..., description="The ID of the goal")
    goal_description: str = Field(..., description="The description of the goal")
    target_amount: float = Field(..., description="The target amount to save")
    deadline: str = Field(..., description="The deadline date in ISO format")
    user_income: float = Field(..., description="The user's monthly income")
    transactions: List[TransactionData] = Field(..., description="List of transactions for the specified month")
    priority: Optional[int] = Field(None, description="The priority of the goal")