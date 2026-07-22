from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any

import httpx
from minio.error import S3Error
from PIL import Image, ImageOps

from image_cache import MANIFEST_PATH, MINIO_BUCKET, image_candidates, load_manifest, minio_client
from image_quality import MAX_IMAGE_BYTES, check_image_bytes


ROOT_DIR = Path(__file__).resolve().parents[1]
PLACES_PATH = Path(os.getenv("PLACES_JSON_PATH", ROOT_DIR / "data" / "places.json"))
MAX_IMAGES_PER_PLACE = int(os.getenv("IMAGE_CACHE_MAX_PER_PLACE", "3"))
RETRY_HOURS = float(os.getenv("IMAGE_CACHE_RETRY_HOURS", "12"))
WEBP_QUALITY = int(os.getenv("IMAGE_CACHE_WEBP_QUALITY", "82"))
MAX_EDGE = int(os.getenv("IMAGE_CACHE_MAX_EDGE", "1600"))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_manifest(manifest: dict[str, Any]) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = MANIFEST_PATH.with_suffix(".tmp")
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(MANIFEST_PATH)


def ensure_bucket() -> None:
    client = minio_client()
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)


def object_exists(object_name: str) -> bool:
    try:
        minio_client().stat_object(MINIO_BUCKET, object_name)
        return True
    except S3Error as exc:
        if exc.code in {"NoSuchKey", "NoSuchObject", "NoSuchBucket"}:
            return False
        raise


def encode_webp(content: bytes) -> bytes:
    with Image.open(BytesIO(content)) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        output = BytesIO()
        image.save(output, format="WEBP", quality=WEBP_QUALITY, method=6)
        return output.getvalue()


def due_for_retry(entry: dict[str, Any]) -> bool:
    checked_at = entry.get("checked_at")
    if not isinstance(checked_at, str):
        return True
    try:
        elapsed = datetime.now(timezone.utc) - datetime.fromisoformat(checked_at)
        return elapsed.total_seconds() >= RETRY_HOURS * 3600
    except ValueError:
        return True


def source_fingerprint(urls: list[str]) -> str:
    return hashlib.sha256("\n".join(urls).encode("utf-8")).hexdigest()


def cache_place(place_id: str, urls: list[str], previous: dict[str, Any]) -> dict[str, Any]:
    objects = [name for name in previous.get("objects", []) if isinstance(name, str) and object_exists(name)]
    attempts = int(previous.get("attempts", 0)) + 1
    failures: list[dict[str, str]] = []

    with httpx.Client(timeout=12, follow_redirects=True, headers={"User-Agent": "LONG image cache/1.0"}) as client:
        for url in urls:
            if len(objects) >= MAX_IMAGES_PER_PLACE:
                break
            digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
            object_name = f"places/{place_id}/{digest}.webp"
            if object_name in objects or object_exists(object_name):
                if object_name not in objects:
                    objects.append(object_name)
                continue
            try:
                response = client.get(url)
                response.raise_for_status()
                content = response.content
                if len(content) > MAX_IMAGE_BYTES:
                    failures.append({"url": url, "reason": "too-large"})
                    continue
                quality = check_image_bytes(content)
                if not quality.usable:
                    failures.append({"url": url, "reason": quality.reason})
                    continue
                encoded = encode_webp(content)
                minio_client().put_object(
                    MINIO_BUCKET,
                    object_name,
                    BytesIO(encoded),
                    len(encoded),
                    content_type="image/webp",
                    metadata={"source-url-sha256": hashlib.sha256(url.encode()).hexdigest()},
                )
                objects.append(object_name)
            except (httpx.HTTPError, OSError, S3Error) as exc:
                failures.append({"url": url, "reason": type(exc).__name__})

    status = "cached" if objects else ("no_source" if not urls else "failed")
    return {
        "status": status,
        "objects": objects,
        "source_urls": urls,
        "source_fingerprint": source_fingerprint(urls),
        "attempts": attempts,
        "checked_at": now_iso(),
        "failures": failures[-10:],
    }


def run_once() -> dict[str, Any]:
    ensure_bucket()
    payload = json.loads(PLACES_PATH.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("places.json must contain a list")

    manifest = load_manifest()
    manifest.setdefault("places", {})
    manifest.update(
        {
            "run_status": "running",
            "run_started_at": now_iso(),
            "source_total": len(payload),
            "updated_at": now_iso(),
            "last_error": None,
        }
    )
    write_manifest(manifest)
    print(f"Image cache batch started for {len(payload)} source places", flush=True)

    for index, raw in enumerate(payload, start=1):
        if not isinstance(raw, dict):
            continue
        place_id = str(raw.get("placeId") or raw.get("id") or "").strip()
        if not place_id:
            continue
        urls = image_candidates(raw)
        previous = manifest["places"].get(place_id, {})
        sources_changed = previous.get("source_fingerprint") != source_fingerprint(urls)
        if not sources_changed and not due_for_retry(previous):
            continue
        manifest["places"][place_id] = cache_place(place_id, urls, previous)
        if index % 25 == 0:
            manifest["updated_at"] = now_iso()
            write_manifest(manifest)
        if index % 250 == 0:
            print(f"Image cache progress: {index}/{len(payload)} places scanned", flush=True)

    manifest.update({"run_status": "complete", "run_finished_at": now_iso(), "updated_at": now_iso()})
    write_manifest(manifest)
    print(f"Image cache batch completed for {len(manifest['places'])} tracked places", flush=True)
    return manifest


def main() -> None:
    interval = int(os.getenv("IMAGE_CACHE_INTERVAL_SECONDS", "21600"))
    run_forever = "--watch" in sys.argv
    while True:
        try:
            run_once()
        except Exception as exc:
            print(f"Image cache batch failed: {exc}", flush=True)
            manifest = load_manifest()
            manifest.update(
                {
                    "run_status": "failed",
                    "run_finished_at": now_iso(),
                    "updated_at": now_iso(),
                    "last_error": str(exc)[:500],
                }
            )
            write_manifest(manifest)
        if not run_forever:
            return
        time.sleep(interval)


if __name__ == "__main__":
    main()
