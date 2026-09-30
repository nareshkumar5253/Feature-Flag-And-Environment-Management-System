from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_usage import FeatureUsage
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    EnvironmentAnalyticsResponse,
    FeatureAnalyticsResponse,
)


def record_feature_usage(
    db: Session,
    feature_flag_id: int,
    environment_id: int,
    user_id: int | None,
    enabled: bool,
    source: str,
    rollout_id: int | None = None,
) -> FeatureUsage:
    usage = FeatureUsage(
        feature_flag_id=feature_flag_id,
        environment_id=environment_id,
        user_id=user_id,
        enabled=enabled,
        source=source,
        rollout_id=rollout_id,
    )

    db.add(usage)
    db.commit()
    db.refresh(usage)

    return usage


def get_analytics_summary(
    db: Session,
) -> AnalyticsSummaryResponse:

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

    disabled_evaluations = (
        total_evaluations - enabled_evaluations
    )

    enabled_percentage = (
        round(
            (enabled_evaluations / total_evaluations) * 100,
            2,
        )
        if total_evaluations > 0
        else 0.0
    )

    unique_features = (
        db.query(
            func.count(
                func.distinct(
                    FeatureUsage.feature_flag_id
                )
            )
        )
        .scalar()
        or 0
    )

    unique_users = (
        db.query(
            func.count(
                func.distinct(
                    FeatureUsage.user_id
                )
            )
        )
        .filter(
            FeatureUsage.user_id.is_not(None)
        )
        .scalar()
        or 0
    )

    return AnalyticsSummaryResponse(
        total_evaluations=total_evaluations,
        enabled_evaluations=enabled_evaluations,
        disabled_evaluations=disabled_evaluations,
        enabled_percentage=enabled_percentage,
        unique_features=unique_features,
        unique_users=unique_users,
    )


def get_feature_analytics(
    db: Session,
) -> list[FeatureAnalyticsResponse]:

    rows = (
        db.query(
            FeatureFlag.id.label("feature_flag_id"),
            FeatureFlag.key.label("feature_key"),
            FeatureFlag.name.label("feature_name"),
            func.count(
                FeatureUsage.id
            ).label("total_evaluations"),
            func.sum(
                case(
                    (FeatureUsage.enabled.is_(True), 1),
                    else_=0,
                )
            ).label("enabled_evaluations"),
        )
        .join(
            FeatureUsage,
            FeatureUsage.feature_flag_id
            == FeatureFlag.id,
        )
        .group_by(
            FeatureFlag.id,
            FeatureFlag.key,
            FeatureFlag.name,
        )
        .order_by(
            func.count(
                FeatureUsage.id
            ).desc()
        )
        .all()
    )

    results = []

    for row in rows:
        total = int(
            row.total_evaluations or 0
        )

        enabled = int(
            row.enabled_evaluations or 0
        )

        disabled = total - enabled

        percentage = (
            round(
                (enabled / total) * 100,
                2,
            )
            if total > 0
            else 0.0
        )

        results.append(
            FeatureAnalyticsResponse(
                feature_flag_id=row.feature_flag_id,
                feature_key=row.feature_key,
                feature_name=row.feature_name,
                total_evaluations=total,
                enabled_evaluations=enabled,
                disabled_evaluations=disabled,
                enabled_percentage=percentage,
            )
        )

    return results


def get_environment_analytics(
    db: Session,
) -> list[EnvironmentAnalyticsResponse]:

    rows = (
        db.query(
            Environment.id.label("environment_id"),
            Environment.name.label("environment_name"),
            func.count(
                FeatureUsage.id
            ).label("total_evaluations"),
            func.sum(
                case(
                    (FeatureUsage.enabled.is_(True), 1),
                    else_=0,
                )
            ).label("enabled_evaluations"),
        )
        .join(
            FeatureUsage,
            FeatureUsage.environment_id
            == Environment.id,
        )
        .group_by(
            Environment.id,
            Environment.name,
        )
        .order_by(
            func.count(
                FeatureUsage.id
            ).desc()
        )
        .all()
    )

    results = []

    for row in rows:
        total = int(
            row.total_evaluations or 0
        )

        enabled = int(
            row.enabled_evaluations or 0
        )

        disabled = total - enabled

        percentage = (
            round(
                (enabled / total) * 100,
                2,
            )
            if total > 0
            else 0.0
        )

        results.append(
            EnvironmentAnalyticsResponse(
                environment_id=row.environment_id,
                environment_name=row.environment_name,
                total_evaluations=total,
                enabled_evaluations=enabled,
                disabled_evaluations=disabled,
                enabled_percentage=percentage,
            )
        )

    return results


def get_usage_history(
    db: Session,
    limit: int = 100,
) -> list[FeatureUsage]:

    return (
        db.query(FeatureUsage)
        .order_by(
            FeatureUsage.evaluated_at.desc(),
            FeatureUsage.id.desc(),
        )
        .limit(limit)
        .all()
    )