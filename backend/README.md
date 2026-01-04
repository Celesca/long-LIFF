# LONG Travel App - Backend API

FastAPI backend for the LONG Tinder-style travel app.

## Features

- 🔐 LINE Login integration (user management)
- 📍 Travel places with city filtering (Bangkok, Chiang Mai, etc.)
- 👆 Swipe functionality (like/dislike tracking)
- 🎯 User preferences (city selection, travel personality)
- 🗺️ Journey management with photo uploads
- 🪙 Coin reward system
- 🎁 Reward redemption

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Pydantic** - Data validation

## Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with initial data:
   ```bash
   python seed_data.py
   ```

5. Run the development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Users
- `POST /api/users` - Create or get user by LINE ID
- `GET /api/users/{line_user_id}` - Get user details
- `GET /api/users/{line_user_id}/stats` - Get user statistics

### Places
- `GET /api/places` - Get all places (with optional city/tag filters)
- `GET /api/places/{place_id}` - Get specific place
- `GET /api/cities` - Get available cities with place counts

### Tinder/Swipes
- `GET /api/users/{line_user_id}/tinder-places` - Get places for swiping
- `POST /api/users/{line_user_id}/swipes` - Record a swipe
- `GET /api/users/{line_user_id}/liked-places` - Get liked places
- `DELETE /api/users/{line_user_id}/liked-places/{place_id}` - Remove liked place
- `DELETE /api/users/{line_user_id}/liked-places` - Clear all liked places

### Preferences
- `GET /api/users/{line_user_id}/preferences` - Get user preferences
- `PUT /api/users/{line_user_id}/preferences` - Update preferences

### Journeys
- `POST /api/users/{line_user_id}/journeys` - Create new journey
- `GET /api/users/{line_user_id}/journeys/current` - Get current journey
- `POST /api/users/{line_user_id}/journeys/{journey_id}/visit` - Mark place visited

### Rewards
- `GET /api/rewards` - Get all available rewards
- `POST /api/users/{line_user_id}/rewards/redeem` - Redeem a reward
- `GET /api/users/{line_user_id}/rewards/redeemed` - Get redeemed rewards

## Database Schema

### Users
- id, line_user_id, display_name, picture_url, total_coins, created_at, updated_at

### Places
- id, external_id, name, description, latitude, longitude, image_url, country, city, rating, distance, tags

### Swipes
- id, user_id, place_id, direction (left/right), created_at

### UserPreferences
- id, user_id, selected_cities, travel_personality, preferred_tags

### Journeys
- id, user_id, personality, duration, place_ids, visited_place_ids, total_coins_earned, is_completed

### Rewards
- id, name, description, image_url, coin_cost, category, discount_code, valid_until, location

## Frontend Integration

Update your frontend `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

The frontend API service (`src/services/api.ts`) will automatically use this URL.

## Development

### Adding New Places

Edit `seed_data.py` to add more places to the database, then run:
```bash
python seed_data.py
```

### Database Reset

Delete `long_travel.db` and re-run the seed script to reset the database.

## License

MIT
