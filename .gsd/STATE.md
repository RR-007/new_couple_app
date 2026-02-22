# STATE.md

> **Current Phase**: 2
> **Active Task**: Phase 2 implementation complete, pending user testing

## Context
Phase 1 (Foundation & Auth) is complete and verified. Phase 2 (Dynamic Lists Core) code has been implemented and committed. Awaiting user testing to validate real-time list syncing between coupled users.

## What's Built
- **AuthContext**: Enhanced with real-time `coupleId` and `profile` from Firestore `onSnapshot`
- **listService.ts**: Full CRUD for lists and items under `couples/{coupleId}/lists`
- **Lists Dashboard** (`(tabs)/index.tsx`): Shows all shared lists, create list modal
- **List Detail** (`list/[id].tsx`): Items with checkboxes, add/delete, real-time sync
- **Settings Tab** (`(tabs)/settings.tsx`): Account info, join code, sign out
- **CreateListModal**: Name, emoji icon picker, color picker

## Firestore Structure
```
users/{uid}           → profile, joinCode, partnerUid, coupleId
couples/{coupleId}    → user1, user2
  /lists/{listId}     → name, icon, color, createdBy
    /items/{itemId}   → text, completed, addedBy
```

## Recent Changes
- Committed Phase 2 code (feat: Dynamic Lists Core with real-time syncing)
- Enhanced AuthContext with coupleId (eliminates per-screen Firestore fetches)
- Replaced Expo starter pages with functional app screens

## Next Steps
- User tests list CRUD and real-time sync between two linked accounts
- Fix any bugs found during testing
- Update ROADMAP to mark Phase 2 complete after verification
- Begin Phase 3 planning (Detailed Entries & Media)
