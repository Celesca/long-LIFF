from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from io import BytesIO
from pathlib import Path

import httpx
from PIL import Image, ImageOps, UnidentifiedImageError


ROOT_DIR = Path(__file__).resolve().parents[1]
SHA_REFERENCE_PATH = ROOT_DIR / "src" / "assets" / "sha-logo.png"

IMAGE_FILTER_ENABLED = os.getenv("IMAGE_FILTER_ENABLED", "true").lower() != "false"
REJECT_UNCHECKED_IMAGES = os.getenv("REJECT_UNCHECKED_IMAGES", "false").lower() == "true"
SHA_MATCH_THRESHOLD = float(os.getenv("SHA_MATCH_THRESHOLD", "0.90"))
MIN_IMAGE_EDGE = int(os.getenv("MIN_IMAGE_EDGE", "260"))
MIN_SHARPNESS_SCORE = float(os.getenv("MIN_SHARPNESS_SCORE", "32"))
IMAGE_FETCH_TIMEOUT_SECONDS = float(os.getenv("IMAGE_FETCH_TIMEOUT_SECONDS", "4"))
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(8 * 1024 * 1024)))


@dataclass(frozen=True)
class ImageQualityResult:
    usable: bool
    reason: str = "ok"
    sha_similarity: float = 0.0
    sharpness: float = 0.0
    width: int = 0
    height: int = 0


def _normalized_rgb(image: Image.Image, size: tuple[int, int] | None = None) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA"):
        background = Image.new("RGBA", image.size, (255, 255, 255, 255))
        background.alpha_composite(image.convert("RGBA"))
        image = background.convert("RGB")
    else:
        image = image.convert("RGB")
    if size:
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)
    return image


def _average_hash(image: Image.Image, size: int = 16) -> tuple[int, ...]:
    gray = _normalized_rgb(image, (size, size)).convert("L")
    pixels = list(gray.getdata())
    average = sum(pixels) / len(pixels)
    return tuple(1 if pixel >= average else 0 for pixel in pixels)


def _difference_hash(image: Image.Image, size: int = 16) -> tuple[int, ...]:
    gray = _normalized_rgb(image, (size + 1, size)).convert("L")
    bits: list[int] = []
    for y in range(size):
        row_offset = y * (size + 1)
        for x in range(size):
            bits.append(1 if gray.getpixel((x, y)) > gray.getpixel((x + 1, y)) else 0)
    return tuple(bits)


def _hash_similarity(left: tuple[int, ...], right: tuple[int, ...]) -> float:
    if not left or len(left) != len(right):
        return 0.0
    matches = sum(1 for left_bit, right_bit in zip(left, right) if left_bit == right_bit)
    return matches / len(left)


def _laplacian_variance(image: Image.Image) -> float:
    gray = _normalized_rgb(image).convert("L")
    gray.thumbnail((512, 512), Image.Resampling.LANCZOS)
    width, height = gray.size
    if width < 3 or height < 3:
        return 0.0

    pixels = gray.load()
    values: list[int] = []
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            center = int(pixels[x, y])
            laplacian = (
                int(pixels[x - 1, y])
                + int(pixels[x + 1, y])
                + int(pixels[x, y - 1])
                + int(pixels[x, y + 1])
                - (4 * center)
            )
            values.append(laplacian)

    if not values:
        return 0.0
    mean = sum(values) / len(values)
    return sum((value - mean) ** 2 for value in values) / len(values)


@lru_cache(maxsize=1)
def _sha_reference_hashes() -> tuple[tuple[int, ...], tuple[int, ...]] | None:
    if not SHA_REFERENCE_PATH.exists():
        return None
    with Image.open(SHA_REFERENCE_PATH) as image:
        return _average_hash(image), _difference_hash(image)


def _sha_similarity(image: Image.Image) -> float:
    reference = _sha_reference_hashes()
    if reference is None:
        return 0.0
    average_similarity = _hash_similarity(_average_hash(image), reference[0])
    difference_similarity = _hash_similarity(_difference_hash(image), reference[1])
    return (average_similarity + difference_similarity) / 2


def _open_image_bytes(content: bytes) -> Image.Image:
    image = Image.open(BytesIO(content))
    image.load()
    return image


@lru_cache(maxsize=4096)
def check_image_url(url: str) -> ImageQualityResult:
    if not IMAGE_FILTER_ENABLED:
        return ImageQualityResult(usable=True, reason="disabled")

    cleaned_url = url.strip()
    if not cleaned_url:
        return ImageQualityResult(usable=False, reason="empty")

    try:
        with httpx.Client(
            timeout=IMAGE_FETCH_TIMEOUT_SECONDS,
            follow_redirects=True,
            headers={"User-Agent": "TripNai image quality filter/1.0"},
        ) as client:
            response = client.get(cleaned_url)
            response.raise_for_status()
            content = response.content
    except httpx.HTTPError:
        return ImageQualityResult(usable=not REJECT_UNCHECKED_IMAGES, reason="fetch-error")

    if len(content) > MAX_IMAGE_BYTES:
        return ImageQualityResult(usable=False, reason="too-large")

    try:
        image = _open_image_bytes(content)
    except (UnidentifiedImageError, OSError):
        return ImageQualityResult(usable=False, reason="invalid-image")

    width, height = image.size
    if min(width, height) < MIN_IMAGE_EDGE:
        return ImageQualityResult(usable=False, reason="too-small", width=width, height=height)

    similarity = _sha_similarity(image)
    if similarity >= SHA_MATCH_THRESHOLD:
        return ImageQualityResult(
            usable=False,
            reason="sha-placeholder",
            sha_similarity=round(similarity, 4),
            width=width,
            height=height,
        )

    sharpness = _laplacian_variance(image)
    if sharpness < MIN_SHARPNESS_SCORE:
        return ImageQualityResult(
            usable=False,
            reason="blurry",
            sha_similarity=round(similarity, 4),
            sharpness=round(sharpness, 2),
            width=width,
            height=height,
        )

    return ImageQualityResult(
        usable=True,
        reason="ok",
        sha_similarity=round(similarity, 4),
        sharpness=round(sharpness, 2),
        width=width,
        height=height,
    )


def usable_image_urls(urls: list[str]) -> list[str]:
    usable: list[str] = []
    seen: set[str] = set()
    for url in urls:
        cleaned_url = url.strip()
        if not cleaned_url or cleaned_url in seen:
            continue
        seen.add(cleaned_url)
        if check_image_url(cleaned_url).usable:
            usable.append(cleaned_url)
    return usable
