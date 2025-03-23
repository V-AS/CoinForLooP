# backend/app/routers/summary.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import requests
import os
from calendar import monthrange

from ..database import get_db
from .. import models

router = APIRouter()

# Pydantic models
class SummaryRequest(BaseModel):
    month: int
    year: int

class SummaryResponse(BaseModel):
    summary: str
    top_categories: Dict[str, float]
    total_spending: float
    budget_status: str

class AvailablePeriodsResponse(BaseModel):
    years: List[int]
    months: Dict[int, List[int]]  # Key: year, Value: list of months with data

@router.get("/available-periods", response_model=AvailablePeriodsResponse)
def get_available_periods(db: Session = Depends(get_db), user_id: int = 1):
    """
    Returns years that have at least one transaction record,
    and for each year, which months have at least one transaction record.
    """
    # Get user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all years with transaction data
    years_query = db.query(
        extract('year', models.Transaction.date).label('year')
    ).filter(
        models.Transaction.user_id == user_id
    ).distinct().order_by('year').all()
    
    years = [year[0] for year in years_query]
    
    # For each year, get all months with transaction data
    months_by_year = {}
    for year in years:
        months_query = db.query(
            extract('month', models.Transaction.date).label('month')
        ).filter(
            models.Transaction.user_id == user_id,
            extract('year', models.Transaction.date) == year
        ).distinct().order_by('month').all()
        
        months_by_year[year] = [month[0] for month in months_query]
    
    return {
        "years": years,
        "months": months_by_year
    }

# POST /api/summary
@router.post("/summary", response_model=SummaryResponse)
def generate_summary(request: SummaryRequest, db: Session = Depends(get_db), user_id: int = 1):
    # Get user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get transactions for the specified month
    _, last_day = monthrange(request.year, request.month)
    start_date = datetime(request.year, request.month, 1)
    end_date = datetime(request.year, request.month, last_day, 23, 59, 59)
    
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).all()
    
    # Prepare transaction data
    transaction_data = [
        {
            "amount": t.amount,
            "category": t.category,
            "date": t.date.isoformat(),
            "description": t.description
        }
        for t in transactions
    ]
    
    # Get user current month income
    user_income_record = db.query(models.UserIncome).filter(
        models.UserIncome.user_id == user_id,
        models.UserIncome.year == request.year,
        models.UserIncome.month == request.month
    ).first()

    user_income = user_income_record.income if user_income_record else 0.0
    
    # Prepare data for inference bridge
    summary_data = {
        "user_id": user_id,
        "month": request.month,
        "year": request.year,
        "income": user_income,
        "transactions": transaction_data
    }
    
    try:
        # Call inference bridge
        inference_url = os.getenv("INFERENCE_URL", "http://localhost:8001")
        response = requests.post(
            f"{inference_url}/monthly_summary",
            json=summary_data
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=500, detail="Error generating summary")
    except Exception as e:
        # Fallback to basic summary if inference bridge fails
        # Calculate totals by category
        category_totals = {}
        for t in transactions:
            category = t.category
            if category in category_totals:
                category_totals[category] += t.amount
            else:
                category_totals[category] = t.amount
        
        total_spending = sum(t.amount for t in transactions)
        budget_status = "Under Budget" if total_spending < user_income else "Over Budget"
        
        return {
            "summary": f"In {request.month}/{request.year}, you spent ${total_spending:.2f} with income of ${user_income:.2f}.",
            "top_categories": category_totals,
            "total_spending": total_spending,
            "budget_status": budget_status
        }