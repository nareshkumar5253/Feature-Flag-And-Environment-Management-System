from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.feature_usage import FeatureUsage
from app.schemas.dashboard import (
    DashboardRecentActivityResponse,
    DashboardSummaryResponse,
)


def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
    # ---------------------------------------------------------
    # FEATURE STATISTICS
    # ---------------------------------------------------------
    total_features = (
        db.query(func.count(FeatureFlag.id))
        .scalar()
        or 0
    )

    enabled_features = (
        db.query(func.count(FeatureFlag.id))
        .filter(FeatureFlag.enabled.is_(True))
        .scalar()
        or 0
    )

    disabled_features = total_features - enabled_features

    # ---------------------------------------------------------
    # ENVIRONMENT STATISTICS
    # ---------------------------------------------------------
    total_environments = (
        db.query(func.count(Environment.id))
        .scalar()
        or 0
    )

    active_environments = (
        db.query(func.count(Environment.id))
        .filter(Environment.is_active.is_(True))
        .scalar()
        or 0
    )

    inactive_environments = total_environments - active_environments

    # ---------------------------------------------------------
    # ROLLOUT STATISTICS
    # ---------------------------------------------------------
    total_rollouts = (
        db.query(func.count(FeatureRollout.id))
        .scalar()
        or 0
    )

    now = datetime.utcnow()

    active_rollouts = (
        db.query(func.count(FeatureRollout.id))
        .filter(
            FeatureRollout.enabled.is_(True),
            (
                FeatureRollout.scheduled_start.is_(None)
                | (FeatureRollout.scheduled_start <= now)
            ),
            (
                FeatureRollout.scheduled_end.is_(None)
                | (FeatureRollout.scheduled_end >= now)
            ),
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # FEATURE USAGE / EVALUATION STATISTICS
    # ---------------------------------------------------------
    total_evaluations = (
        db.query(func.count(FeatureUsage.id))
        .scalar()
        or 0
    )

    enabled_evaluations = (
        db.query(func.count(FeatureUsage.id))
        .filter(FeatureUsage.enabled.is_(True))
        .scalar()
        or 0
    )

    disabled_evaluations = total_evaluations - enabled_evaluations

    # ---------------------------------------------------------
    # UNIQUE USERS
    # ---------------------------------------------------------
    unique_users = (
        db.query(func.count(func.distinct(FeatureUsage.user_id)))
        .filter(FeatureUsage.user_id.is_not(None))
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # RECENT AUDIT ACTIVITY COUNT
    # Last 7 days
    # ---------------------------------------------------------
    seven_days_ago = now - timedelta(days=7)

    recent_audit_logs = (
        db.query(func.count(AuditLog.id))
        .filter(AuditLog.created_at >= seven_days_ago)
        .scalar()
        or 0
    )

    return DashboardSummaryResponse(
        total_features=total_features,
        enabled_features=enabled_features,
        disabled_features=disabled_features,

        total_environments=total_environments,
        active_environments=active_environments,
        inactive_environments=inactive_environments,

        total_rollouts=total_rollouts,
        active_rollouts=active_rollouts,

        total_evaluations=total_evaluations,
        enabled_evaluations=enabled_evaluations,
        disabled_evaluations=disabled_evaluations,

        unique_users=unique_users,
        recent_audit_logs=recent_audit_logs,
    )


def get_recent_dashboard_activity(
    db: Session,
    limit: int = 10,
) -> list[DashboardRecentActivityResponse]:
    audit_logs = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc(),
            AuditLog.id.desc(),
        )
        .limit(limit)
        .all()
    )

    return [
        DashboardRecentActivityResponse(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            user_id=log.user_id,
            old_value=log.old_value,
            new_value=log.new_value,
            created_at=log.created_at,
        )
        for log in audit_logs
    ]