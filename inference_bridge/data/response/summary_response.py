# inference_bridge/data/response/summary_response.py
from pydantic import Field, BaseModel
from typing import Dict

class SummaryGenResponse(BaseModel):
    summary: str = Field(..., description="The AI-generated summary and analysis")
    
class SummaryResponse(BaseModel):
    summary: str
    top_categories: Dict[str, float] = Field(..., description="Spending by category")
    total_spending: float = Field(..., description="Total spending for the period")
    budget_status: str = Field(..., description="Whether the user is under or over budget")
