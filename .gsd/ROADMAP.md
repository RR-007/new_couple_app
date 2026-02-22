# ROADMAP.md

> **Current Phase**: 2
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [x] User authentication and couple linking.
- [ ] Real-time data syncing between two devices.
- [ ] Dynamic list creation and management.
- [ ] Detailed item views (e.g., Recipe viewer with photo support, Travel viewer with completed photos).

## Phases

### Phase 1: Foundation & Auth
**Status**: ✅ Complete
**Objective**: Set up React Native/Expo project, configure Firebase, and implement user authentication + couple linking.
**Requirements**: REQ-01, REQ-04
**Completed**: 2026-02-22
**Summary**:
- Expo + NativeWind configured (metro.config.js, babel.config.js, global.css)
- Firebase Auth (email/password) with inline error messages (web-compatible)
- Firestore user profiles with join codes
- Couple linking via transaction (prevents race conditions)
- Real-time link detection (onSnapshot listener on link screen)
- Routing: authenticated → link screen (if unlinked) → dashboard (if linked)
- Verified working on web + Android phones (Expo Go)

### Phase 2: Dynamic Lists Core
**Status**: 🔄 In Progress
**Objective**: Implement the ability to create, read, update, and delete custom categories/lists (Travel, Food, etc.) with real-time syncing.
**Requirements**: REQ-02, REQ-04

### Phase 3: Detailed Entries & Media
**Status**: ⬜ Not Started
**Objective**: Build out the detailed views for list items (e.g., recipe ingredients/steps) and integrate photo uploading/viewing (e.g., completed travels).
**Requirements**: REQ-03, REQ-04

### Phase 4: Polish & Beta Release
**Status**: ⬜ Not Started
**Objective**: Refine the UI/UX, fix edge cases, build the Android APK/AAB, and deploy to the two initial users' phones.
