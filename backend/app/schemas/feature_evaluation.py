from pydantic import BaseModel, Field


class FeatureEvaluationRequest(BaseModel):
    feature_key: str = Field(..., min_length=2, max_length=100)
    environment_name: str = Field(..., min_length=2, max_length=50)
    user_id: int | None = Field(default=None, ge=1)


class FeatureEvaluationResponse(BaseModel):
    feature_key: str
    environment: str
    user_id: int | None
    enabled: bool
    source: str
    message: str

    percentage: float | None = None
    bucket: int | None = None
    rollout_id: int | None = None