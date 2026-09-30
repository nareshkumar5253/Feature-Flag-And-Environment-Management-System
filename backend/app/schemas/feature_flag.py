from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeatureFlagCreate(BaseModel):
    key: str = Field(
        ...,
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9][a-z0-9_.-]*$",
    )

    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    description: str | None = None

    enabled: bool = False

    default_value: bool = False


class FeatureFlagUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = None

    enabled: bool | None = None

    default_value: bool | None = None


class FeatureFlagResponse(BaseModel):
    id: int
    key: str
    name: str
    description: str | None
    enabled: bool
    default_value: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )