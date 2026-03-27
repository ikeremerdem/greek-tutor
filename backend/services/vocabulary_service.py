import uuid
from datetime import datetime, timezone

from config import settings
from models.vocabulary import Word, WordCreate, WordUpdate
from services.csv_store import CsvStore

COLUMNS = ["id", "word_type", "english", "greek", "notes", "created_at"]

_store = CsvStore(settings.data_dir / "vocabulary.csv", COLUMNS)


def list_words() -> list[Word]:
    rows = _store.read_all()
    return [Word(**r) for r in rows]


def get_word(word_id: str) -> Word | None:
    row = _store.find_by_id(word_id)
    return Word(**row) if row else None


def add_word(data: WordCreate) -> Word:
    english_lower = data.english.strip().lower()
    for existing in _store.read_all():
        if existing["english"].strip().lower() == english_lower:
            raise ValueError(f"Word '{data.english.strip()}' already exists")
    row = {
        "id": uuid.uuid4().hex[:8],
        "word_type": data.word_type.value,
        "english": data.english.strip(),
        "greek": data.greek.strip(),
        "notes": data.notes.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _store.append(row)
    return Word(**row)


def update_word(word_id: str, data: WordUpdate) -> Word | None:
    updates = {k: v.value if hasattr(v, "value") else v.strip() if isinstance(v, str) else v
                for k, v in data.model_dump(exclude_unset=True).items()}
    row = _store.update(word_id, updates)
    return Word(**row) if row else None


def delete_word(word_id: str) -> bool:
    return _store.delete(word_id)
