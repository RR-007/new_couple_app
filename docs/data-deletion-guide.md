# UsQuest Data Deletion Guide

> How users can delete their data, and what happens when they request account deletion.

---

## Overview

UsQuest stores data in three main places:

| Storage | What it contains |
|---------|------------------|
| **Firebase Firestore** | All user data (notes, diary, lists, recipes, etc.) |
| **Cloudinary** | Photos and videos uploaded by users |
| **Firebase Auth** | User accounts and authentication |

---

## Current Deletion Capabilities (In-App)

Users can delete the following directly within the app:

### ✅ Love Notes
- **Location:** Love Notes tab
- **Function:** `deleteNote(coupleId, noteId)`
- **UI:** Long press on note → Delete button
- **Data Removed:** Note document from Firestore

### ✅ Diary Entries
- **Location:** Diary tab
- **Function:** `deleteDiaryEntry(coupleId, entryId)`
- **UI:** Long press on entry → Delete button
- **Data Removed:** Entry document from Firestore (photos remain in Cloudinary)

### ✅ Custom Lists & List Items
- **Location:** Lists tab → Individual list
- **Functions:** 
  - `deleteList(coupleId, listId)` - Delete entire list
  - `deleteListItem(coupleId, listId, itemId)` - Delete single item
- **UI:** Swipe or long press → Delete
- **Data Removed:** List/item documents from Firestore

### ✅ Recipes
- **Location:** Recipes tab
- **Function:** `deleteRecipe(coupleId, recipeId)`
- **UI:** Long press on recipe → Delete (if implemented)
- **Data Removed:** Recipe document from Firestore

### ✅ Watchlist Items
- **Location:** Watchlist tab
- **Function:** `deleteWatchlistItem(coupleId, itemId)`
- **UI:** Swipe to delete (if implemented)
- **Data Removed:** Item document from Firestore

### ✅ Travel Pins
- **Location:** Travel Map tab
- **Function:** `deleteTravelPin(coupleId, pinId)`
- **UI:** Long press on pin → Delete (if implemented)
- **Data Removed:** Pin document from Firestore

### ✅ Events
- **Location:** Events tab
- **Function:** `deleteEvent(coupleId, eventId)`
- **UI:** Long press on event → Delete (if implemented)
- **Data Removed:** Event document from Firestore

### ✅ Bingo Boards
- **Location:** Bingo tab
- **Function:** Delete board (create new board to reset)
- **Data Removed:** Old board replaced with new one

### ✅ Quest Completions
- **Location:** Quests tab
- **Function:** Not directly deletable (only new completions added)
- **Data Removed:** When couple is deleted

---

## Account Deletion (Manual Process)

### What Happens When a User Requests Account Deletion

When a user emails `rohitrajeev02@gmail.com` requesting account deletion, the following data must be manually deleted:

| Data Type | Location | Action Required |
|-----------|----------|------------------|
| User Profile | `users/{uid}` | Delete document |
| Partner Link | `users/{uid}` | Remove `partnerUid` and `coupleId` fields |
| Couple Record | `couples/{coupleId}` | Delete entire document |
| All Diary Entries | `couples/{coupleId}/diary/*` | Delete collection |
| All Love Notes | `couples/{coupleId}/notes/*` | Delete collection |
| All Lists | `couples/{coupleId}/lists/*` | Delete collection (including items) |
| All Recipes | `couples/{coupleId}/recipes/*` | Delete collection |
| Watchlist | `couples/{coupleId}/watchlist/*` | Delete collection |
| Travel Pins | `couples/{coupleId}/travelPins/*` | Delete collection |
| Events | `couples/{coupleId}/events/*` | Delete collection |
| Bingo Boards | `couples/{coupleId}/bingo_boards/*` | Delete collection |
| Quest Completions | `couples/{coupleId}/quest_completions/*` | Delete collection |

**Note:** Photos/videos in Cloudinary are not automatically deleted (no delete API implemented). They will eventually be orphaned.

---

## Firebase Firestore Data Structure

```
firebase
├── users/{uid}
│   ├── uid
│   ├── email
│   ├── joinCode
│   ├── partnerUid
│   ├── coupleId
│   └── createdAt
│
couples/{coupleId}
│   ├── user1
│   ├── user2
│   └── createdAt
│
├── diary/{entryId}
│   ├── text
│   ├── photos[] (Cloudinary URLs)
│   ├── authorUid
│   └── createdAt
│
├── notes/{noteId}
│   ├── text
│   ├── authorUid
│   └── createdAt
│
├── lists/{listId}
│   ├── name
│   ├── icon
│   ├── color
│   ├── createdBy
│   └── createdAt
│   │
│   └── items/{itemId}
│       ├── text
│       ├── completed
│       ├── url
│       ├── addedBy
│       └── createdAt
│
├── recipes/{recipeId}
│   ├── title
│   ├── ingredients[]
│   ├── steps[]
│   ├── photo (Cloudinary URL)
│   ├── tags[]
│   ├── createdBy
│   └── createdAt
│
├── watchlist/{itemId}
│   ├── title
│   ├── type (movie/show)
│   ├── poster
│   ├── rating
│   ├── overview
│   ├── watched
│   ├── addedBy
│   ├── tags[]
│   └── createdAt
│
├── travelPins/{pinId}
│   ├── name
│   ├── latitude
│   ├── longitude
│   ├── visited
│   ├── photo (Cloudinary URL)
│   ├── note
│   ├── createdBy
│   └── createdAt
│
├── events/{eventId}
│   ├── title
│   ├── date
│   ├── icon
│   ├── createdBy
│   └── createdAt
│
├── bingo_boards/{boardId}
│   ├── id
│   ├── tiles[]
│   └── createdAt
│
└── quest_completions/{completionId}
    ├── quest_id
    ├── user_id
    ├── proof_url (Cloudinary URL)
    ├── proof_text
    └── completed_at
```

---

## Cloudinary Storage

Photos are stored in Cloudinary folders:

```
cloudinary://...
├── couple-app/{coupleId}/
│   ├── diary/
│   │   └── {timestamp}_{random}.jpg
│   ├── profile/
│   │   └── {uid}.jpg
│   └── quests/
│       └── {timestamp}_{random}.jpg
```

**Note:** There is currently NO function to delete images from Cloudinary programmatically. Images remain until manually deleted via Cloudinary dashboard or they become orphaned.

---

## Google Play Store Compliance

For the "Delete data URL" question in Google Play Console:

- **URL:** `https://rr-007.github.io/new_couple_app/delete-account.html`
- **Answer to "Do you provide a way for users to delete data without deleting their account?":** YES
  - Users can delete individual items in the app (notes, diary entries, list items, recipes, etc.)
- **Answer to "Add a link that users can use to request that their data be deleted":** YES
  - Link to the delete-account.html page

---

## Future Improvements (Optional)

To fully automate account deletion, you would need:

1. **Firebase Cloud Function** - Create an HTTPS callable that:
   - Deletes all Firestore collections for the couple
   - Uses Cloudinary Admin API to delete images
   - Deletes Firebase Auth user

2. **In-App Delete Photo** - Add ability to delete individual photos from diary entries (not just the whole entry)

3. **Self-Service Account Deletion** - Allow users to delete their account from Settings screen

---

*Last updated: Phase 16 Deployment*
