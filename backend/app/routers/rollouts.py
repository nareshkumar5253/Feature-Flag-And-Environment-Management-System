from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.user import User
from app.schemas.rollout import RolloutCreate, RolloutResponse, RolloutUpdate
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/rollouts",
    tags=["Feature Rollouts"],
)


@router.post(
    "",
    response_model=RolloutResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_rollout(
    rollout_data: RolloutCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == rollout_data.feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    environment = (
        db.query(Environment)
        .filter(Environment.id == rollout_data.environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    if not environment.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Environment is inactive",
        )

    rollout = FeatureRollout(
        feature_flag_id=rollout_data.feature_flag_id,
        environment_id=rollout_data.environment_id,
        percentage=rollout_data.percentage,
        enabled=rollout_data.enabled,
        scheduled_start=rollout_data.scheduled_start,
        scheduled_end=rollout_data.scheduled_end,
        notes=rollout_data.notes,
        priority=rollout_data.priority,
    )

    db.add(rollout)
    db.commit()
    db.refresh(rollout)

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout.id,
        old_value=None,
        new_value=(
            f"feature_flag_id={rollout.feature_flag_id}, "
            f"environment_id={rollout.environment_id}, "
            f"percentage={rollout.percentage}, "
            f"enabled={rollout.enabled}, "
            f"priority={rollout.priority}"
        ),
        ip_address=request.client.host if request.client else None,
    )

    return rollout


@router.get(
    "",
    response_model=list[RolloutResponse],
)
def list_rollouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(FeatureRollout)
        .order_by(
            FeatureRollout.priority.asc(),
            FeatureRollout.id.desc(),
        )
        .all()
    )


@router.get(
    "/{rollout_id}",
    response_model=RolloutResponse,
)
def get_rollout(
    rollout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rollout not found",
        )

    return rollout


@router.put(
    "/{rollout_id}",
    response_model=RolloutResponse,
)
def update_rollout(
    rollout_id: int,
    rollout_data: RolloutUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rollout not found",
        )

    old_value = (
        f"feature_flag_id={rollout.feature_flag_id}, "
        f"environment_id={rollout.environment_id}, "
        f"percentage={rollout.percentage}, "
        f"enabled={rollout.enabled}, "
        f"scheduled_start={rollout.scheduled_start}, "
        f"scheduled_end={rollout.scheduled_end}, "
        f"priority={rollout.priority}"
    )

    update_data = rollout_data.model_dump(
        exclude_unset=True
    )

    if (
        "scheduled_start" in update_data
        and "scheduled_end" in update_data
        and update_data["scheduled_start"] is not None
        and update_data["scheduled_end"] is not None
        and update_data["scheduled_end"]
        <= update_data["scheduled_start"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_end must be later than scheduled_start",
        )

    for field, value in update_data.items():
        setattr(rollout, field, value)

    db.commit()
    db.refresh(rollout)

    new_value = (
        f"feature_flag_id={rollout.feature_flag_id}, "
        f"environment_id={rollout.environment_id}, "
        f"percentage={rollout.percentage}, "
        f"enabled={rollout.enabled}, "
        f"scheduled_start={rollout.scheduled_start}, "
        f"scheduled_end={rollout.scheduled_end}, "
        f"priority={rollout.priority}"
    )

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout.id,
        old_value=old_value,
        new_value=new_value,
        ip_address=request.client.host if request.client else None,
    )

    return rollout


@router.patch(
    "/{rollout_id}/enable",
    response_model=RolloutResponse,
)
def enable_rollout(
    rollout_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rollout not found",
        )

    old_value = str(rollout.enabled)

    rollout.enabled = True

    db.commit()
    db.refresh(rollout)

    create_audit_log(
        db=db,
        user=current_user,
        action="ENABLE",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout.id,
        old_value=old_value,
        new_value="True",
        ip_address=request.client.host if request.client else None,
    )

    return rollout


@router.patch(
    "/{rollout_id}/disable",
    response_model=RolloutResponse,
)
def disable_rollout(
    rollout_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rollout not found",
        )

    old_value = str(rollout.enabled)

    rollout.enabled = False

    db.commit()
    db.refresh(rollout)

    create_audit_log(
        db=db,
        user=current_user,
        action="DISABLE",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout.id,
        old_value=old_value,
        new_value="False",
        ip_address=request.client.host if request.client else None,
    )

    return rollout


@router.delete(
    "/{rollout_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_rollout(
    rollout_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN")
    ),
):
    rollout = (
        db.query(FeatureRollout)
        .filter(FeatureRollout.id == rollout_id)
        .first()
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rollout not found",
        )

    old_value = (
        f"feature_flag_id={rollout.feature_flag_id}, "
        f"environment_id={rollout.environment_id}, "
        f"percentage={rollout.percentage}, "
        f"enabled={rollout.enabled}, "
        f"priority={rollout.priority}"
    )

    rollout_id_value = rollout.id

    db.delete(rollout)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity_type="FEATURE_ROLLOUT",
        entity_id=rollout_id_value,
        old_value=old_value,
        new_value=None,
        ip_address=request.client.host if request.client else None,
    )

    return None