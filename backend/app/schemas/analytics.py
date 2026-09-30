from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FeatureUsageResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    user_id: int | None
    enabled: bool
    source: str
    rollout_id: int | None
    evaluated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureAnalyticsResponse(BaseModel):
    feature_flag_id: int
    feature_key: str
    feature_name: str
    total_evaluations: int
    enabled_evaluations: int
    disabled_evaluations: int
    enabled_percentage: float


class EnvironmentAnalyticsResponse(BaseModel):
    environment_id: int
    environment_name: str
    total_evaluations: int
    enabled_evaluations: int
    disabled_evaluations: int
    enabled_percentage: float


class AnalyticsSummaryResponse(BaseModel):
    total_evaluations: int
    enabled_evaluations: int
    disabled_evaluations: int
    enabled_percentage: float
    unique_features: int
    unique_users: int