from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.environment import Environment
from app.models.user import User
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentResponse,
    EnvironmentUpdate,
)
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/environments",
    tags=["Environments"],
)


@router.post(
    "",
    response_model=EnvironmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_environment(
    environment_data: EnvironmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    environment_name = environment_data.name.upper()

    existing_environment = (
        db.query(Environment)
        .filter(Environment.name == environment_name)
        .first()
    )

    if existing_environment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Environment already exists",
        )

    environment = Environment(
        name=environment_name,
        description=environment_data.description,
        is_active=environment_data.is_active,
    )

    db.add(environment)
    db.commit()
    db.refresh(environment)

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE",
        entity_type="ENVIRONMENT",
        entity_id=environment.id,
        old_value=None,
        new_value=(
            f"name={environment.name}, "
            f"is_active={environment.is_active}"
        ),
        ip_address=request.client.host if request.client else None,
    )

    return environment


@router.get(
    "",
    response_model=list[EnvironmentResponse],
)
def list_environments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Environment)
        .order_by(Environment.id.asc())
        .all()
    )


@router.get(
    "/{environment_id}",
    response_model=EnvironmentResponse,
)
def get_environment(
    environment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    return environment


@router.put(
    "/{environment_id}",
    response_model=EnvironmentResponse,
)
def update_environment(
    environment_id: int,
    environment_data: EnvironmentUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    old_value = (
        f"name={environment.name}, "
        f"description={environment.description}, "
        f"is_active={environment.is_active}"
    )

    update_data = environment_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        new_name = update_data["name"].upper()

        existing_environment = (
            db.query(Environment)
            .filter(
                Environment.name == new_name,
                Environment.id != environment_id,
            )
            .first()
        )

        if existing_environment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Environment name already exists",
            )

        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(environment, field, value)

    db.commit()
    db.refresh(environment)

    new_value = (
        f"name={environment.name}, "
        f"description={environment.description}, "
        f"is_active={environment.is_active}"
    )

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity_type="ENVIRONMENT",
        entity_id=environment.id,
        old_value=old_value,
        new_value=new_value,
        ip_address=request.client.host if request.client else None,
    )

    return environment


@router.patch(
    "/{environment_id}/activate",
    response_model=EnvironmentResponse,
)
def activate_environment(
    environment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    old_value = str(environment.is_active)

    environment.is_active = True

    db.commit()
    db.refresh(environment)

    create_audit_log(
        db=db,
        user=current_user,
        action="ACTIVATE",
        entity_type="ENVIRONMENT",
        entity_id=environment.id,
        old_value=old_value,
        new_value="True",
        ip_address=request.client.host if request.client else None,
    )

    return environment


@router.patch(
    "/{environment_id}/deactivate",
    response_model=EnvironmentResponse,
)
def deactivate_environment(
    environment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    old_value = str(environment.is_active)

    environment.is_active = False

    db.commit()
    db.refresh(environment)

    create_audit_log(
        db=db,
        user=current_user,
        action="DEACTIVATE",
        entity_type="ENVIRONMENT",
        entity_id=environment.id,
        old_value=old_value,
        new_value="False",
        ip_address=request.client.host if request.client else None,
    )

    return environment


@router.delete(
    "/{environment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_environment(
    environment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environment not found",
        )

    old_value = (
        f"name={environment.name}, "
        f"description={environment.description}, "
        f"is_active={environment.is_active}"
    )

    environment_id_value = environment.id

    db.delete(environment)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity_type="ENVIRONMENT",
        entity_id=environment_id_value,
        old_value=old_value,
        new_value=None,
        ip_address=request.client.host if request.client else None,
    )

    return None