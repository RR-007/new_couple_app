# Phase 5 Plan — Google Calendar Integration

> **Status**: `PLANNED`
> **Phase**: 5
> **Goal**: Both partners connect their Google Calendars. The app shows a merged view of both schedules with travel/booking alerts.

---

## Architecture Decision: Client-Side OAuth with PKCE

For dev/testing, we'll use **client-side OAuth** with `expo-auth-session` and PKCE (Proof Key for Code Exchange). This avoids needing a backend for now.

**How it works:**
1. User taps "Connect Google Calendar" in Settings
2. `expo-auth-session` opens Google's consent screen in a browser
3. User grants `calendar.readonly` permission
4. We get an access token (valid ~1 hour) — enough for dev/testing
5. We fetch events from Google Calendar API directly

**Trade-offs:**
| Aspect | Client-Side (now) | Backend (future) |
|--------|-------------------|-------------------|
| Complexity | Low | High |
| Refresh tokens | ❌ No (re-auth hourly) | ✅ Yes |
| Security | OK for dev | Production-grade |
| Backend needed | No | Yes (FastAPI) |

> For production, we'd add FastAPI to handle refresh tokens. For now, client-side is perfect.

---

## Google Cloud Setup (User Must Do)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or reuse existing)
3. Enable **Google Calendar API** (APIs & Services → Library)
4. Configure **OAuth Consent Screen** (External, add test emails)
5. Create **OAuth 2.0 Client ID** (Web application type)
   - Authorized redirect URI: `https://auth.expo.io/@your-username/new_couple_app`
6. Copy the **Client ID** — provide it to the assistant

---

## Wave 1: Google OAuth Flow

### New Files
- `src/services/googleAuthService.ts` — OAuth flow with expo-auth-session

### Modified Files
- `src/context/AuthContext.tsx` — Store Google access token
- `app/(app)/(tabs)/settings.tsx` — "Connect Google Calendar" button

### Dependencies
```
npx expo install expo-auth-session expo-web-browser expo-crypto
```

### Firestore Schema
```
couples/{coupleId}/googleTokens/{uid}
  accessToken: string
  expiresAt: timestamp
  email: string       (Google account email)
  connected: boolean
```

---

## Wave 2: Calendar Service

### New Files
- `src/services/calendarService.ts`

### Functions
- `fetchMyEvents(accessToken, timeMin, timeMax)` → Google Calendar API
- `subscribeToPartnerEvents(coupleId)` → Firestore listener
- `mergeAndSortEvents(myEvents, partnerEvents)` → Combined timeline

### Google Calendar API Endpoint
```
GET https://www.googleapis.com/calendar/v3/calendars/primary/events
  ?timeMin=...&timeMax=...&singleEvents=true&orderBy=startTime
Headers: Authorization: Bearer {accessToken}
```

---

## Wave 3: Calendar UI

### New Files
- `app/(app)/(tabs)/calendar.tsx`

### Features
- Scrollable date list showing events from both partners
- Color-coded: 🔵 You, 💜 Partner, 🟢 Shared
- Event cards showing title, time, location
- Travel events highlighted with ✈️ icon
- "Connect Calendar" prompt if not connected

### Tab Update
🏠 Home → 💌 Notes → 📅 Calendar → 📓 Diary → ⚙️ Settings

(Replace Events tab since Calendar subsumes it)

---

## Verification
- [ ] Connect Google account → consent screen works
- [ ] Fetch calendar events → displays correctly
- [ ] Partner connects → both calendars merge
- [ ] Travel bookings appear with flight icon
- [ ] Token expiry handled gracefully (re-auth prompt)
