# STATE.md

> **Current Phase**: 5
> **Active Task**: Phase 5 complete, pending Google Cloud setup by user

## What Was Built (Phase 5)

### 📅 Google Calendar OAuth
- `googleAuthService.ts` — OAuth implicit flow with expo-auth-session
- Tokens stored in Firestore under `couples/{coupleId}/googleTokens/{uid}`
- Connect/Disconnect in Settings tab

### 📅 Calendar Service
- `calendarService.ts` — Fetch events from Google Calendar API
- Merge both partners' events, group by date, detect travel keywords

### 📅 Calendar Tab
- Color-coded events: 🔵 You, 💜 Partner
- Travel alerts with ✈️ icon
- Date grouping (Today/Tomorrow/date)
- Refresh button, connect prompt if not linked

## Tab Navigation
🏠 Home → 💌 Notes → 📅 Calendar → 📓 Diary → ⏳ Events → ⚙️ Settings

## Pending
- User needs to create Google Cloud project + OAuth Client ID
- Add Client ID to `.env` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
