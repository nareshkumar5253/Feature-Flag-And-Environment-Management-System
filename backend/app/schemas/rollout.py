from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RolloutCreate(BaseModel):
    feature_flag_id: int = Field(..., ge=1)
    environment_id: int = Field(..., ge=1)
    percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    enabled: bool = False
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    notes: str | None = None
    priority: int = Field(default=1, ge=1)

    @model_validator(mode="after")
    def validate_schedule(self):
        if (
            self.scheduled_start is not None
            and self.scheduled_end is not None
            and self.scheduled_end <= self.scheduled_start
        ):
            raise ValueError("scheduled_end must be later than scheduled_start")
        return self


class RolloutUpdate(BaseModel):
    percentage: float | None = Field(default=None, ge=0.0, le=100.0)
    enabled: bool | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    notes: str | None = None
    priority: int | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def validate_schedule(self):
        if (
            self.scheduled_start is not None
            and self.scheduled_end is not None
            and self.scheduled_end <= self.scheduled_start
        ):
            raise ValueError("scheduled_end must be later than scheduled_start")
        return self


class RolloutResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    percentage: float
    enabled: bool
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    notes: str | None
    priority: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)