# backend/app/models.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    incomes = relationship("UserIncome", back_populates="user") 

class UserIncome(Base):
    __tablename__ = "user_incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    year = Column(Integer)
    month = Column(Integer)
    income = Column(Float, default=0.0)

    __table_args__ = (
        UniqueConstraint("user_id", "year", "month", name="unique_user_income_per_month"),
    )
    
    # Relationships
    user = relationship("User", back_populates="incomes")

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