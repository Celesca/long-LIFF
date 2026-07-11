from __future__ import annotations

import json
import math
import os
import re
import uuid
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Any, Generator

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from minio.error import S3Error
from pydantic import BaseModel, Field
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from image_cache import MINIO_BUCKET, cached_urls, manifest_summary, minio_client


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_PLACES_PATH = ROOT_DIR / "data" / "places.json"


def load_backend_env() -> None:
    env_path = ROOT_DIR / "backend" / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_backend_env()


def resolve_backend_path(value: str | None, default: Path) -> Path:
    if not value:
        return default
    path = Path(value)
    if path.is_absolute():
        return path
    return (ROOT_DIR / "backend" / path).resolve()


PLACES_PATH = resolve_backend_path(os.getenv("PLACES_JSON_PATH"), DEFAULT_PLACES_PATH)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://long_liff:long_liff@localhost:5432/long_liff",
)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class UserRecord(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    line_user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PlaceRecord(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    place_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(Text)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    image: Mapped[str] = mapped_column(Text, default="")
    province: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserPlaceRecord(Base):
    __tablename__ = "user_places"
    __table_args__ = (UniqueConstraint("user_id", "place_id", name="uq_user_places_user_place"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    place_id: Mapped[str] = mapped_column(String(64), ForeignKey("places.place_id"), index=True)
    status: Mapped[str] = mapped_column(String(32), default="liked", index=True)
    source: Mapped[str] = mapped_column(String(64), default="swipe")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SwipeRecord(Base):
    __tablename__ = "swipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    place_id: Mapped[str] = mapped_column(String(64), ForeignKey("places.place_id"), index=True)
    direction: Mapped[str] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DiscoverySessionRecord(Base):
    __tablename__ = "discovery_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    radius_km: Mapped[float] = mapped_column(Float)
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="pin")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RoutePlanRecord(Base):
    __tablename__ = "route_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    personality: Mapped[str] = mapped_column(String(128))
    duration: Mapped[str] = mapped_column(String(128))
    anchor_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    anchor_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    radius_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    provider: Mapped[str] = mapped_column(String(64), default="fallback")
    prompt_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    result_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

app = FastAPI(
    title="TripNai POI API",
    description="FastAPI service for real POI discovery, Postgres workflow storage, and AI route generation.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        app.state.database_ready = True
    except SQLAlchemyError as exc:
        app.state.database_ready = False
        print(f"Database unavailable: {exc}")


def get_db() -> Generator[Session, None, None]:
    if not getattr(app.state, "database_ready", False):
        try:
            Base.metadata.create_all(bind=engine)
            app.state.database_ready = True
        except SQLAlchemyError as exc:
            raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Poi(BaseModel):
    id: str
    name: str
    lat: float
    long: float
    image: str = ""
    thumbnail_url: str = ""
    images: list[str] = Field(default_factory=list)
    description: str | None = None
    country: str = "Thailand"
    city: str | None = None
    province: str | None = None
    district: str | None = None
    address: str | None = None
    category: str | None = None
    type: str | None = None
    tags: list[str] = Field(default_factory=list)
    distance: str | None = None
    distance_km: float | None = None
    viewer: int | None = None
    slug: str | None = None


class PoiListResponse(BaseModel):
    places: list[Poi]
    total: int
    source_total: int


class PoiCluster(BaseModel):
    id: str
    label: str
    lat: float
    lng: float
    radius_km: int
    place_count: int
    image_count: int
    province: str | None = None
    district: str | None = None
    category: str | None = None
    thumbnail_url: str = ""
    sample_names: list[str] = Field(default_factory=list)


class PoiClusterResponse(BaseModel):
    clusters: list[PoiCluster]
    total: int


class UserCreate(BaseModel):
    line_user_id: str
    display_name: str | None = None
    picture_url: str | None = None


class UserResponse(BaseModel):
    id: int
    line_user_id: str
    display_name: str | None = None
    picture_url: str | None = None


class SwipeCreate(BaseModel):
    place: Poi
    direction: str = Field(pattern="^(left|right)$")
    source: str = "swipe"


class DiscoverySessionCreate(BaseModel):
    lat: float
    lng: float
    radius_km: float = 25
    label: str | None = None
    source: str = "pin"


class RouteAnchor(BaseModel):
    lat: float
    lng: float
    radius_km: float = 25
    label: str | None = None


class RouteGenerateRequest(BaseModel):
    personality: str
    duration: str
    anchor: RouteAnchor | None = None
    liked_place_ids: list[str] = Field(default_factory=list)


class RouteGenerateResponse(BaseModel):
    id: str
    trip_name: str
    description: str
    provider: str
    is_ai_generated: bool
    places: list[Poi]
    candidate_count: int
    anchor: RouteAnchor | None = None
    reasoning: str | None = None


def _first_string(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        for item in value:
            if isinstance(item, str) and item:
                return item
    return ""


def _string_list(value: Any) -> list[str]:
    if isinstance(value, str) and value:
        return [value]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str) and item]
    return []


def _nested_name(raw: dict[str, Any], *keys: str) -> str | None:
    current: Any = raw
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current if isinstance(current, str) and current else None


def _to_float(value: Any) -> float | None:
    try:
        if value in (None, ""):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return radius * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def _normalize_place(raw: dict[str, Any]) -> Poi | None:
    lat = _to_float(raw.get("latitude"))
    lon = _to_float(raw.get("longitude"))
    place_id = str(raw.get("placeId") or raw.get("id") or "").strip()

    if not place_id or lat is None or lon is None:
        return None
    if raw.get("status") and raw.get("status") != "approved":
        return None

    sha = raw.get("sha") if isinstance(raw.get("sha"), dict) else {}
    location = raw.get("location") if isinstance(raw.get("location"), dict) else {}
    tags = raw.get("tags") if isinstance(raw.get("tags"), list) else []
    category = raw.get("category") if isinstance(raw.get("category"), dict) else {}

    images = []
    for value in (
        raw.get("thumbnailUrl"),
        raw.get("thumbnail_url"),
        raw.get("thumbnailURL"),
        sha.get("thumbnailUrl"),
        sha.get("thumbnail_url"),
        sha.get("detailThumbnail"),
        sha.get("detailPicture"),
    ):
        images.extend(_string_list(value))

    images = list(dict.fromkeys(images))
    image = images[0] if images else ""
    description = raw.get("introduction") or sha.get("detail")

    return Poi(
        id=place_id,
        name=str(raw.get("name") or sha.get("name") or "Unnamed POI"),
        lat=lat,
        long=lon,
        image=image,
        thumbnail_url=image,
        images=images,
        description=description if isinstance(description, str) else None,
        city=_nested_name(location, "province", "name"),
        province=_nested_name(location, "province", "name"),
        district=_nested_name(location, "district", "name"),
        address=location.get("address") if isinstance(location.get("address"), str) else None,
        category=category.get("name") if isinstance(category.get("name"), str) else None,
        type=_nested_name(sha, "type", "name"),
        tags=[str(tag) for tag in tags if tag],
        viewer=raw.get("viewer") if isinstance(raw.get("viewer"), int) else None,
        slug=raw.get("slug") if isinstance(raw.get("slug"), str) else None,
    )


def _sanitize_place_images(place: Poi, require_image: bool = False) -> Poi | None:
    images = cached_urls(place.id)
    if require_image and not images:
        return None

    image = images[0] if images else ""
    return place.model_copy(
        update={
            "image": image,
            "thumbnail_url": image,
            "images": images,
        }
    )


def _sanitize_places_images(places: list[Poi], require_image: bool = False) -> list[Poi]:
    sanitized: list[Poi] = []
    for place in places:
        updated_place = _sanitize_place_images(place, require_image=require_image)
        if updated_place is not None:
            sanitized.append(updated_place)
    return sanitized


@lru_cache(maxsize=1)
def get_places() -> list[Poi]:
    if not PLACES_PATH.exists():
        raise FileNotFoundError(f"places.json not found at {PLACES_PATH}")

    with PLACES_PATH.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    if not isinstance(payload, list):
        raise ValueError("places.json must contain a list of places")

    places = [_normalize_place(item) for item in payload if isinstance(item, dict)]
    return [place for place in places if place is not None]


def get_or_create_user(
    db: Session,
    line_user_id: str,
    display_name: str | None = None,
    picture_url: str | None = None,
) -> UserRecord:
    user = db.query(UserRecord).filter(UserRecord.line_user_id == line_user_id).first()
    if user:
        if display_name is not None:
            user.display_name = display_name
        if picture_url is not None:
            user.picture_url = picture_url
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    user = UserRecord(line_user_id=line_user_id, display_name=display_name, picture_url=picture_url)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def require_user(db: Session, line_user_id: str) -> UserRecord:
    user = db.query(UserRecord).filter(UserRecord.line_user_id == line_user_id).first()
    if user:
        return user
    return get_or_create_user(db, line_user_id)


def upsert_place(db: Session, poi: Poi) -> PlaceRecord:
    poi = _sanitize_place_images(poi) or poi
    snapshot = poi.model_dump()
    place = db.query(PlaceRecord).filter(PlaceRecord.place_id == poi.id).first()

    if place:
        place.name = poi.name
        place.lat = poi.lat
        place.lng = poi.long
        place.image = poi.image
        place.province = poi.province
        place.district = poi.district
        place.category = poi.category
        place.snapshot = snapshot
        place.updated_at = datetime.utcnow()
    else:
        place = PlaceRecord(
            place_id=poi.id,
            name=poi.name,
            lat=poi.lat,
            lng=poi.long,
            image=poi.image,
            province=poi.province,
            district=poi.district,
            category=poi.category,
            snapshot=snapshot,
        )
        db.add(place)

    db.commit()
    db.refresh(place)
    return place


def poi_from_snapshot(snapshot: dict[str, Any]) -> Poi:
    return Poi.model_validate(snapshot)


def liked_places_for_user(db: Session, user: UserRecord) -> list[Poi]:
    rows = (
        db.query(UserPlaceRecord, PlaceRecord)
        .join(PlaceRecord, UserPlaceRecord.place_id == PlaceRecord.place_id)
        .filter(UserPlaceRecord.user_id == user.id, UserPlaceRecord.status == "liked")
        .order_by(UserPlaceRecord.updated_at.desc())
        .all()
    )
    return _sanitize_places_images([poi_from_snapshot(place.snapshot) for _, place in rows])


def desired_route_count(duration: str) -> int:
    if duration == "1 วัน ไม่ค้างคืน":
        return 3
    if duration == "2 วัน 1 คืน":
        return 6
    return 8


def centroid(places: list[Poi]) -> RouteAnchor | None:
    if not places:
        return None
    return RouteAnchor(
        lat=sum(place.lat for place in places) / len(places),
        lng=sum(place.long for place in places) / len(places),
        radius_km=35,
        label="AI liked-place centroid",
    )


def nearby_candidates(
    anchor: RouteAnchor,
    exclude_ids: set[str],
    limit: int,
    images_only: bool = True,
) -> list[Poi]:
    candidates: list[Poi] = []
    for place in get_places():
        if place.id in exclude_ids:
            continue
        place_with_images = _sanitize_place_images(place, require_image=images_only)
        if place_with_images is None:
            continue
        distance_km = _haversine_km(anchor.lat, anchor.lng, place_with_images.lat, place_with_images.long)
        if distance_km <= anchor.radius_km:
            candidates.append(
                place_with_images.model_copy(
                    update={
                        "distance_km": round(distance_km, 3),
                        "distance": f"{distance_km:.1f} km",
                    }
                )
            )
    candidates.sort(key=lambda item: (item.distance_km or 999999, -(item.viewer or 0)))
    return candidates[:limit]


def fallback_route(
    candidates: list[Poi],
    count: int,
    anchor: RouteAnchor | None,
    personality: str,
) -> list[Poi]:
    personality_keywords = {
        "introvert mode": ["วัด", "ธรรมชาติ", "พิพิธภัณฑ์", "สวน", "ศิลปะ", "เรียนรู้"],
        "extrovert mode": ["ตลาด", "ร้านอาหาร", "คาเฟ่", "ช้อป", "กลางคืน", "กิจกรรม"],
        "adventure mode": ["หาด", "เกาะ", "น้ำตก", "ภูเขา", "ผจญภัย", "กีฬา"],
    }
    keywords = personality_keywords.get(personality, [])

    def score(place: Poi) -> tuple[float, float, int]:
        text = " ".join([place.name, place.description or "", place.category or "", " ".join(place.tags)])
        keyword_score = sum(1 for keyword in keywords if keyword in text)
        distance = place.distance_km if place.distance_km is not None else 999999
        viewer = place.viewer or 0
        return (-keyword_score, distance, -viewer)

    selected = sorted(candidates, key=score)[:count]
    if len(selected) <= 2:
        return selected

    ordered = [selected.pop(0)]
    while selected:
        current = ordered[-1]
        next_index = min(
            range(len(selected)),
            key=lambda idx: _haversine_km(current.lat, current.long, selected[idx].lat, selected[idx].long),
        )
        ordered.append(selected.pop(next_index))

    if anchor:
        ordered.sort(key=lambda place: _haversine_km(anchor.lat, anchor.lng, place.lat, place.long))
    return ordered


def parse_json_content(content: str) -> dict[str, Any]:
    stripped = content.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", stripped, flags=re.DOTALL)
    if fence:
        stripped = fence.group(1).strip()
    return json.loads(stripped)


def call_openrouter(
    personality: str,
    duration: str,
    anchor: RouteAnchor | None,
    candidates: list[Poi],
    count: int,
) -> dict[str, Any] | None:
    if not OPENROUTER_API_KEY:
        return None

    candidate_payload = [
        {
            "id": place.id,
            "name": place.name,
            "category": place.category,
            "province": place.province,
            "district": place.district,
            "lat": place.lat,
            "lng": place.long,
            "distance_km": place.distance_km,
            "tags": place.tags[:6],
            "description": (place.description or "")[:350],
        }
        for place in candidates[:40]
    ]

    prompt = {
        "personality": personality,
        "duration": duration,
        "desired_place_count": count,
        "anchor": anchor.model_dump() if anchor else None,
        "candidate_places": candidate_payload,
        "instructions": [
            "Return strict JSON only.",
            "Select only ids that exist in candidate_places.",
            "Prioritize a coherent nearby route, minimal backtracking, and variety.",
            "If liked places are far from the anchor, choose nearby candidates that fit better.",
        ],
        "schema": {
            "trip_name": "string",
            "description": "string",
            "reasoning": "string",
            "ordered_place_ids": ["string"],
        },
    }

    try:
        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173"),
                "X-Title": os.getenv("OPENROUTER_APP_NAME", "TripNai Travel"),
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a Thai travel route planner. You return compact strict JSON.",
                    },
                    {
                        "role": "user",
                        "content": json.dumps(prompt, ensure_ascii=False),
                    },
                ],
                "temperature": 0.35,
            },
            timeout=30,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        parsed = parse_json_content(content)
        if isinstance(parsed.get("ordered_place_ids"), list):
            return parsed
    except Exception as exc:
        print(f"OpenRouter route generation failed: {exc}")
    return None


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    try:
        total = len(get_places())
    except Exception:
        total = 0
    return {"status": "ok", "places": total, "image_cache": manifest_summary()}


@app.get("/api/image-cache/status")
def image_cache_status() -> dict[str, Any]:
    return manifest_summary()


@app.get("/api/image-cache/images/{object_name:path}")
def cached_image(object_name: str) -> StreamingResponse:
    if not object_name.startswith("places/") or ".." in object_name.split("/"):
        raise HTTPException(status_code=400, detail="Invalid image object name")
    try:
        response = minio_client().get_object(MINIO_BUCKET, object_name)
    except S3Error as exc:
        if exc.code in {"NoSuchKey", "NoSuchObject", "NoSuchBucket"}:
            raise HTTPException(status_code=404, detail="Cached image not found") from exc
        raise HTTPException(status_code=503, detail="Image cache unavailable") from exc

    def stream() -> Generator[bytes, None, None]:
        try:
            yield from response.stream(64 * 1024)
        finally:
            response.close()
            response.release_conn()

    return StreamingResponse(
        stream(),
        media_type=response.headers.get("content-type", "image/webp"),
        headers={"Cache-Control": "public, max-age=86400, immutable"},
    )


@app.post("/api/users", response_model=UserResponse)
def create_or_get_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    user = get_or_create_user(db, payload.line_user_id, payload.display_name, payload.picture_url)
    return UserResponse(
        id=user.id,
        line_user_id=user.line_user_id,
        display_name=user.display_name,
        picture_url=user.picture_url,
    )


@app.get("/api/users/{line_user_id}/liked-places", response_model=PoiListResponse)
def get_liked_places(line_user_id: str, db: Session = Depends(get_db)) -> PoiListResponse:
    user = require_user(db, line_user_id)
    places = liked_places_for_user(db, user)
    return PoiListResponse(places=places, total=len(places), source_total=len(places))


@app.post("/api/users/{line_user_id}/swipes")
def record_swipe(line_user_id: str, payload: SwipeCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    user = require_user(db, line_user_id)
    upsert_place(db, payload.place)

    swipe = SwipeRecord(user_id=user.id, place_id=payload.place.id, direction=payload.direction)
    db.add(swipe)

    existing = (
        db.query(UserPlaceRecord)
        .filter(UserPlaceRecord.user_id == user.id, UserPlaceRecord.place_id == payload.place.id)
        .first()
    )
    status = "liked" if payload.direction == "right" else "dismissed"
    if existing:
        existing.status = status
        existing.source = payload.source
        existing.updated_at = datetime.utcnow()
    else:
        db.add(
            UserPlaceRecord(
                user_id=user.id,
                place_id=payload.place.id,
                status=status,
                source=payload.source,
            )
        )

    db.commit()
    return {"success": True, "place_id": payload.place.id, "status": status}


@app.get("/api/users/{line_user_id}/swipes")
def get_swipes(line_user_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    user = require_user(db, line_user_id)
    rows = (
        db.query(SwipeRecord)
        .filter(SwipeRecord.user_id == user.id)
        .order_by(SwipeRecord.created_at.desc())
        .all()
    )
    return {
        "swipes": [
            {
                "place_id": row.place_id,
                "direction": row.direction,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ],
        "total": len(rows),
    }


@app.delete("/api/users/{line_user_id}/swipes")
def clear_swipes(line_user_id: str, db: Session = Depends(get_db)) -> dict[str, bool]:
    user = require_user(db, line_user_id)
    db.query(SwipeRecord).filter(SwipeRecord.user_id == user.id).delete()
    db.query(UserPlaceRecord).filter(UserPlaceRecord.user_id == user.id, UserPlaceRecord.status == "dismissed").delete()
    db.commit()
    return {"success": True}


@app.delete("/api/users/{line_user_id}/liked-places/{place_id}")
def remove_liked_place(line_user_id: str, place_id: str, db: Session = Depends(get_db)) -> dict[str, bool]:
    user = require_user(db, line_user_id)
    row = (
        db.query(UserPlaceRecord)
        .filter(UserPlaceRecord.user_id == user.id, UserPlaceRecord.place_id == place_id)
        .first()
    )
    if row:
        row.status = "removed"
        row.updated_at = datetime.utcnow()
        db.commit()
    return {"success": True}


@app.delete("/api/users/{line_user_id}/liked-places")
def clear_liked_places(line_user_id: str, db: Session = Depends(get_db)) -> dict[str, bool]:
    user = require_user(db, line_user_id)
    rows = db.query(UserPlaceRecord).filter(UserPlaceRecord.user_id == user.id).all()
    for row in rows:
        row.status = "removed"
        row.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True}


@app.post("/api/users/{line_user_id}/discovery-sessions")
def create_discovery_session(
    line_user_id: str,
    payload: DiscoverySessionCreate,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    user = require_user(db, line_user_id)
    session = DiscoverySessionRecord(
        user_id=user.id,
        lat=payload.lat,
        lng=payload.lng,
        radius_km=payload.radius_km,
        label=payload.label,
        source=payload.source,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "id": session.id,
        "lat": session.lat,
        "lng": session.lng,
        "radius_km": session.radius_km,
        "label": session.label,
        "source": session.source,
    }


@app.get("/api/users/{line_user_id}/discovery-sessions/latest")
def get_latest_discovery_session(line_user_id: str, db: Session = Depends(get_db)) -> dict[str, Any] | None:
    user = require_user(db, line_user_id)
    session = (
        db.query(DiscoverySessionRecord)
        .filter(DiscoverySessionRecord.user_id == user.id)
        .order_by(DiscoverySessionRecord.created_at.desc())
        .first()
    )
    if not session:
        return None
    return {
        "id": session.id,
        "lat": session.lat,
        "lng": session.lng,
        "radius_km": session.radius_km,
        "label": session.label,
        "source": session.source,
    }


@app.post("/api/users/{line_user_id}/routes/generate", response_model=RouteGenerateResponse)
def generate_route(
    line_user_id: str,
    payload: RouteGenerateRequest,
    db: Session = Depends(get_db),
) -> RouteGenerateResponse:
    user = require_user(db, line_user_id)
    liked = liked_places_for_user(db, user)
    liked_by_id = {place.id: place for place in liked}

    selected_liked = [
        liked_by_id[place_id]
        for place_id in payload.liked_place_ids
        if place_id in liked_by_id
    ] or liked

    anchor = payload.anchor or centroid(selected_liked)
    count = desired_route_count(payload.duration)
    candidates: list[Poi] = []

    if anchor:
        for place in selected_liked:
            distance_km = _haversine_km(anchor.lat, anchor.lng, place.lat, place.long)
            if distance_km <= max(anchor.radius_km * 1.5, 20):
                candidates.append(
                    place.model_copy(
                        update={
                            "distance_km": round(distance_km, 3),
                            "distance": f"{distance_km:.1f} km",
                        }
                    )
                )
        exclude_ids = {place.id for place in candidates}
        candidates.extend(nearby_candidates(anchor, exclude_ids, limit=max(40, count * 8), images_only=True))
        if len(candidates) < count:
            exclude_ids = {place.id for place in candidates}
            candidates.extend(nearby_candidates(anchor, exclude_ids, limit=max(40, count * 8), images_only=False))
    else:
        candidates = selected_liked

    deduped: dict[str, Poi] = {}
    for place in candidates:
        deduped[place.id] = place
    candidates = list(deduped.values())

    if not candidates:
        raise HTTPException(status_code=404, detail="No liked or nearby places are available for route generation.")

    ai_payload = call_openrouter(payload.personality, payload.duration, anchor, candidates, count)
    places_by_id = {place.id: place for place in candidates}
    provider = "fallback"
    is_ai_generated = False
    reasoning = None
    trip_name = "TripNai Nearby Route"
    description = "Generated from your saved places and nearby real POIs."

    if ai_payload:
        ordered_ids = [str(place_id) for place_id in ai_payload.get("ordered_place_ids", [])]
        ordered = [places_by_id[place_id] for place_id in ordered_ids if place_id in places_by_id]
        if ordered:
            route_places = ordered[:count]
            provider = f"openrouter:{OPENROUTER_MODEL}"
            is_ai_generated = True
            reasoning = ai_payload.get("reasoning")
            trip_name = ai_payload.get("trip_name") or trip_name
            description = ai_payload.get("description") or description
        else:
            route_places = fallback_route(candidates, count, anchor, payload.personality)
    else:
        route_places = fallback_route(candidates, count, anchor, payload.personality)

    for place in route_places:
        upsert_place(db, place)

    route_id = str(uuid.uuid4())
    result_payload = {
        "trip_name": trip_name,
        "description": description,
        "reasoning": reasoning,
        "places": [place.model_dump() for place in route_places],
    }
    route_record = RoutePlanRecord(
        id=route_id,
        user_id=user.id,
        personality=payload.personality,
        duration=payload.duration,
        anchor_lat=anchor.lat if anchor else None,
        anchor_lng=anchor.lng if anchor else None,
        radius_km=anchor.radius_km if anchor else None,
        provider=provider,
        prompt_payload={
            "personality": payload.personality,
            "duration": payload.duration,
            "anchor": anchor.model_dump() if anchor else None,
            "liked_place_ids": payload.liked_place_ids,
            "candidate_count": len(candidates),
        },
        result_payload=result_payload,
        is_ai_generated=is_ai_generated,
    )
    db.add(route_record)
    db.commit()

    return RouteGenerateResponse(
        id=route_id,
        trip_name=trip_name,
        description=description,
        provider=provider,
        is_ai_generated=is_ai_generated,
        places=route_places,
        candidate_count=len(candidates),
        anchor=anchor,
        reasoning=reasoning,
    )


@app.get("/api/pois", response_model=PoiListResponse)
def list_pois(
    q: str | None = Query(default=None, description="Search name, description, tags, province, or district."),
    province: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PoiListResponse:
    try:
        places = get_places()
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    filtered = places
    if province:
        filtered = [place for place in filtered if place.province == province]
    if category:
        filtered = [place for place in filtered if place.category == category]
    if q:
        query = q.lower()
        filtered = [
            place
            for place in filtered
            if query
            in " ".join(
                [
                    place.name,
                    place.description or "",
                    place.province or "",
                    place.district or "",
                    " ".join(place.tags),
                ]
            ).lower()
        ]

    page = _sanitize_places_images(filtered[offset : offset + limit])
    return PoiListResponse(places=page, total=len(filtered), source_total=len(places))


@app.get("/api/pois/nearby", response_model=PoiListResponse)
def nearby_pois(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=25, gt=0, le=200),
    limit: int = Query(default=12, ge=1, le=100),
    exclude_ids: str | None = Query(default=None, description="Comma-separated place ids to exclude."),
    images_only: bool = Query(default=False),
) -> PoiListResponse:
    try:
        places = get_places()
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    excluded = {item.strip() for item in (exclude_ids or "").split(",") if item.strip()}
    nearby: list[Poi] = []

    for place in places:
        if place.id in excluded:
            continue
        place_with_images = _sanitize_place_images(place, require_image=images_only)
        if place_with_images is None:
            continue
        distance_km = _haversine_km(lat, lng, place_with_images.lat, place_with_images.long)
        if distance_km <= radius_km:
            nearby.append(
                place_with_images.model_copy(
                    update={
                        "distance_km": round(distance_km, 3),
                        "distance": f"{distance_km:.1f} km",
                    }
                )
            )

    nearby.sort(
        key=lambda item: (
            0 if item.thumbnail_url else 1,
            item.distance_km if item.distance_km is not None else 999999,
            item.name,
        )
    )
    return PoiListResponse(places=nearby[:limit], total=len(nearby), source_total=len(places))


@app.get("/api/poi-clusters", response_model=PoiClusterResponse)
def poi_clusters(
    limit: int = Query(default=12, ge=1, le=50),
    grid_size: float = Query(default=0.25, gt=0.05, le=1.0),
    min_places: int = Query(default=20, ge=1),
) -> PoiClusterResponse:
    try:
        places = get_places()
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    buckets: dict[tuple[int, int], list[Poi]] = {}
    for place in places:
        key = (math.floor(place.lat / grid_size), math.floor(place.long / grid_size))
        buckets.setdefault(key, []).append(place)

    clusters: list[PoiCluster] = []
    for (lat_cell, lng_cell), bucket in buckets.items():
        if len(bucket) < min_places:
            continue

        province_counts: dict[str, int] = {}
        district_counts: dict[str, int] = {}
        category_counts: dict[str, int] = {}
        for place in bucket:
            if place.province:
                province_counts[place.province] = province_counts.get(place.province, 0) + 1
            if place.district:
                district_counts[place.district] = district_counts.get(place.district, 0) + 1
            if place.category:
                category_counts[place.category] = category_counts.get(place.category, 0) + 1

        province = max(province_counts, key=province_counts.get) if province_counts else None
        district = max(district_counts, key=district_counts.get) if district_counts else None
        category = max(category_counts, key=category_counts.get) if category_counts else None
        with_images = _sanitize_places_images(bucket, require_image=True)
        thumbnail = with_images[0].thumbnail_url if with_images else ""
        sample_names = [place.name for place in sorted(bucket, key=lambda item: item.viewer or 0, reverse=True)[:3]]
        center_lat = sum(place.lat for place in bucket) / len(bucket)
        center_lng = sum(place.long for place in bucket) / len(bucket)

        clusters.append(
            PoiCluster(
                id=f"{lat_cell}:{lng_cell}",
                label=" / ".join(item for item in [district, province] if item) or f"{center_lat:.2f}, {center_lng:.2f}",
                lat=round(center_lat, 6),
                lng=round(center_lng, 6),
                radius_km=max(15, min(80, round(grid_size * 111))),
                place_count=len(bucket),
                image_count=len(with_images),
                province=province,
                district=district,
                category=category,
                thumbnail_url=thumbnail,
                sample_names=sample_names,
            )
        )

    clusters.sort(key=lambda item: (item.image_count, item.place_count), reverse=True)
    return PoiClusterResponse(clusters=clusters[:limit], total=len(clusters))
