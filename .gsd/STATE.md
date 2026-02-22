# STATE.md

> **Current Phase**: 3
> **Active Task**: Phase 3 implementation complete, pending user testing

## Context
All three Phase 3 waves have been implemented and committed. Awaiting user verification.

## What Was Built (Phase 3)

### Wave 1: Purchase Links
- Optional `url` field on list items
- 🔗 Link button on items with URLs → opens in browser via `Linking.openURL`
- Toggle-able URL input when adding items

### Wave 2: Countdowns & Important Dates
- `eventService.ts` — CRUD with real-time `onSnapshot`
- Events tab with color-coded countdown labels (green/amber/blue/gray)
- Dashboard countdown widget showing nearest upcoming event
- `CreateEventModal` with title, date, icon picker

### Wave 3: Diary Entries
- Firebase Storage setup for photo uploads
- `diaryService.ts` — CRUD + photo upload + real-time subscription
- Diary tab with compose area (text + up to 4 photos)
- Timeline feed showing entries with author (You/Partner) and photos
- Installed `expo-image-picker` for camera/gallery access

## Tab Navigation
📋 Lists → 📓 Diary → ⏳ Events → ⚙️ Settings

## Next Steps
- User tests all three features
- Set up Firebase Storage rules (currently open)
- Mark Phase 3 complete after verification
- Plan Phase 4 (Engagement & Fun)
