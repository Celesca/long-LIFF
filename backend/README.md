# LONG POI API

FastAPI backend for reading real POIs from `data/places.json`, storing user workflow data in PostgreSQL, and generating routes with OpenRouter when configured.

## Run

```bash
docker compose up -d postgres

cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Copy `.env.example` to `.env` or export the same values in your shell. `OPENROUTER_API_KEY` is optional; without it the route endpoint uses the local fallback planner.

## Endpoints

- `GET /api/health`
- `GET /api/pois?limit=50&q=บางแสน`
- `GET /api/pois/nearby?lat=13.28491&lng=100.92471&radius_km=25&limit=12`
- `GET /api/poi-clusters`
- `POST /api/users`
- `POST /api/users/{line_user_id}/swipes`
- `GET /api/users/{line_user_id}/liked-places`
- `POST /api/users/{line_user_id}/discovery-sessions`
- `POST /api/users/{line_user_id}/routes/generate`

Set `PLACES_JSON_PATH=/path/to/places.json` to use a different source file.

## MinIO image cache

The Docker Compose stack includes a batch worker that reads `data/places.json`, validates remote images, converts accepted images to WebP, and stores them in MinIO. A persistent JSON manifest tracks each place as `cached`, `failed`, or `no_source`, including attempts, timestamps, and recent failure reasons. API requests use only cached images and do not fetch remote image hosts.

Start the complete stack in one command:

```bash
docker compose up -d
```

The first batch starts automatically and repeats every six hours. MinIO data and the manifest are kept in named Docker volumes, so container restarts do not download existing objects again.

- Cache status: `GET http://localhost:8000/api/image-cache/status`
- MinIO console: `http://localhost:9001`
- Run one batch manually: `docker compose exec image-cache-worker python cache_place_images.py`
- Follow worker activity: `docker compose logs -f image-cache-worker`

Set `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in the root `.env` before deploying. Useful tuning variables are `IMAGE_CACHE_INTERVAL_SECONDS`, `IMAGE_CACHE_RETRY_HOURS`, and `IMAGE_CACHE_MAX_PER_PLACE`.
