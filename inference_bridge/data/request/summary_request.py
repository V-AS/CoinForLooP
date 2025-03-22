from pydantic import Field, BaseModel


class SummaryRequest(BaseModel):
    user_id: int = Field(..., description="The ID of the user")