# TripNai POI API

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
