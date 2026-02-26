# ROADMAP.md

> **Current Phase**: 11
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

### Phase 14: UI/UX Polish
**Status**: 🔄 In Progress
- Comprehensive UI/UX review of all active features
- Adding animations, standardizing layouts, fixing visual bugs

### Phase 15: Deployment & Distribution
**Status**: 📋 Planned
- [ ] EAS Build for Android APK (Preview)
- [ ] Google Play Store listing
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] App Store (iOS) consideration
