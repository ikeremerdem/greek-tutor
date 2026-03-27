from fastapi import APIRouter, HTTPException

from models.vocabulary import Word, WordCreate, WordUpdate
from services import vocabulary_service
from services.sentence_service import lookup_word

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.get("/lookup")
def lookup(english: str):
    try:
        return lookup_word(english)
    except Exception as e:
        raise HTTPException(500, f"Lookup failed: {e}")


@router.get("", response_model=list[Word])
def list_words():
    return vocabulary_service.list_words()


@router.post("", response_model=Word, status_code=201)
def add_word(data: WordCreate):
    try:
        return vocabulary_service.add_word(data)
    except ValueError as e:
        raise HTTPException(409, str(e))


@router.put("/{word_id}", response_model=Word)
def update_word(word_id: str, data: WordUpdate):
    word = vocabulary_service.update_word(word_id, data)
    if not word:
        raise HTTPException(404, "Word not found")
    return word


@router.delete("/{word_id}", status_code=204)
def delete_word(word_id: str):
    if not vocabulary_service.delete_word(word_id):
        raise HTTPException(404, "Word not found")
