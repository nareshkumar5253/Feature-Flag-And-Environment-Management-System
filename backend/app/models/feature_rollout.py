from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FeatureRollout(Base):
    __tablename__ = "feature_rollouts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    feature_flag_id: Mapped[int] = mapped_column(
        ForeignKey("feature_flags.id"),
        nullable=False,
    )

    environment_id: Mapped[int] = mapped_column(
        ForeignKey("environments.id"),
        nullable=False,
    )

    percentage: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        nullable=False,
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    scheduled_start: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    scheduled_end: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    feature_flag = relationship(
        "FeatureFlag",
        back_populates="rollouts",
    )

    environment = relationship(
        "Environment",
        back_populates="feature_rollouts",
    )