---
phase: 23
plan: 2
wave: 2
---

# Phase 23, Wave 2 Summary: Live Location vs Privacy Mode

## Completed Work
1. **Settings Toggle:** 
   - Added `liveLocationEnabled` to `UserProfile` in `coupleService.ts`.
   - Added a live location `Switch` component in `settings.tsx` to toggle "Live Location Sharing".
   - Set it to persist securely in Firestore.

2. **Foreground Tracker implementation:**
   - Refactored `locationService.ts` and added `startLiveLocationTracking()`.
   - Utilizes `Location.watchPositionAsync` when the application is open.
   - Tied into global `app/(app)/(drawer)/_layout.tsx` where a `useEffect` spins up the watcher automatically when the app is alive and the toggle is ON.

3. **Status Indicator & Maps Link:**
   - Added a new component `<PartnerLocationWidget />` in `index.tsx` matching the app style.
   - Surfaces the partner's status ("Live Sharing Active" or "Last Check-in [time]").
   - Features quick-actions to open their real-time coordinates seamlessly via Google or Apple Maps.

## Next Steps
Proceeding to Wave 3 (Proximity Alerts).
