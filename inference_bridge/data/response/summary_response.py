from pydantic import BaseModel
from typing import List


class SummaryResponse(BaseModel):
    summary: str
    budget_status: str
    