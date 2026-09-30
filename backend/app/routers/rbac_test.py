from fastapi import APIRouter, Depends

from app.core.dependencies import (
    get_current_user,
    get_current_admin,
    require_role,
)
from app.models.user import User


router = APIRouter(
    prefix="/rbac",
    tags=["Role-Based Access Control"],
)


@router.get("/user")
def user_access(
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Authenticated user access granted",
        "user_id": current_user.id,
        "name": current_user.full_name,
        "role": current_user.role.name,
    }


@router.get("/developer")
def developer_access(
    current_user: User = Depends(
        require_role("DEVELOPER")
    ),
):
    return {
        "message": "Developer access granted",
        "user_id": current_user.id,
        "name": current_user.full_name,
        "role": current_user.role.name,
    }


@router.get("/admin")
def admin_access(
    current_user: User = Depends(get_current_admin),
):
    return {
        "message": "Admin access granted",
        "user_id": current_user.id,
        "name": current_user.full_name,
        "role": current_user.role.name,
    }


@router.get("/admin-or-developer")
def admin_or_developer_access(
    current_user: User = Depends(
        require_role("ADMIN", "DEVELOPER")
    ),
):
    return {
        "message": "Admin or Developer access granted",
        "user_id": current_user.id,
        "name": current_user.full_name,
        "role": current_user.role.name,
    }