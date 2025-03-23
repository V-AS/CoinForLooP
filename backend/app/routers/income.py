# backend/app/routers/income.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import models

router = APIRouter()

# Pydantic models
class IncomeUpdate(BaseModel):
    year: int = Field(..., example=2023, description="year")
    month: int = Field(..., ge=1, le=12, example=10, description="months (1-12)")
    income: float = Field(..., example=5000.0, description="month income")

class UserIncomeResponse(BaseModel):
    year: int
    month: int
    income: float
    
    class Config:
        orm_mode = True

@router.get("/income", response_model=UserIncomeResponse)
def get_income(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    # Query the income records for a specified year and month
    user_income = db.query(models.UserIncome).filter(
        models.UserIncome.user_id == user_id,
        models.UserIncome.year == year,
        models.UserIncome.month == month
    ).first()
    
    if not user_income:
        # Returns a default value or throws an error
        return {"year": year, "month": month, "income": 0.0}
    
    return user_income

@router.post("/income", response_model=UserIncomeResponse)
def update_income(
    income_update: IncomeUpdate,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    # Query or create income records
    user_income = db.query(models.UserIncome).filter(
        models.UserIncome.user_id == user_id,
        models.UserIncome.year == income_update.year,
        models.UserIncome.month == income_update.month
    ).first()
    
    if not user_income:
        # Create a new record
        user_income = models.UserIncome(
            user_id=user_id,
            year=income_update.year,
            month=income_update.month,
            income=income_update.income
        )
        db.add(user_income)
    else:
        # Update an existing record
        user_income.income = income_update.income
    
    db.commit()
    db.refresh(user_income)
    return user_income