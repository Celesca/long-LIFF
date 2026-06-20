from __future__ import annotations

import json
import math
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_PLACES_PATH = ROOT_DIR / "data" / "places.json"
PLACES_PATH = Path(os.getenv("PLACES_JSON_PATH", DEFAULT_PLACES_PATH))

app = FastAPI(
    title="LONG POI API",
    description="Small FastAPI service for browsing real POIs from data/places.json.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/api/health")
def health_check() -> dict[str, str | int]:
    try:
        total = len(get_places())
    except Exception:
        total = 0
    return {"status": "ok", "places": total}


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

    page = filtered[offset : offset + limit]
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
        if images_only and not place.thumbnail_url:
            continue
        distance_km = _haversine_km(lat, lng, place.lat, place.long)
        if distance_km <= radius_km:
            nearby.append(
                place.model_copy(
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
        with_images = [place for place in bucket if place.thumbnail_url]
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
