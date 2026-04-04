import uuid
import random
import json
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import Optional

from models.quiz import (
    QuizType, QuizFocus, SourceLanguage, QuizStartRequest, QuizQuestion,
    QuizAnswerResult, QuizDetailItem, QuizSummary,
)
from models.vocabulary import Word
from services import vocabulary_service
from services.scoring import word_weight, EXCLUDE
from services.supabase_client import supabase

SESSION_COLUMNS = [
    "id", "tutor_id", "user_id", "quiz_type", "source_language",
    "total_questions", "correct_answers", "score_percent",
    "started_at", "ended_at", "details_json",
]


@dataclass
class SentenceQuestion:
    sentence: str
    translation: str
    word_id: str


@dataclass
class QuizSession:
    id: str
    tutor_id: str
    user_id: str
    language: str
    quiz_type: QuizType
    source_language: SourceLanguage
    questions: list[Word]
    total_questions: int
    current_index: int = 0
    details: list[QuizDetailItem] = field(default_factory=list)
    correct_count: int = 0
    started_at: str = ""
    awaiting_answer: bool = False
    current_sentence: Optional[SentenceQuestion] = None
    used_sentences: list[str] = field(default_factory=list)
    allow_small_errors: bool = False


_active_sessions: dict[str, QuizSession] = {}


def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        return _levenshtein(b, a)
    if len(b) == 0:
        return len(a)
    prev = list(range(len(b) + 1))
    for ca in a:
        curr = [prev[0] + 1]
        for j, cb in enumerate(b):
            cost = 0 if ca == cb else 1
            curr.append(min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost))
        prev = curr
    return prev[-1]


def start_session(tutor_id: str, user_id: str, language: str, req: QuizStartRequest) -> str:
    words = vocabulary_service.list_words(tutor_id)
    if not words:
        raise ValueError("No vocabulary words available")

    if req.quiz_type == QuizType.sentence:
        total_q = max(1, req.num_questions)
        selected: list[Word] = []
    else:
        eligible = [w for w in words if word_weight(w, req.focus) > EXCLUDE]
        if not eligible and req.focus == QuizFocus.balanced:
            eligible = words  # fallback: if every word is learned, use all
        if not eligible:
            raise ValueError(
                "No words match the selected focus. Try a different focus or add more words."
            )
        num_q = min(req.num_questions, len(eligible))
        selected = _weighted_sample(eligible, num_q, req.focus)
        total_q = len(selected)

    from services import tutor_service
    try:
        prefs = tutor_service.get_preferences(tutor_id, user_id)
        allow_small_errors = prefs.allow_small_errors
    except Exception:
        allow_small_errors = False

    session_id = uuid.uuid4().hex[:8]
    session = QuizSession(
        id=session_id,
        tutor_id=tutor_id,
        user_id=user_id,
        language=language,
        quiz_type=req.quiz_type,
        source_language=req.source_language,
        questions=selected,
        total_questions=total_q,
        started_at=datetime.now(timezone.utc).isoformat(),
        allow_small_errors=allow_small_errors,
    )
    _active_sessions[session_id] = session
    return session_id


def get_next_question(session_id: str, user_id: str) -> QuizQuestion:
    session = _get_session(session_id, user_id)
    if session.current_index >= session.total_questions:
        raise ValueError("No more questions")
    if session.quiz_type == QuizType.sentence:
        return _get_sentence_question(session)
    return _get_word_question(session)


def _get_word_question(session: QuizSession) -> QuizQuestion:
    word = session.questions[session.current_index]
    prompt = word.english if session.source_language == SourceLanguage.english else word.target_language
    session.awaiting_answer = True
    return QuizQuestion(
        question_number=session.current_index + 1,
        total_questions=session.total_questions,
        prompt=prompt,
        source_language=session.source_language,
        quiz_type=session.quiz_type,
        word_id=word.id,
    )


def _get_sentence_question(session: QuizSession) -> QuizQuestion:
    from services.sentence_service import generate_sentence

    all_words = vocabulary_service.list_words(session.tutor_id)
    result = generate_sentence(
        all_words,
        session.source_language.value,
        session.language,
        previous_sentences=session.used_sentences,
    )
    session.used_sentences.append(result["sentence"])
    session.current_sentence = SentenceQuestion(
        sentence=result["sentence"],
        translation=result["translation"],
        word_id=result.get("word_id", ""),
    )
    session.awaiting_answer = True
    return QuizQuestion(
        question_number=session.current_index + 1,
        total_questions=session.total_questions,
        prompt=result["sentence"],
        source_language=session.source_language,
        quiz_type=session.quiz_type,
        word_id=result.get("word_id"),
    )


def submit_answer(session_id: str, user_id: str, answer: str) -> QuizAnswerResult:
    session = _get_session(session_id, user_id)
    if not session.awaiting_answer:
        raise ValueError("No question awaiting answer")
    if session.quiz_type == QuizType.sentence:
        return _submit_sentence_answer(session, answer)
    return _submit_word_answer(session, answer)


def _submit_word_answer(session: QuizSession, answer: str) -> QuizAnswerResult:
    word = session.questions[session.current_index]
    if session.source_language == SourceLanguage.english:
        correct_answer = word.target_language
        prompt = word.english
    else:
        correct_answer = word.english
        prompt = word.target_language

    norm_answer = answer.strip().lower()
    norm_correct = correct_answer.strip().lower()
    is_correct = norm_answer == norm_correct
    explanation: str | None = None

    if not is_correct and session.allow_small_errors and _levenshtein(norm_answer, norm_correct) == 1:
        is_correct = True
        explanation = f"You wrote '{answer}' — one letter off."

    vocabulary_service.record_answer(word.id, is_correct)
    if is_correct:
        session.correct_count += 1

    session.details.append(QuizDetailItem(
        prompt=prompt, your_answer=answer,
        correct_answer=correct_answer, correct=is_correct,
    ))
    session.current_index += 1
    session.awaiting_answer = False

    return QuizAnswerResult(
        correct=is_correct, correct_answer=correct_answer,
        your_answer=answer, notes=word.notes or None,
        explanation=explanation,
    )


def _submit_sentence_answer(session: QuizSession, answer: str) -> QuizAnswerResult:
    from services.sentence_service import check_sentence_answer

    sq = session.current_sentence
    if not sq:
        raise ValueError("No sentence question active")

    target_lang_name = session.language if session.source_language == SourceLanguage.english else "English"
    result = check_sentence_answer(sq.sentence, sq.translation, answer, target_lang_name)

    is_correct = result["correct"]
    if is_correct:
        session.correct_count += 1

    session.details.append(QuizDetailItem(
        prompt=sq.sentence, your_answer=answer,
        correct_answer=sq.translation, correct=is_correct,
    ))
    session.current_index += 1
    session.awaiting_answer = False
    session.current_sentence = None

    return QuizAnswerResult(
        correct=is_correct, correct_answer=sq.translation,
        your_answer=answer, explanation=result.get("explanation"),
    )


def end_session(session_id: str, user_id: str) -> QuizSummary:
    session = _get_session(session_id, user_id)
    total = len(session.details) or 1
    score = round(session.correct_count / total * 100, 1)

    summary = QuizSummary(
        session_id=session.id,
        quiz_type=session.quiz_type,
        total_questions=total,
        correct_answers=session.correct_count,
        score_percent=score,
        details=session.details,
    )

    supabase.table("quiz_sessions").insert({
        "tutor_id": session.tutor_id,
        "user_id": session.user_id,
        "quiz_type": session.quiz_type.value,
        "source_language": session.source_language.value,
        "total_questions": total,
        "correct_answers": session.correct_count,
        "score_percent": score,
        "started_at": session.started_at,
        "ended_at": datetime.now(timezone.utc).isoformat(),
        "details_json": [d.model_dump() for d in session.details],
    }).execute()

    del _active_sessions[session_id]
    return summary


def _get_session(session_id: str, user_id: str) -> QuizSession:
    session = _active_sessions.get(session_id)
    if not session:
        raise ValueError("Session not found")
    if session.user_id != user_id:
        raise ValueError("Session not found")
    return session


def _weighted_sample(words: list[Word], k: int, focus: QuizFocus) -> list[Word]:
    # Pre-compute weights once; words are already filtered to eligible (weight > 0).
    remaining: list[tuple[Word, float]] = [(w, word_weight(w, focus) or 1.0) for w in words]
    selected: list[Word] = []
    for _ in range(k):
        ws, wts = zip(*remaining)
        chosen = random.choices(ws, weights=wts, k=1)[0]
        selected.append(chosen)
        remaining = [(w, wt) for w, wt in remaining if w is not chosen]
    return selected
