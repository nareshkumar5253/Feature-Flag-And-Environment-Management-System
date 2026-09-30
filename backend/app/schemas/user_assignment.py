from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserAssignmentCreate(BaseModel):
    user_id: int = Field(..., ge=1)
    feature_flag_id: int = Field(..., ge=1)
    enabled: bool = False
    notes: str | None = None


class UserAssignmentUpdate(BaseModel):
    enabled: bool | None = None
    notes: str | None = None


class UserAssignmentResponse(BaseModel):
    id: int
    user_id: int
    feature_flag_id: int
    enabled: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)