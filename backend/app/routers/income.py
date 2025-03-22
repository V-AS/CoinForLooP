# backend/app/routers/income.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import models

router = APIRouter()

# Pydantic models
class IncomeUpdate(BaseModel):
    income: float

class UserIncome(BaseModel):
    id: int
    income: float
    
    class Config:
        orm_mode = True

# GET /api/income
@router.get("/income", response_model=UserIncome)
def get_income(db: Session = Depends(get_db), user_id: int = 1):
    # For simplicity, using user_id=1; in production, get from auth
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        # Create user if doesn't exist
        user = models.User(id=user_id, income=0.0)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

# POST /api/income
@router.post("/income", response_model=UserIncome)
def update_income(income_update: IncomeUpdate, db: Session = Depends(get_db), user_id: int = 1):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        # Create user if doesn't exist
        user = models.User(id=user_id, income=income_update.income)
        db.add(user)
    else:
        # Update existing user's income
        user.income = income_update.income
    
    db.commit()
    db.refresh(user)
    return user