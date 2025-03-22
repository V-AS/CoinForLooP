# backend/app/routers/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db
from .. import models

router = APIRouter()

# Pydantic models
class TransactionBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True

# GET /api/transactions
@router.get("/transactions", response_model=List[Transaction])
def get_transactions(db: Session = Depends(get_db), user_id: int = 1):
    # For simplicity, using user_id=1; in production, get from auth
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id
    ).all()
    return transactions

# POST /api/transactions
@router.post("/transactions", response_model=Transaction)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), user_id: int = 1):
    # Create a new transaction
    db_transaction = models.Transaction(
        user_id=user_id,
        amount=transaction.amount,
        category=transaction.category,
        description=transaction.description,
        date=transaction.date or datetime.now()
    )
    
    # Ensure user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Create user if doesn't exist
        user = models.User(id=user_id, income=0.0)
        db.add(user)
    
    # Add and commit transaction
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction