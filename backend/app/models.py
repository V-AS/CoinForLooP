# backend/app/models.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    income = Column(Float, default=0.0)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    goals = relationship("Goal", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    category = Column(String)
    date = Column(DateTime, default=func.now())
    description = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="transactions")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    target_amount = Column(Float)
    goal_priority = Column(Integer)
    deadline = Column(DateTime)
    ai_plan = Column(String, nullable=True)  # Store AI-generated savings plan
    
    # Relationships
    user = relationship("User", back_populates="goals")