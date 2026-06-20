# LONG POI API

Small FastAPI backend for reading real POIs from `data/places.json`.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /api/health`
- `GET /api/pois?limit=50&q=บางแสน`
- `GET /api/pois/nearby?lat=13.28491&lng=100.92471&radius_km=25&limit=12`

Set `PLACES_JSON_PATH=/path/to/places.json` to use a different source file.
