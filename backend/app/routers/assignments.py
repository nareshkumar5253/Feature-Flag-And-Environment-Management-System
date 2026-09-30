from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.feature_flag import FeatureFlag
from app.models.user import User
from app.models.user_assignment import UserAssignment
from app.schemas.user_assignment import (
    UserAssignmentCreate,
    UserAssignmentResponse,
    UserAssignmentUpdate,
)


router = APIRouter(
    prefix="/assignments",
    tags=["User Feature Assignments"],
)


@router.post(
    "",
    response_model=UserAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assignment(
    assignment_data: UserAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DEVELOPER")),
):
    # Check user
    user = (
        db.query(User)
        .filter(User.id == assignment_data.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check feature flag
    feature_flag = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == assignment_data.feature_flag_id)
        .first()
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found",
        )

    # Prevent duplicate assignment
    existing_assignment = (
        db.query(UserAssignment)
        .filter(
            UserAssignment.user_id == assignment_data.user_id,
            UserAssignment.feature_flag_id
            == assignment_data.feature_flag_id,
        )
        .first()
    )

    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User assignment already exists",
        )

    assignment = UserAssignment(
        user_id=assignment_data.user_id,
        feature_flag_id=assignment_data.feature_flag_id,
        enabled=assignment_data.enabled,
        notes=assignment_data.notes,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get(
    "",
    response_model=list[UserAssignmentResponse],
)
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(UserAssignment)
        .order_by(UserAssignment.id.desc())
        .all()
    )


@router.get(
    "/{assignment_id}",
    response_model=UserAssignmentResponse,
)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(UserAssignment)
        .filter(UserAssignment.id == assignment_id)
        .first()
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    return assignment


@router.put(
    "/{assignment_id}",
    response_model=UserAssignmentResponse,
)
def update_assignment(
    assignment_id: int,
    assignment_data: UserAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DEVELOPER")),
):
    assignment = (
        db.query(UserAssignment)
        .filter(UserAssignment.id == assignment_id)
        .first()
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    update_data = assignment_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)

    return assignment


@router.patch(
    "/{assignment_id}/enable",
    response_model=UserAssignmentResponse,
)
def enable_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DEVELOPER")),
):
    assignment = (
        db.query(UserAssignment)
        .filter(UserAssignment.id == assignment_id)
        .first()
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    assignment.enabled = True

    db.commit()
    db.refresh(assignment)

    return assignment


@router.patch(
    "/{assignment_id}/disable",
    response_model=UserAssignmentResponse,
)
def disable_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DEVELOPER")),
):
    assignment = (
        db.query(UserAssignment)
        .filter(UserAssignment.id == assignment_id)
        .first()
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    assignment.enabled = False

    db.commit()
    db.refresh(assignment)

    return assignment


@router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    assignment = (
        db.query(UserAssignment)
        .filter(UserAssignment.id == assignment_id)
        .first()
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    db.delete(assignment)
    db.commit()

    return None