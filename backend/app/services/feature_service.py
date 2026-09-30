from datetime import datetime

from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.user import User
from app.models.user_assignment import UserAssignment
from app.services.analytics_service import record_feature_usage


def _record_and_return(
    db: Session,
    feature_flag_id: int,
    environment_id: int,
    result: dict,
) -> dict:
    """
    Record a feature evaluation and return the original response.
    """

    record_feature_usage(
        db=db,
        feature_flag_id=feature_flag_id,
        environment_id=environment_id,
        user_id=result.get("user_id"),
        enabled=result.get("enabled", False),
        source=result.get("source", "UNKNOWN"),
        rollout_id=result.get("rollout_id"),
    )

    return result


def evaluate_feature(
    db: Session,
    feature_key: str,
    environment_name: str,
    user_id: int | None = None,
) -> dict:
    """
    Evaluate whether a feature is enabled for a user
    in a specific environment.

    Evaluation priority:

    1. User-specific assignment
    2. Scheduled rollout
    3. Percentage rollout
    4. Environment default
    5. Disabled
    """

    # ---------------------------------------------------------
    # 1. Find feature flag
    # ---------------------------------------------------------
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.key == feature_key)
        .first()
    )

    if feature_flag is None:
        return {
            "feature_key": feature_key,
            "environment": environment_name.upper(),
            "user_id": user_id,
            "enabled": False,
            "source": "FEATURE_NOT_FOUND",
            "message": "Feature flag not found",
        }

    # ---------------------------------------------------------
    # 2. Find environment
    # ---------------------------------------------------------
    environment = (
        db.query(Environment)
        .filter(
            Environment.name == environment_name.upper()
        )
        .first()
    )

    if environment is None:
        return {
            "feature_key": feature_flag.key,
            "environment": environment_name.upper(),
            "user_id": user_id,
            "enabled": False,
            "source": "ENVIRONMENT_NOT_FOUND",
            "message": "Environment not found",
        }

    # ---------------------------------------------------------
    # 3. Environment must be active
    # ---------------------------------------------------------
    if not environment.is_active:
        result = {
            "feature_key": feature_flag.key,
            "environment": environment.name,
            "user_id": user_id,
            "enabled": False,
            "source": "ENVIRONMENT_INACTIVE",
            "message": "Environment is inactive",
        }

        return _record_and_return(
            db,
            feature_flag.id,
            environment.id,
            result,
        )

    # ---------------------------------------------------------
    # 4. Validate user if supplied
    # ---------------------------------------------------------
    if user_id is not None:
        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if user is None:
            return {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": False,
                "source": "USER_NOT_FOUND",
                "message": "User not found",
            }

        if not user.is_active:
            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": False,
                "source": "USER_INACTIVE",
                "message": "User account is inactive",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

        # -----------------------------------------------------
        # 5. User-specific assignment
        # -----------------------------------------------------
        assignment = (
            db.query(UserAssignment)
            .filter(
                UserAssignment.user_id == user_id,
                UserAssignment.feature_flag_id
                == feature_flag.id,
            )
            .first()
        )

        if assignment is not None:
            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": assignment.enabled,
                "source": "USER_ASSIGNMENT",
                "message": "Feature evaluated using user-specific assignment",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

    # ---------------------------------------------------------
    # 6. Find rollouts for this feature/environment
    # ---------------------------------------------------------
    rollouts = (
        db.query(FeatureRollout)
        .filter(
            FeatureRollout.feature_flag_id == feature_flag.id,
            FeatureRollout.environment_id == environment.id,
            FeatureRollout.enabled.is_(True),
        )
        .order_by(
            FeatureRollout.priority.asc(),
            FeatureRollout.id.desc(),
        )
        .all()
    )

    now = datetime.utcnow()

    # ---------------------------------------------------------
    # 7. Scheduled rollout
    # ---------------------------------------------------------
    for rollout in rollouts:
        has_schedule = (
            rollout.scheduled_start is not None
            or rollout.scheduled_end is not None
        )

        if not has_schedule:
            continue

        start_valid = (
            rollout.scheduled_start is None
            or now >= rollout.scheduled_start
        )

        end_valid = (
            rollout.scheduled_end is None
            or now <= rollout.scheduled_end
        )

        if start_valid and end_valid:
            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": rollout.percentage > 0,
                "percentage": rollout.percentage,
                "source": "SCHEDULED_ROLLOUT",
                "rollout_id": rollout.id,
                "message": "Feature evaluated using scheduled rollout",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

    # ---------------------------------------------------------
    # 8. Percentage rollout
    # ---------------------------------------------------------
    for rollout in rollouts:
        has_schedule = (
            rollout.scheduled_start is not None
            or rollout.scheduled_end is not None
        )

        if has_schedule:
            continue

        percentage = rollout.percentage

        if percentage <= 0:
            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": False,
                "percentage": percentage,
                "source": "PERCENTAGE_ROLLOUT",
                "rollout_id": rollout.id,
                "message": "Feature disabled by percentage rollout",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

        if percentage >= 100:
            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": True,
                "percentage": percentage,
                "source": "PERCENTAGE_ROLLOUT",
                "rollout_id": rollout.id,
                "message": "Feature enabled for 100 percent rollout",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

        if user_id is not None:
            bucket = (
                abs(hash(f"{feature_flag.key}:{user_id}"))
                % 100
            )

            enabled = bucket < percentage

            result = {
                "feature_key": feature_flag.key,
                "environment": environment.name,
                "user_id": user_id,
                "enabled": enabled,
                "percentage": percentage,
                "bucket": bucket,
                "source": "PERCENTAGE_ROLLOUT",
                "rollout_id": rollout.id,
                "message": "Feature evaluated using percentage rollout",
            }

            return _record_and_return(
                db,
                feature_flag.id,
                environment.id,
                result,
            )

        result = {
            "feature_key": feature_flag.key,
            "environment": environment.name,
            "user_id": None,
            "enabled": True,
            "percentage": percentage,
            "source": "PERCENTAGE_ROLLOUT",
            "rollout_id": rollout.id,
            "message": "Percentage rollout configured; user ID required for deterministic evaluation",
        }

        return _record_and_return(
            db,
            feature_flag.id,
            environment.id,
            result,
        )

    # ---------------------------------------------------------
    # 9. Feature default value
    # ---------------------------------------------------------
    if feature_flag.enabled:
        result = {
            "feature_key": feature_flag.key,
            "environment": environment.name,
            "user_id": user_id,
            "enabled": True,
            "source": "FEATURE_FLAG",
            "message": "Feature enabled globally",
        }

        return _record_and_return(
            db,
            feature_flag.id,
            environment.id,
            result,
        )

    if feature_flag.default_value:
        result = {
            "feature_key": feature_flag.key,
            "environment": environment.name,
            "user_id": user_id,
            "enabled": True,
            "source": "ENVIRONMENT_DEFAULT",
            "message": "Feature enabled using default value",
        }

        return _record_and_return(
            db,
            feature_flag.id,
            environment.id,
            result,
        )

    # ---------------------------------------------------------
    # 10. Final fallback
    # ---------------------------------------------------------
    result = {
        "feature_key": feature_flag.key,
        "environment": environment.name,
        "user_id": user_id,
        "enabled": False,
        "source": "DISABLED",
        "message": "Feature is disabled",
    }

    return _record_and_return(
        db,
        feature_flag.id,
        environment.id,
        result,
    )