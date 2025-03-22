# inference_bridge/data/request/summary_request.py
from pydantic import Field, BaseModel
from typing import List, Dict, Any, Optional

class TransactionData(BaseModel):
    id: int = Field(..., description="The transaction ID")
    amount: float = Field(..., description="The transaction amount")
    category: str = Field(..., description="The transaction category")
    date: str = Field(..., description="The transaction date in ISO format")
    description: Optional[str] = Field(None, description="The transaction description")

class SummaryRequest(BaseModel):
    user_id: int = Field(..., description="The ID of the user")
    month: int = Field(..., description="The month number (1-12)")
    year: int = Field(..., description="The year")
    income: float = Field(..., description="The user's monthly income")
    transactions: List[TransactionData] = Field(..., description="List of transactions for the period")