from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.routers.auth import router as auth_router
from app.routers.feature_flags import router as feature_flags_router
from app.routers.environments import router as environments_router
from app.routers.rollouts import router as rollouts_router
from app.routers.assignments import router as assignments_router
from app.routers.analytics import router as analytics_router
from app.routers.audit_logs import router as audit_logs_router
from app.routers.feature_evaluation import router as feature_evaluation_router
from app.routers.rollback import router as rollback_router
from app.routers.dashboard import router as dashboard_router
from app.routers.users import router as users_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(feature_flags_router)
app.include_router(environments_router)
app.include_router(rollouts_router)
app.include_router(assignments_router)
app.include_router(analytics_router)
app.include_router(audit_logs_router)
app.include_router(feature_evaluation_router)
app.include_router(rollback_router)
app.include_router(dashboard_router)
app.include_router(users_router)

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Feature Flag & Environment Management System API",
        "version": settings.app_version,
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }