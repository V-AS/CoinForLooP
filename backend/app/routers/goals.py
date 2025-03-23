# backend/app/routers/goals.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import requests
import os

from ..database import get_db
from .. import models

router = APIRouter()

# Pydantic models
class GoalBase(BaseModel):
    description: str
    target_amount: float
    deadline: datetime

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: int
    ai_plan: Optional[str] = None
    
    class Config:
        orm_mode = True

# GET /api/goals
@router.get("/goals", response_model=List[Goal])
def get_goals(db: Session = Depends(get_db), user_id: int = 1):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    return goals

# POST /api/goal
@router.post("/goal", response_model=Goal)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), user_id: int = 1):
    # Create goal in database
    db_goal = models.Goal(
        user_id=user_id,
        description=goal.description,
        target_amount=goal.target_amount,
        deadline=goal.deadline
    )
    
    # Ensure user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        user = models.User(id=user_id, income=0.0)
        db.add(user)
    
    # Add goal to database first
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    # Call inference bridge to generate AI plan
    try:
        # Get user income and average spending
        user_income = user.income
        
        # Calculate average monthly spending
        current_month = datetime.now().month
        current_year = datetime.now().year
        transactions = db.query(models.Transaction).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.date >= datetime(current_year, current_month, 1)
        ).all()
        
        avg_spending = sum(t.amount for t in transactions) if transactions else 0
        
        # Prepare data for inference bridge
        goal_data = {
            "goal_id": db_goal.id,
            "goal_description": goal.description,
            "target_amount": goal.target_amount,
            "deadline": goal.deadline.isoformat(),
            "user_income": user_income,
            "avg_spending": avg_spending
        }
        
        # Send to inference bridge
        inference_url = os.getenv("INFERENCE_URL", "http://localhost:8001")
        response = requests.post(
            f"{inference_url}/goal_planning",
            json=goal_data
        )
        
        if response.status_code == 200:
            # Update goal with AI plan
            ai_plan = response.json().get("plan", "No plan generated")
            db_goal.ai_plan = ai_plan
            db.commit()
            db.refresh(db_goal)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error calling inference bridge: {e}")
        db_goal.ai_plan = "Unable to generate plan at this time."
        db.commit()
    
    return db_goal

@router.delete("/goal/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1 # Keep the test user handling consistent with the existing routes for now
):

    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == user_id
    ).first()

    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    db.delete(db_goal)
    db.commit()