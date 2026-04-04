import json
from fastapi import APIRouter, Depends
from middleware.auth import get_current_admin
from services import admin_service
from services.supabase_client import supabase
from config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/check")
def check(_: str = Depends(get_current_admin)):
    return {"ok": True}


@router.get("/users", response_model=list[admin_service.UserStats])
def user_stats(_: str = Depends(get_current_admin)):
    return admin_service.get_user_stats()


@router.post("/packages/seed")
def seed_packages(admin_user_id: str = Depends(get_current_admin)):
    """Seed the 7 built-in JSON packages into the word_packages table as admin-owned public packages."""
    packages_dir = settings.data_dir / "packages"
    seeded = 0
    skipped = 0
    for path in sorted(packages_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            name = data["name"]
            # Skip if already exists
            existing = supabase.table("word_packages").select("id").eq("name", name).execute().data
            if existing:
                skipped += 1
                continue
            words = data.get("words", [])
            supabase.table("word_packages").insert({
                "user_id": admin_user_id,
                "name": name,
                "description": data.get("description", ""),
                "category": data.get("category", ""),
                "words": words,
                "word_count": len(words),
                "is_public": True,
            }).execute()
            seeded += 1
        except Exception:
            continue
    return {"seeded": seeded, "skipped": skipped}
