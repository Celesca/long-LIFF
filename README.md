# LONG - LINE LIFF Travel App

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
All user data is stored separately based on LINE userId:
- Liked places
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

// Get user-specific key
const storageKey = getUserStorageKey('likedPlaces');
// Returns: "{userId}_likedPlaces"

// Store data
localStorage.setItem(storageKey, JSON.stringify(data));

// Retrieve data
const saved = localStorage.getItem(storageKey);
```

## Configuration

### Environment Variables

Create a `.env` file with your LIFF app ID:

```
VITE_LIFF_ID=your-liff-id-here
```

Get your LIFF ID from the [LINE Developers Console](https://developers.line.biz/console/).

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

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

### Per-User Storage Keys
- `{userId}_likedPlaces` - User's liked destinations
- `{userId}_userProfile` - Coins and journey data

### Global Storage Keys
- `liff_userId` - Current user's LINE ID
- `liff_displayName` - Current user's display name
- `liff_pictureUrl` - Current user's profile picture URL

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
