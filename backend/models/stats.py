from pydantic import BaseModel


class RecentSession(BaseModel):
    id: str
    quiz_type: str
    score_percent: float
    total_questions: int
    correct_answers: int
    ended_at: str


class WeeklyActivity(BaseModel):
    date: str
    sessions: int
    avg_score: float


class DashboardStats(BaseModel):
    total_words: int
    total_sessions: int
    average_score: float
    best_score: float
    recent_sessions: list[RecentSession]
    weekly_activity: list[WeeklyActivity]
