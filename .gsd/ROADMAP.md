# ROADMAP.md

> **Current Phase**: 16
> **Milestone**: v1.0

## Phases

### Phase 1: Foundation & Auth ✅
**Completed**: 2026-02-22

### Phase 2: Dynamic Lists Core ✅
**Completed**: 2026-02-22

### Phase 3: Rich Items & Daily Engagement ✅
**Completed**: 2026-02-22
Purchase links, diary with photos (Cloudinary), countdown timers.

### Phase 4: Engagement & Fun ✅
**Completed**: 2026-02-22
Love Notes, Mood Check-In, Date Night Roulette.

### Phase 5: Google Calendar Integration ✅
**Completed**: 2026-02-22
Google OAuth, merged calendar view, create events, travel alerts.

### Phase 6: Advanced Content & Polish ✅
**Completed**: 2026-02-25
**Objective**: Rich content types and beta release.
- 🍳 Recipe viewer (structured ingredients/steps)
- 🎬 Shared watchlist with metadata
- 🗺️ Travel map with pins
- 📱 Android APK build and beta distribution

---

## Future Phases (Backlog)

### Phase 7: Dark Mode & UI Theming ✅
**Completed**: 2026-02-25
**Objective**: Immediate priority. Apply a comprehensive, beautiful Dark Mode theme across the entire app.
- Custom color themes
- Profile pictures / avatars
- Onboarding flow for new users
- App icon and splash screen branding

### Phase 8: Advanced Filters, Tags & Album ✅
**Completed**: 2026-02-25
- Add custom tags to Recipe Viewer and Shared Watchlist
- Filter and sort capabilities
- "Pic of the Day" daily shared photo block/album replacing basic mood tracker (Evaluating Google Photos integration)

### Phase 9: Native Travel Map (v2)
- Re-architect Travel Map using `react-native-maps` for mobile compatibility
- Map pins show country flags of places visited instead of generic markers
- **[ON HOLD]** Google Maps API billing activation issue. Need to revisit this later (either activate billing or investigate switching to Mapbox).

### Phase 10: Push Notifications & Reminders ✅
**Completed**: 2026-02-25
- Notify when partner adds a note, event, or list item
- Reminders for events/anniversaries

### Phase 11 & 14: Side Quests & Production Backend ✅
**Completed**: 2026-02-26
**Objective**: Introduce unpredictable tasks and stand up a backend to automatically assign them via cron jobs.
- Setup backend service (Cloud Functions or FastAPI) for scheduled cron jobs (Daily/Weekly quest rolls).
- Random "Goblin Cam" requests and other jump scares.
- Weekly shared goals or silly challenges.
- Push Notifications triggered by the backend when quests drop.

### Phase 12: Cryptid Filter, Merchant Pitch, Trial by Combat ✅
**Completed**: 2026-02-26
- "Cryptid Filter" camera mode for intentionally blurry photos
- "Merchant Pitch" mode (short video recording to pitch a ridiculous purchase)
- "Trial by Combat" (split-screen texting under pressure/timer)

### Phase 13: Cursed Cart Colossus & Flashbang Bingo ✅
**Completed**: 2026-02-26
- Cursed Cart tracking (48 hours to buy the most unhinged item under $15)
- Flashbang Bingo (Shared 5x5 board of inside jokes and photo objectives)

### Phase 14: UI/UX Polish ✅
**Completed**: 2026-02-26
- Comprehensive UI/UX review of all active features
- Adding animations, standardizing layouts, fixing visual bugs

### Phase 15: Restructure & Gallery Evolution ✅
**Completed**: 2026-02-27
- [x] Drawer re-ordering: Home -> Date Night -> Travel Map -> Lists -> Calendar -> Events -> Love Notes -> Diary -> Quests -> Bingo -> Album -> Settings.
- [x] Home tab restructure: Mood Tracker -> Closest Event -> Pic of the Day -> Active Quest.
- [x] Albums & Photos: Add Google-photos style date headers grouping to the global album.
- [x] Pic of the Day Feed: Tapping the daily pic should open a historical scrolling feed of all past pics, similar to the Album view.
- [x] Bingo Improvements: Enforce strictly square UI (4x4 or 5x5) and actual win/bingo condition logic. Switched custom camera to OS native camera for full zoom/lenses control.
- [x] Detach Date Night Roulette from the Home page into its own tab.
- [x] Bug Fix: Fix Watchlist missing back navigation button.

### Phase 16: Deployment & Distribution
**Status**: 🔄 In Progress
- [ ] Apple Developer Account setup + TestFlight config
- [x] Build Safety Script with dual manual gates (Android + iOS separate)
- [x] GitHub Actions CI/CD with `workflow_dispatch` manual triggers
- [x] Google Play Developer Account setup
- [x] Privacy Policy draft & hosting
- [ ] Google Play Store listing (Internal/Closed testing track)
- [x] EAS iOS build setup + TestFlight distribution

---

## Version 2 (V2) Roadmap

### Phase 17: Multi-Profile & Group Mode (V2 Foundation)
- Allow users to create or join multiple "Spaces" (e.g., Partner, Best Friends, Squad).
- Dynamic tab renaming based on the active space ("Love Notes" -> "Notes" or "Messages").
- Ensure all queries are scoped by the currently active `spaceId`.

### Phase 18: Quick Text & V2 Home Screen
- Remove Mood Tracker from the Home tab.
- Add a Quick Text input where Mood Tracker used to be to send directly to the Notes tab.
- Add a mini-feed below the input showing the most recent message from both partners (Partner mode) or the last two messages (Group mode).
- Tapping the feed routes to the full Notes page.

### Phase 19: Google Sign-in & Auto-Calendar
- Implement Google Sign-In at the initial login/signup page.
- Request Calendar scopes during Google Sign-up.
- Auto-link the Google Calendar immediately upon sign up.

### Phase 20: Streak System & Gamification
- Daily streak counter for app engagement, Pic of the Day, Love Notes.
- Achievement badges for milestones (100 Love Notes, 10 Bingo Wins, etc.).
- Trophy case display in profile.
- Weekly recap push notification with fun stats summary.

### Phase 21: Shared Spotify / Music Integration
- Link Spotify accounts, display "Currently Listening" on Home screen.
- Shared "Our Songs" playlist curation.
- "Song of the Day" daily pick (like Pic of the Day for music).
- Listening history overlap — discover shared favorites.

### Phase 22: Location Sharing & Proximity Features
- Opt-in live location sharing (built-in).
- "Near You" proximity alerts.
- "Meet Me Here" pin drop for quick meeting points.
- Privacy mode: share only last check-in, not live.

### Phase 23: Gift Tracker & Wishlist V2
- Enhanced wishlist with price tracking, priority ranking, hidden "claimed" status.
- Gift history log with dates and photos.
- Gift budget tracker per occasion.
- "Gift Idea Generator" based on partner's interests/lists.

### Phase 24: Couple Quizzes & Compatibility Games
- "How Well Do You Know Me?" custom quizzes.
- Daily "Would You Rather" prompts with reveal after both answer.
- "This or That" swipe game with fun categories.
- Score tracking over time.

### Phase 25: Relationship Dashboard & Analytics
- Visual stats: days together, photos shared, notes exchanged, quests completed.
- Weekly/monthly activity heatmap.
- "Memory Lane" auto-generated slideshows on anniversaries.
- Exportable "Year in Review" report.

### Phase 26: Shared Routines & Habits
- Create shared daily/weekly routines (e.g., "Call at 9pm", "Weekly movie night").
- Check-off tracking for both partners.
- Gentle nudge notifications for missed routines.
- Streaks per routine.

### Phase 27: Customizable Themes & Personalization
- Custom color theme picker (beyond dark/light).
- Custom app icon options.
- Couple nickname in header.
- Custom notification sounds (partner-specific tones).
