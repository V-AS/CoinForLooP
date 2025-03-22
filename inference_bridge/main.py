# inference_bridge/main.py
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import logging

# Import request/response models from data package
from inference_bridge.data.request import GoalPlanningRequest, SummaryRequest
from inference_bridge.data.response import GoalPlanningResponse, SummaryResponse

# Import controllers
from inference_bridge.controllers.goal_controller import process_goal_planning
from inference_bridge.controllers.summary_controller import process_monthly_summary

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="CoinForLooP Inference Bridge")


# Goal planning endpoint
@app.post("/goal_planning", response_model=GoalPlanningResponse)
async def goal_planning(request: GoalPlanningRequest):
    """
    Generate an AI savings plan for a financial goal
    """
    try:
        return await process_goal_planning(request)
    except Exception as e:
        logger.error(f"Error processing goal planning: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Monthly summary endpoint
@app.post("/monthly_summary", response_model=SummaryResponse)
async def monthly_summary(request: SummaryRequest):
    """
    Generate AI insights for monthly spending analysis
    """
    try:
        return await process_monthly_summary(request)
    except Exception as e:
        logger.error(f"Error processing monthly summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# For development
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("inference_bridge.main:app", host="0.0.0.0", port=8001, reload=True)
