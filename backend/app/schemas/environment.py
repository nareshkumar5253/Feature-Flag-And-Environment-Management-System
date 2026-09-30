from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnvironmentCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    description: str | None = None

    is_active: bool = True


class EnvironmentUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    description: str | None = None

    is_active: bool | None = None


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )