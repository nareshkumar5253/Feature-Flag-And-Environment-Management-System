from datetime import datetime

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_features: int
    enabled_features: int
    disabled_features: int

    total_environments: int
    active_environments: int
    inactive_environments: int

    total_rollouts: int
    active_rollouts: int

    total_evaluations: int
    enabled_evaluations: int
    disabled_evaluations: int

    unique_users: int
    recent_audit_logs: int


class DashboardRecentActivityResponse(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: int | None
    user_id: int | None
    old_value: str | None
    new_value: str | None
    created_at: datetime