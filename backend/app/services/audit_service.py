from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def create_audit_log(
    db: Session,
    user: User | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """
    Create and store an audit log entry.

    Records:
    - Who performed the action
    - What action was performed
    - Which entity was affected
    - Previous value
    - New value
    - IP address
    """

    audit_log = AuditLog(
        user_id=user.id if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log