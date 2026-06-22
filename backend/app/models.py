from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    topic: str = Field(..., min_length=3, max_length=150)
    members: List[str] = Field(..., min_items=1, max_items=4)

class GroupResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    topic: str
    members: List[str]
    creator_email: str
    status: str
    supervisor: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True

class GroupApproval(BaseModel):
    supervisor: str = Field(..., min_length=2, max_length=100)

class DeadlineModel(BaseModel):
    deadline_date: datetime

class BulkApprovalModel(BaseModel):
    group_ids: List[str]
    supervisor: str 
