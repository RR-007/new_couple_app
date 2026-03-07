---
phase: 23
plan: 1
wave: 1
---

# Phase 23, Plan 1 Summary: Location Setup & Meet Me Here

## Completed Tasks
1. Installed `expo-location` and `react-native-maps`.
2. Updated `app.json` with iOS/Android location permission rationale strings.
3. Created `locationService.ts` to manage coordinates array/documents in Firestore and provide Haversine distance calculator.
4. Updated `LoveNote` interface in `noteService.ts` to support optional location parameters.
5. In `notes.tsx` (Chat), added a "📍" button to fetch foreground location.
6. When triggered, it creates a custom message with an embedded, non-scrollable `MapView` focused on the marker.
7. Tapping the marker or the "Get Directions" button opens the native OS routing maps app directly to that specific point.
