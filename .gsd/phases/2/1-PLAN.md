# Phase 2 Plan — Dynamic Lists Core

> **Status**: `EXECUTING`
> **Phase**: 2
> **Goal**: Couples can create, view, edit, and delete shared lists with items, all syncing in real-time.

## Objective
Enable coupled users to create dynamic shared lists (Travel, Food, Games, etc.) and manage items within them. Both partners see changes instantly via Firestore real-time listeners.

## Context
- Phase 1 established: Firebase Auth, user profiles, couple linking, Expo + NativeWind
- `coupleId` is set on both user profiles when linking completes
- All shared data lives under `couples/{coupleId}/` in Firestore

## Firestore Data Model
```
couples/{coupleId}/lists/{listId}
  name: string         ("Travel Bucket List")
  icon: string         ("✈️")
  color: string        ("#4F46E5")
  createdBy: string    (userId)
  createdAt: timestamp

couples/{coupleId}/lists/{listId}/items/{itemId}
  text: string         ("Visit Japan")
  completed: boolean
  addedBy: string      (userId)
  createdAt: timestamp
```

## Tasks

### Wave 1: Service Layer
- [x] **Task 1.1**: Create `src/services/listService.ts`
  - `createList`, `subscribeToLists`, `updateList`, `deleteList`
  - `addListItem`, `subscribeToListItems`, `toggleListItem`, `deleteListItem`
  - All subscriptions use `onSnapshot` for real-time sync

- [x] **Task 1.2**: Enhance `src/context/AuthContext.tsx`
  - Add `profile` and `coupleId` to context (real-time `onSnapshot` listener)
  - Eliminates per-screen Firestore fetches

### Wave 2: UI Screens
- [x] **Task 2.1**: Create `src/components/CreateListModal.tsx`
  - Bottom-sheet modal with name input, icon picker (12 emojis), color picker (8 colors)

- [x] **Task 2.2**: Build `app/(app)/(tabs)/index.tsx` — Lists Dashboard
  - Empty state with CTA, list cards, floating "+" button
  - Real-time subscription via `subscribeToLists`

- [x] **Task 2.3**: Build `app/(app)/list/[id].tsx` — List Detail
  - Items with checkboxes, add input bar, delete items, delete list
  - Real-time subscription via `subscribeToListItems`

- [x] **Task 2.4**: Build `app/(app)/(tabs)/settings.tsx` — Settings
  - Account email, join code display, partner status, sign out

### Wave 3: Wiring & Cleanup
- [x] **Task 3.1**: Update `app/(app)/(tabs)/_layout.tsx` — Tab navigation (Lists + Settings)
- [x] **Task 3.2**: Update `app/(app)/_layout.tsx` — Add `list/[id]` route
- [x] **Task 3.3**: Remove old `explore.tsx` tab

## Verification
- [ ] Create a list → appears on partner's dashboard in real-time
- [ ] Add items → appear on partner's screen instantly
- [ ] Toggle item checkbox → syncs to partner
- [ ] Delete item → disappears from partner's screen
- [ ] Delete list → removed from both dashboards
- [ ] Firestore Console shows documents under `couples/{coupleId}/lists`

## Success Criteria
- Both coupled users see the same lists and items
- Changes propagate in real-time (< 2 seconds)
- CRUD operations are reliable and error-free
