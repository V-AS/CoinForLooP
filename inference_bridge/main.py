# inference_bridge/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import os

from controllers.goal_controller import process_goal_planning
from controllers.summary_controller import process_monthly_summary

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="CoinForLooP Inference Bridge")

# Pydantic models
class GoalPlanningRequest(BaseModel):
    goal_id: int
    goal_description: str
    target_amount: float
    deadline: str
    user_income: float
    avg_spending: float

class GoalPlanningResponse(BaseModel):
    plan: str
    is_realistic: bool

class SummaryRequest(BaseModel):
    user_id: int
    month: int
    year: int
    income: float
    transactions: List[Dict[str, Any]]

class SummaryResponse(BaseModel):
    summary: str
    top_categories: Dict[str, float]
    total_spending: float
    budget_status: str

# Goal planning endpoint
@app.post("/goal_planning", response_model=GoalPlanningResponse)
async def goal_planning(request: GoalPlanningRequest):
    try:
        return await process_goal_planning(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Monthly summary endpoint
@app.post("/monthly_summary", response_model=SummaryResponse)
async def monthly_summary(request: SummaryRequest):
    try:
        return await process_monthly_summary(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

# Sample controller files would be:
# controllers/goal_controller.py - Handles request validation and calls processor
# controllers/summary_controller.py - Handles request validation and calls processor

# Sample processor files would be:
# processors/goal_processor.py - Contains OpenAI integration for goal planning
# processors/summary_processor.py - Contains OpenAI integration for monthly summaries