from pydantic import BaseModel, Field


class TutorPreferences(BaseModel):
    allow_small_errors: bool = True


class LanguageTutor(BaseModel):
    id: str
    user_id: str
    language: str
    created_at: str
    preferences: TutorPreferences = Field(default_factory=TutorPreferences)


class TutorCreate(BaseModel):
    language: str
