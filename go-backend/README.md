# LONQ Travel Discovery - Go Backend

Go backend for the LONQ travel discovery LIFF app, built with Gin, GORM, and SQLite.

## Prerequisites

- Go 1.21+
- GCC (required by go-sqlite3; on Windows install via [MSYS2](https://www.msys2.org/) or [TDM-GCC](https://jmeubank.github.io/tdm-gcc/))

## Setup

```bash
cd go-backend

# Download dependencies
go mod tidy

# Run the server
go run .
```

The server starts on `http://localhost:8000`. The database (`lonq.db`) is created automatically and seeded with sample places and rewards on first run.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/users | Create or get user |
| GET | /api/users/:lineUserId | Get user |
| GET | /api/users/:lineUserId/stats | Get user stats |
| GET | /api/places | List places (filters: city, cities, tag, page, per_page) |
| GET | /api/places/:id | Get single place |
| GET | /api/cities | List cities with place counts |
| GET | /api/users/:lineUserId/tinder-places | Get unswiped places |
| POST | /api/users/:lineUserId/swipes | Create swipe |
| GET | /api/users/:lineUserId/liked-places | Get liked places |
| DELETE | /api/users/:lineUserId/liked-places/:placeId | Remove liked place |
| DELETE | /api/users/:lineUserId/liked-places | Clear all liked places |
| GET | /api/users/:lineUserId/preferences | Get preferences |
| PUT | /api/users/:lineUserId/preferences | Update preferences |
| POST | /api/users/:lineUserId/journeys | Create journey |
| GET | /api/users/:lineUserId/journeys/current | Get current journey |
| POST | /api/users/:lineUserId/journeys/:journeyId/visit | Visit place in journey |
| GET | /api/rewards | List rewards |
| POST | /api/users/:lineUserId/rewards/redeem | Redeem reward |
| GET | /api/users/:lineUserId/rewards/redeemed | Get redeemed rewards |
