from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    EnvironmentAnalyticsResponse,
    FeatureAnalyticsResponse,
    FeatureUsageResponse,
)
from app.services.analytics_service import (
    get_analytics_summary,
    get_environment_analytics,
    get_feature_analytics,
    get_usage_history,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics_summary(db)


@router.get(
    "/features",
    response_model=list[FeatureAnalyticsResponse],
)
def feature_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_feature_analytics(db)


@router.get(
    "/environments",
    response_model=list[EnvironmentAnalyticsResponse],
)
def environment_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_environment_analytics(db)


@router.get(
    "/usage",
    response_model=list[FeatureUsageResponse],
)
def usage_history(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_usage_history(
        db=db,
        limit=limit,
    )