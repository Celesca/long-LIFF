# LONG - LINE LIFF Travel App

(Planned to open-sourced this summer)

A travel discovery app built with React, TypeScript, and LINE LIFF that lets users swipe through destinations, save favorites, and plan personalized trips.

## Features

### 🔐 LINE LIFF Authentication
- Automatic user login via LINE LIFF
- User profile tracking (userId, displayName, profile picture)
- User-specific data storage

### 🗺️ Travel Discovery
- **Launch Page**: Welcome screen with user profile display
- **Tinder-style Swipe**: Browse and like travel destinations
- **Gallery**: View and manage saved places
- **Routing**: Plan trips with personality modes and earn coins

### 💾 User-Specific Data
The active POI workflow stores user data in PostgreSQL keyed by LINE userId:
- Liked places
- Swipes and dismissals
- Discovery pins and POI cluster selections
- Generated route plans

Some legacy companion/coin UI state still uses user-scoped localStorage:
- User profile (coins, journeys)
- Journey progress
- Visited places and photos

## LIFF Integration Details

### Authentication Flow
1. App initializes LIFF SDK on mount
2. Checks if user is logged in (`liff.isLoggedIn()`)
3. If not logged in, redirects to LINE login
4. After login, fetches user profile data
5. Stores userId in localStorage for data scoping

### User Context
The app provides a `LiffContext` with:
- `isLoggedIn`: Boolean - user authentication status
- `userId`: String - LINE user ID
- `displayName`: String - user's display name
- `pictureUrl`: String - user's profile picture URL
- `isLiffReady`: Boolean - LIFF initialization status

### Using LIFF Data in Components

```typescript
import { useLiff } from '../hooks/useLiff';

const MyComponent = () => {
  const { isLoggedIn, userId, displayName, pictureUrl } = useLiff();
  
  // Component logic...
};
```

### User-Specific Storage

The app uses helper functions to scope localStorage by userId:

```typescript
import { getUserStorageKey } from '../hooks/useLiff';

// Get user-specific key for small UI-only state
const storageKey = getUserStorageKey('poiDiscoveryLocation');
// Returns: "{userId}_poiDiscoveryLocation"

// Store data
localStorage.setItem(storageKey, JSON.stringify(data));

// Retrieve data
const saved = localStorage.getItem(storageKey);
```

## Configuration

### Environment Variables

Create a `.env` file when you need to override local defaults:

```
VITE_API_URL=http://localhost:8000
VITE_LIFF_ID=
```

Local Vite development works without `VITE_LIFF_ID`; the app uses a mock LIFF user for easier testing. Set `VITE_LIFF_ID` when you want to test real LINE login, and get the ID from the [LINE Developers Console](https://developers.line.biz/console/).

The active POI discovery, gallery, and route generation workflow calls the FastAPI backend configured by `VITE_API_URL`.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Real POI Backend

The app fetches nearby real POIs from `data/places.json` and stores user workflow data in PostgreSQL through FastAPI.

```bash
# Start PostgreSQL
docker compose up -d postgres

# Start FastAPI
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Optional route AI uses OpenRouter. Add this to `backend/.env` or your shell before running FastAPI:

```
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Without an OpenRouter key, route generation falls back to deterministic nearby POI selection.

## Project Structure

```
src/
├── App.tsx                 # Main app with LIFF initialization
├── hooks/
│   └── useLiff.ts         # LIFF context hook and utilities
├── components/
│   ├── LaunchPage.tsx     # Welcome screen with user profile
│   ├── TinderPage.tsx     # Swipe interface
│   ├── GalleryPage.tsx    # Saved places
│   └── RoutingPage.tsx    # Trip planning
├── utils/
│   └── coinSystem.ts      # User-specific coin/journey logic
├── types/
│   └── TravelPlace.ts     # TypeScript interfaces
└── data/
    └── travelPlaces.ts    # Mock travel data
```

## Data Storage

### PostgreSQL Tables
- `users` - LINE/mock dev users
- `places` - POI snapshots collected from swipes and routes
- `user_places` - liked, dismissed, and removed place state
- `swipes` - swipe history
- `discovery_sessions` - selected cluster or pinned lat/lng search sessions
- `route_plans` - generated route payloads

### Browser Storage Keys
- `liff_userId` - Current user's LINE ID
- `liff_displayName` - Current user's display name
- `liff_pictureUrl` - Current user's profile picture URL
- `{userId}_poiDiscoveryLocation` - local UI fallback for the last selected discovery pin
- `{userId}_userProfile` - legacy coins and journey data

## Deployment

1. Build the app: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure your LIFF app endpoint URL in LINE Developers Console
4. Test in LINE app

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **LINE LIFF SDK** - LINE integration
- **React Router** - Navigation
- **React Leaflet** - Maps
- **React Spring** - Animations

## License

MIT
