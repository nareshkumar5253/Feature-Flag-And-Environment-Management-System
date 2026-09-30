from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.rollback import RollbackRequest, RollbackResponse
from app.services.audit_service import create_audit_log
from app.services.rollback_service import (
    rollback_feature_flag,
    rollback_feature_rollout,
)

router = APIRouter(
    prefix="/rollback",
    tags=["Rollback"],
)


@router.post(
    "/feature-flag/{feature_flag_id}",
    response_model=RollbackResponse,
)
def rollback_feature_flag_endpoint(
    feature_flag_id: int,
    rollback_data: RollbackRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    audit_log = (
        db.query(AuditLog)
        .filter(AuditLog.id == rollback_data.audit_log_id)
        .first()
    )

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    try:
        feature_flag = rollback_feature_flag(
            db=db,
            feature_flag_id=feature_flag_id,
            audit_log=audit_log,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="ROLLBACK",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        old_value=f"enabled={not feature_flag.enabled}, default_value={not feature_flag.default_value}",
        new_value=f"enabled={feature_flag.enabled}, default_value={feature_flag.default_value}",
        ip_address=request.client.host if request.client else None,
    )

    return RollbackResponse(
        success=True,
        message="Feature flag rolled back successfully",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        audit_log_id=audit_log.id,
        rolled_back_at=datetime.utcnow(),
    )


@router.post(
    "/rollout/{rollout_id}",
    response_model=RollbackResponse,
)
def rollback_rollout_endpoint(
    rollout_id: int,
    rollback_data: RollbackRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    audit_log = (
        db.query(AuditLog)
        .filter(AuditLog.id == rollback_data.audit_log_id)
        .first()
    )

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    try:
        rollout = rollback_feature_rollout(
            db=db,
            rollout_id=rollout_id,
            audit_log=audit_log,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="ROLLBACK",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout.id,
        old_value="Current rollout configuration",
        new_value=(
            f"percentage={rollout.percentage}, "
            f"enabled={rollout.enabled}, "
            f"priority={rollout.priority}, "
            f"scheduled_start={rollout.scheduled_start}, "
            f"scheduled_end={rollout.scheduled_end}"
        ),
        ip_address=request.client.host if request.client else None,
    )

    return RollbackResponse(
        success=True,
        message="Feature rollout rolled back successfully",
        entity_type="FEATURE_ROLOUT",
        entity_id=rollout.id,
        audit_log_id=audit_log.id,
        rolled_back_at=datetime.utcnow(),
    )