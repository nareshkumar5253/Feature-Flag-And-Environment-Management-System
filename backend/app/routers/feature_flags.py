from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.feature_flag import FeatureFlag
from app.models.user import User
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagResponse,
    FeatureFlagUpdate,
)
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Flags"],
)


@router.post(
    "",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feature_flag(
    feature_data: FeatureFlagCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DEVELOPER")),
):
    existing_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.key == feature_data.key)
        .first()
    )

    if existing_flag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feature flag key already exists",
        )

    feature_flag = FeatureFlag(
        key=feature_data.key,
        name=feature_data.name,
        description=feature_data.description,
        enabled=feature_data.enabled,
        default_value=feature_data.default_value,
    )

    db.add(feature_flag)
    db.commit()
    db.refresh(feature_flag)

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        old_value=None,
        new_value=(
            f"key={feature_flag.key}, "
            f"enabled={feature_flag.enabled}, "
            f"default_value={feature_flag.default_value}"
        ),
        ip_address=request.client.host if request.client else None,
    )

    return feature_flag


@router.get(
    "",
    response_model=list[FeatureFlagResponse],
)
def list_feature_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(FeatureFlag)
        .order_by(FeatureFlag.id.desc())
        .all()
    )


@router.get(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
)
def get_feature_flag(
    feature_flag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    return feature_flag


@router.put(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
)
def update_feature_flag(
    feature_flag_id: int,
    feature_data: FeatureFlagUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    old_value = (
        f"key={feature_flag.key}, "
        f"name={feature_flag.name}, "
        f"enabled={feature_flag.enabled}, "
        f"default_value={feature_flag.default_value}"
    )

    update_data = feature_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(feature_flag, field, value)

    db.commit()
    db.refresh(feature_flag)

    new_value = (
        f"key={feature_flag.key}, "
        f"name={feature_flag.name}, "
        f"enabled={feature_flag.enabled}, "
        f"default_value={feature_flag.default_value}"
    )

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        old_value=old_value,
        new_value=new_value,
        ip_address=request.client.host if request.client else None,
    )

    return feature_flag


@router.patch(
    "/{feature_flag_id}/enable",
    response_model=FeatureFlagResponse,
)
def enable_feature_flag(
    feature_flag_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    old_value = str(feature_flag.enabled)

    feature_flag.enabled = True

    db.commit()
    db.refresh(feature_flag)

    create_audit_log(
        db=db,
        user=current_user,
        action="ENABLE",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        old_value=old_value,
        new_value="True",
        ip_address=request.client.host if request.client else None,
    )

    return feature_flag


@router.patch(
    "/{feature_flag_id}/disable",
    response_model=FeatureFlagResponse,
)
def disable_feature_flag(
    feature_flag_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    old_value = str(feature_flag.enabled)

    feature_flag.enabled = False

    db.commit()
    db.refresh(feature_flag)

    create_audit_log(
        db=db,
        user=current_user,
        action="DISABLE",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag.id,
        old_value=old_value,
        new_value="False",
        ip_address=request.client.host if request.client else None,
    )

    return feature_flag


@router.delete(
    "/{feature_flag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_feature_flag(
    feature_flag_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ADMIN")
    ),
):
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    old_value = (
        f"key={feature_flag.key}, "
        f"name={feature_flag.name}, "
        f"enabled={feature_flag.enabled}, "
        f"default_value={feature_flag.default_value}"
    )

    feature_flag_id_value = feature_flag.id

    db.delete(feature_flag)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity_type="FEATURE_FLAG",
        entity_id=feature_flag_id_value,
        old_value=old_value,
        new_value=None,
        ip_address=request.client.host if request.client else None,
    )

    return None