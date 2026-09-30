from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.feature_evaluation import (
    FeatureEvaluationRequest,
    FeatureEvaluationResponse,
)
from app.services.feature_service import evaluate_feature


router = APIRouter(
    prefix="/feature-evaluation",
    tags=["Feature Evaluation"],
)


@router.post(
    "",
    response_model=FeatureEvaluationResponse,
)
def evaluate_feature_endpoint(
    evaluation_data: FeatureEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return evaluate_feature(
        db=db,
        feature_key=evaluation_data.feature_key,
        environment_name=evaluation_data.environment_name,
        user_id=evaluation_data.user_id,
    )