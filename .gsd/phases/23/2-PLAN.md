---
phase: 23
plan: 2
wave: 2
---

# Phase 23, Plan 2: Live Location vs Privacy Mode (Background/Foreground Tracker)

## Objective
Provide opt-in live location sharing, and a privacy mode that only shares manual check-ins.

<task>
1. **Toggle in Settings or Space Hub**
   - Add a switch for "Live Location Sharing" which enables background/foreground periodic tracking.
   - Defaults to OFF (Privacy Mode).

2. **Implement Periodic Tracker**
   - Use `expo-location` `watchPositionAsync` when the app is active to update Firestore with the user's coordinates every 2 minutes or 500 meters if "Live Sharing" is ON.
   - When OFF, only manual interactions like "Meet Me Here" will update their location in DB.

3. **Status Indicator**
   - On the Home screen or Chat, show partner's last known location age (e.g., "Active 5m ago" or "Near [City]").
   - If the user clicks the status, it opens the maps app to their coordinates.
</task>

<verify>
1. Check that Firestore is only updated automatically if the switch is ON.
2. Verify that the UI reflects the partner's status and last known location properly.
</verify>
