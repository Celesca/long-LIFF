from __future__ import annotations

import json
import os
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any

from minio import Minio


ROOT_DIR = Path(__file__).resolve().parents[1]
MANIFEST_PATH = Path(os.getenv("IMAGE_CACHE_MANIFEST_PATH", "/cache/image_manifest.json"))
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "place-images")
IMAGE_PROXY_PREFIX = "/api/image-cache/images"


def image_candidates(raw: dict[str, Any]) -> list[str]:
    sha = raw.get("sha") if isinstance(raw.get("sha"), dict) else {}
    values = (
        raw.get("thumbnailUrl"),
        raw.get("thumbnail_url"),
        raw.get("thumbnailURL"),
        sha.get("thumbnailUrl"),
        sha.get("thumbnail_url"),
        sha.get("detailThumbnail"),
        sha.get("detailPicture"),
    )
    urls: list[str] = []
    for value in values:
        if isinstance(value, str) and value.strip():
            urls.append(value.strip())
        elif isinstance(value, list):
            urls.extend(item.strip() for item in value if isinstance(item, str) and item.strip())
    return list(dict.fromkeys(urls))


@lru_cache(maxsize=2)
def _load_manifest_version(modified_ns: int) -> dict[str, Any]:
    try:
        with MANIFEST_PATH.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return payload if isinstance(payload, dict) else {"places": {}}
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"places": {}}


def load_manifest() -> dict[str, Any]:
    try:
        modified_ns = MANIFEST_PATH.stat().st_mtime_ns
    except OSError:
        modified_ns = 0
    return _load_manifest_version(modified_ns)


def cached_urls(place_id: str) -> list[str]:
    entry = load_manifest().get("places", {}).get(place_id, {})
    objects = entry.get("objects", []) if isinstance(entry, dict) else []
    return [f"{IMAGE_PROXY_PREFIX}/{object_name}" for object_name in objects if isinstance(object_name, str)]


def manifest_summary() -> dict[str, Any]:
    manifest = load_manifest()
    places = manifest.get("places", {})
    statuses = Counter(
        entry.get("status", "unknown")
        for entry in places.values()
        if isinstance(entry, dict)
    )
    return {
        "run_status": manifest.get("run_status", "not_started"),
        "updated_at": manifest.get("updated_at"),
        "run_started_at": manifest.get("run_started_at"),
        "run_finished_at": manifest.get("run_finished_at"),
        "source_total": manifest.get("source_total", 0),
        "tracked": len(places),
        "statuses": dict(statuses),
        "last_error": manifest.get("last_error"),
    }


@lru_cache(maxsize=1)
def minio_client() -> Minio:
    return Minio(
        os.getenv("MINIO_ENDPOINT", "localhost:9000"),
        access_key=os.getenv("MINIO_ACCESS_KEY", "longliff"),
        secret_key=os.getenv("MINIO_SECRET_KEY", "longliff-dev-secret"),
        secure=os.getenv("MINIO_SECURE", "false").lower() == "true",
    )
