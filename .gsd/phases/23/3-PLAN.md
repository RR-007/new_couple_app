---
phase: 23
plan: 3
wave: 3
---

# Phase 23, Plan 3: Proximity Alerts (Near You)

## Objective
Trigger an alert or visual indicator when the partner is within a certain radius.

<task>
1. **Haversine Formula Implementation**
   - Create a helper function in `locationService.ts` to calculate distance between two `{lat, lng}` points in meters/miles.

2. **Proximity Check on Home Load**
   - When the Home Screen loads (or when location updates in foreground), fetch the active space partner's latest location.
   - If distance < 500 meters, show a "Near You!" badge or local notification.

3. **Polish**
   - Add animations or a specific icon highlighting proximity.
</task>

<verify>
1. Test manually by setting coordinates close to each other in Firestore and ensuring the "Near You" badge appears.
2. Test by setting coordinates far away and ensuring it disappears.
</verify>
