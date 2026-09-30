from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    DashboardRecentActivityResponse,
    DashboardSummaryResponse,
)
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_recent_dashboard_activity,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_summary(db)


@router.get(
    "/recent-activity",
    response_model=list[DashboardRecentActivityResponse],
)
def dashboard_recent_activity(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recent_dashboard_activity(
        db=db,
        limit=limit,
    )