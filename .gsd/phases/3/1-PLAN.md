# Phase 3 Plan — Rich Items & Daily Engagement

> **Status**: `PLANNED`
> **Phase**: 3
> **Goal**: Enhance list items with purchase links, add diary entries with photos, and build countdown timers for important dates.

## Rationale: Why These 3 Features?

| Feature | Why Phase 3? |
|---------|-------------|
| 🛒 **Purchase Links** | Quick win — enhances existing lists with minimal new infrastructure |
| 📓 **Diary Entries** | High engagement — gives couples a reason to open the app daily |
| ⏳ **Countdowns** | Passive engagement — homepage widget keeps the app top of mind |

Together they transform the app from "a list tool" into "our shared space."

---

## Feature 1: Purchase Links on List Items

### What
Add an optional URL field to list items. When a URL is present, tapping the item opens the link in the browser/app.

### Firestore Changes
```
couples/{coupleId}/lists/{listId}/items/{itemId}
  + url: string (optional)
```

### Implementation
1. **listService.ts** — Update `addListItem` to accept optional `url` parameter
2. **list/[id].tsx** — Add URL input when adding items, show link icon on items with URLs
3. **Tap behavior** — Tapping the link icon opens the URL via `Linking.openURL()`

### Complexity: Low (extends existing code)

---

## Feature 2: Diary / Journal Entries

### What
A new shared diary — both partners can write entries with text and photos, displayed in a scrollable timeline.

### Firestore Structure
```
couples/{coupleId}/diary/{entryId}
  text: string
  photos: string[]     (Firebase Storage URLs)
  authorUid: string
  createdAt: timestamp
```

### Implementation
1. **diaryService.ts** — CRUD with `onSnapshot` for real-time sync
2. **Firebase Storage setup** — For photo uploads (new dependency)
3. **(tabs)/diary.tsx** — New tab showing timeline of entries
4. **CreateDiaryEntry modal/screen** — Text input + photo picker
5. **Photo picker** — Use `expo-image-picker` for camera/gallery access

### Complexity: Medium (new service, storage, image handling)

---

## Feature 3: Countdowns & Important Dates

### What
Track important dates (anniversary, trips, birthdays) with visual countdowns on the home screen.

### Firestore Structure
```
couples/{coupleId}/events/{eventId}
  title: string        ("Our Anniversary")
  date: timestamp
  icon: string         ("💍")
  createdBy: string
```

### Implementation
1. **eventService.ts** — CRUD + real-time subscription
2. **(tabs)/index.tsx** — Countdown widget at top of lists dashboard ("💍 14 days until Our Anniversary")
3. **Events management screen** — Add/edit/delete important dates
4. **Date math** — Calculate days remaining, handle past dates

### Complexity: Low-Medium (simple data, some date logic)

---

## Dependencies & New Packages
- `expo-image-picker` — Camera/gallery access for diary photos
- `expo-linking` — Opening external URLs (purchase links)
- Firebase Storage — Photo uploads (requires Firebase Storage rules setup)

---

## Order of Execution

### Wave 1: Purchase Links (builds on existing lists)
- Update Firestore item model
- Update list detail UI
- Add URL opening behavior

### Wave 2: Countdowns (standalone, low complexity)
- Create event service
- Build events management screen
- Add countdown widget to home

### Wave 3: Diary Entries (most complex, needs storage)
- Set up Firebase Storage
- Create diary service
- Build diary tab and entry creation
- Implement photo picker and upload

---

## Verification
- [ ] Add a list item with a purchase URL → tap opens the link
- [ ] Create a countdown event → widget shows on home screen
- [ ] Add a diary entry with photo → partner sees it in real-time
- [ ] Photos load correctly from Firebase Storage
- [ ] All features sync between both partners' devices
