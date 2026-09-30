from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout


def rollback_feature_flag(
    db: Session,
    feature_flag_id: int,
    audit_log: AuditLog,
) -> FeatureFlag:
    """
    Restore a feature flag to the state recorded in an audit log.
    """

    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise ValueError("Feature flag not found")

    if audit_log.entity_type != "FEATURE_FLAG":
        raise ValueError("Audit log does not belong to a feature flag")

    if audit_log.entity_id != feature_flag_id:
        raise ValueError("Audit log does not belong to this feature flag")

    if not audit_log.old_value:
        raise ValueError("No previous state available for rollback")

    old_value = audit_log.old_value

    # ENABLE / DISABLE audit records store the previous
    # enabled state directly as "True" or "False".
    if audit_log.action in {"ENABLE", "DISABLE"}:
        if old_value.lower() == "true":
            feature_flag.enabled = True
        elif old_value.lower() == "false":
            feature_flag.enabled = False
        else:
            raise ValueError("Invalid previous enabled state in audit log")

    # UPDATE audit records store multiple key=value pairs.
    else:
        values = {}

        for item in old_value.split(", "):
            if "=" not in item:
                continue

            key, value = item.split("=", 1)
            values[key.strip()] = value.strip()

        if "enabled" in values:
            feature_flag.enabled = values["enabled"].lower() == "true"

        if "default_value" in values:
            feature_flag.default_value = (
                values["default_value"].lower() == "true"
            )

    db.commit()
    db.refresh(feature_flag)

    return feature_flag


def rollback_feature_rollout(
    db: Session,
    rollout_id: int,
    audit_log: AuditLog,
) -> FeatureRollout:
    """
    Restore a feature rollout to the state recorded in an audit log.
    """

    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise ValueError("Feature rollout not found")

    if audit_log.entity_type != "FEATURE_ROLLOUT":
        raise ValueError("Audit log does not belong to a feature rollout")

    if audit_log.entity_id != rollout_id:
        raise ValueError("Audit log does not belong to this rollout")

    if not audit_log.old_value:
        raise ValueError("No previous state available for rollback")

    old_value = audit_log.old_value

    values = {}

    for item in old_value.split(", "):
        if "=" not in item:
            continue

        key, value = item.split("=", 1)
        values[key.strip()] = value.strip()

    if "percentage" in values:
        rollout.percentage = float(values["percentage"])

    if "enabled" in values:
        rollout.enabled = values["enabled"].lower() == "true"

    if "priority" in values:
        rollout.priority = int(values["priority"])

    if "scheduled_start" in values:
        value = values["scheduled_start"]
        rollout.scheduled_start = None if value == "None" else value

    if "scheduled_end" in values:
        value = values["scheduled_end"]
        rollout.scheduled_end = None if value == "None" else value

    db.commit()
    db.refresh(rollout)

    return rollout