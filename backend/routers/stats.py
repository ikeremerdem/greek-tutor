from fastapi import APIRouter

from models.stats import DashboardStats
from services import stats_service

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard():
    return stats_service.get_dashboard()
