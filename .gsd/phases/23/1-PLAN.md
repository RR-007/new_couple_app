---
phase: 23
plan: 1
wave: 1
---

# Phase 23, Plan 1: Location Setup & Meet Me Here

## Objective
Set up the `expo-location` library, configure permissions, and implement the "Meet Me Here" pin drop feature for quick meeting points.

<task>
1. **Install Dependencies**
   - Ensure `expo-location` is installed.
   - Run `npx expo install expo-location`.

2. **Create `locationService.ts`**
   - Setup basic Firestore hooks to write/read location coords (`couples/{coupleId}/locations/{userId}`).
   - Function for manual Check-In: `updateLocation(userId, coupleId, { lat, lng, timestamp, isLive })`.

3. **Implement "Meet Me Here" Action**
   - In the `Chat` (formerly Love Notes) or main screen, add an action to "Send Current Location / Meet Me Here".
   - This sends a special message type to the Chat feed or creates an Event with the coordinates.

4. **Add Simple Map Display**
   - When a "Meet Me Here" pin is sent, display it as a message bubble containing an embedded `MapView` (from `react-native-maps`) showing the dropped pin, taking advantage of the active Google Maps API key.
   - Or alternatively, if complex, a static map image preview that opens the in-app interactive map when tapped.
</task>

<verify>
1. Ask the user to accept location permissions when triggering the feature.
2. Ensure tapping the "Meet Me Here" button successfully logs the coordinates to Firestore.
3. Validate that the maps app opens correctly with the provided coordinates.
</verify>
