from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RollbackRequest(BaseModel):
    audit_log_id: int = Field(..., ge=1)


class RollbackResponse(BaseModel):
    success: bool
    message: str
    entity_type: str
    entity_id: int
    audit_log_id: int
    rolled_back_at: datetime

    model_config = ConfigDict(from_attributes=True)