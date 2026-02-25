# Phase 6 — Advanced Content & Polish

> **Goal**: Add rich content features (recipes, watchlist, travel map) and build Android APK.

## Architecture

All features use Firestore under `couples/{coupleId}/` with real-time subscriptions.
- **Recipes**: Sub-collection of list items with structured ingredients + steps
- **Watchlist**: New Firestore collection with TMDB API for movie metadata
- **Travel Map**: `react-native-maps` (or Leaflet for web) with pinned locations
- **APK Build**: EAS Build for Android distribution

---

## Wave 1: Recipe Viewer

**Objective**: When a user taps a food/recipe list item, show a detailed recipe view with ingredients checklist and step-by-step instructions.

### Files:
- **[NEW]** `src/services/recipeService.ts` — CRUD for recipes (ingredients[], steps[], photo)
- **[NEW]** `app/(app)/recipe/[id].tsx` — Recipe detail screen with ingredients toggle + steps
- **[MODIFY]** `app/(app)/_layout.tsx` — Add recipe route to Stack

### Data Model (Firestore):
```
couples/{coupleId}/recipes/{recipeId}
  - title: string
  - ingredients: [{ name: string, checked: boolean }]
  - steps: [{ order: number, text: string }]
  - photo?: string (URL)
  - sourceItemId?: string (links to list item)
  - createdBy: string
  - createdAt: timestamp
```

---

## Wave 2: Shared Watchlist

**Objective**: A dedicated watchlist for movies/shows. Optionally fetch poster + rating from TMDB API.

### Files:
- **[NEW]** `src/services/watchlistService.ts` — CRUD + real-time subscription
- **[NEW]** `app/(app)/(tabs)/watchlist.tsx` — Watchlist tab with poster cards
- **[MODIFY]** `app/(app)/(tabs)/_layout.tsx` — Add Watchlist tab

### Data Model:
```
couples/{coupleId}/watchlist/{id}
  - title: string
  - type: "movie" | "show"
  - poster?: string (TMDB image URL)
  - rating?: number
  - watched: boolean
  - addedBy: string
  - createdAt: timestamp
```

### TMDB Integration (optional, free API):
- Search endpoint: `https://api.themoviedb.org/3/search/movie?query=...`
- Auto-fill poster and rating when adding a title

---

## Wave 3: Travel Map

**Objective**: Interactive map showing pinned places — want to visit (📍) vs visited (✅).

### Files:
- **[NEW]** `src/services/travelPinService.ts` — CRUD for map pins
- **[NEW]** `app/(app)/(tabs)/travelmap.tsx` — Map view with pins
- **[MODIFY]** `app/(app)/(tabs)/_layout.tsx` — Add Travel Map tab

### Data Model:
```
couples/{coupleId}/travelPins/{id}
  - name: string
  - latitude: number
  - longitude: number
  - visited: boolean
  - photo?: string
  - note?: string
  - createdBy: string
  - createdAt: timestamp
```

### Map Library:
- **Web**: `react-leaflet` (free, no API key needed)
- **Native**: `react-native-maps` (Google Maps)
- Use Platform.select to render the right one

---

## Wave 4: Android APK Build

**Objective**: Build a distributable APK for both partners' phones.

### Steps:
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure `eas.json` with preview profile
3. Update `app.json` with proper name, slug, package
4. Run `eas build --platform android --profile preview`
5. Download and install APK on both phones

---

## Verification
- Recipe: Create recipe with 3 ingredients + 2 steps, toggle ingredients, verify real-time
- Watchlist: Add a movie, verify poster fetched, mark watched, verify sync
- Travel Map: Drop a pin, verify partner sees it, toggle visited status
- APK: Install on Android device, verify all features work
