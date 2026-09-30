
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    role_id: int = Field(
        default=2,
        ge=1,
    )


class UserLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RoleResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role_id: int
    is_active: bool
    role: RoleResponse | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
