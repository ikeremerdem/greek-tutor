from fastapi import APIRouter, Depends, HTTPException

from models.tutor import LanguageTutor, TutorCreate, TutorPreferences
from middleware.auth import get_current_user
from services import tutor_service

router = APIRouter(prefix="/api/tutors", tags=["tutors"])


@router.get("", response_model=list[LanguageTutor])
def list_tutors(user_id: str = Depends(get_current_user)):
    return tutor_service.list_tutors(user_id)


@router.post("", response_model=LanguageTutor, status_code=201)
def create_tutor(data: TutorCreate, user_id: str = Depends(get_current_user)):
    try:
        return tutor_service.create_tutor(user_id, data)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/{tutor_id}", status_code=204)
def delete_tutor(tutor_id: str, user_id: str = Depends(get_current_user)):
    if not tutor_service.delete_tutor(tutor_id, user_id):
        raise HTTPException(404, "Tutor not found")


@router.get("/{tutor_id}/preferences", response_model=TutorPreferences)
def get_preferences(tutor_id: str, user_id: str = Depends(get_current_user)):
    try:
        return tutor_service.get_preferences(tutor_id, user_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.patch("/{tutor_id}/preferences", response_model=TutorPreferences)
def update_preferences(tutor_id: str, data: TutorPreferences, user_id: str = Depends(get_current_user)):
    try:
        return tutor_service.update_preferences(tutor_id, user_id, data)
    except ValueError as e:
        raise HTTPException(404, str(e))
