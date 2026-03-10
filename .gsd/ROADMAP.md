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

### Phase 17: Google Sign-in, Auto-Calendar & Auth Polish ✅
**Completed**: 2026-03-01
- Implement Google Sign-In at the initial login/signup page.
- Request Calendar scopes during Google Sign-up.
- Auto-link the Google Calendar immediately upon sign up.
- Implement OTP/email validity checking for standard signups.
- Fix Google Calendar Redirect URI for production builds.

### Phase 18: Quick Text & V2 Home Screen
- Remove Mood Tracker from the Home tab.
- Add a Quick Text input where Mood Tracker used to be to send directly to the Notes tab.
- Add a mini-feed below the input showing the most recent message from both partners (Partner mode) or the last two messages (Group mode).
- Tapping the feed routes to the full Notes page.
- **Bug Fix**: App icon shows a different icon on load (not UsQuest.jpeg), flashes index with a blank screen, and then loads home screen.
- **Bug Fix**: Connecting to Google Calendar from settings hangs/does nothing if not connected during sign in/up.

### Phase 19a: Branding & Backend Tweaks (V2 Prep)
- Rename "Love Notes" to "Chat" to be more specific to its use case.
- Fix cron-job endpoints to ensure they only return quest data, resolving the "output too large" error.

### Phase 19b: Spaces Architecture & Polish (V2 Foundation)
- Remove redundant headers on Our Album, Diary, Chats, Calendar, Lists, and Travel Map (keep the page's custom large header, clear the standard nav bar title).
- Implement Spaces architecture (Option A) to let users create/join multiple groups (Partner, Best Friends, Squad).
- New users land on a "Space Hub" to create/join spaces instead of being locked on the code connect link screen.
- Refactor all db services and components to rely on `spaceId` instead of `coupleId`.

### Phase 19c: Space Switching & Multi-Space UX
- Add a **header space-switcher** component (tap to quickly switch active space from the top bar).
- Add a **"My Spaces" item in the Drawer** menu that navigates to the Space Hub for full management.
- **Space settings screen**: view join code, rename space, leave space.
- Visual indicator of which space is currently active throughout the app (e.g., space name in header).
- Edge cases: what happens when you leave your only space, empty state handling, etc.
- Ensure all feature tabs (Quests, Chat, Pic of the Day, Calendar, Events, Lists) display data scoped to the active space.

### Phase 20: Cleanup & UI Polish
**Status**: 🔄 In Progress
- **Bug Fix**: Google Sign-In swipe-cancel error (getTokens requires user to be signed in)
- **UX Fix**: Keyboard covering text input when creating new space in Space Hub
- **UI Update**: Replace bland Alert dialogs for space creation/leaving with custom celebratory modals
- **UI Update**: Change "Date Night" to "Fun Time" for non-partner spaces
- **Feat Update**: Deduplicate bingo tasks and add fresh unique prompts
- **Feat Update**: Add To-Do List and Bucket List as pre-added default lists
- **Feat Check**: Verify quests work correctly for more than 2 users
- **Feat Check**: Verify email+Google account overlap behavior

### Phase 21: Streak System & Gamification
- Daily streak counter for app engagement, Pic of the Day, Chat.
- Achievement badges for milestones (100 chats, 10 Bingo Wins, etc.).
- Trophy case display in profile.
- Weekly recap push notification with fun stats summary.

### Phase 22: Shared Spotify / Music Integration ✅
**Completed**: 2026-03-05
- Link Spotify accounts, display "Currently Listening" on Home screen.
- Shared "Our Songs" playlist curation.
- "Song of the Day" daily pick (like Pic of the Day for music).
- Listening history overlap — discover shared favorites.
- **Bug Fix**: Fix settings tab not scrolling.

### Phase 23: Location Sharing & Proximity Features ✅
**Completed**: 2026-03-07
- Opt-in live location sharing (built-in).
- "Near You" proximity alerts.
- "Meet Me Here" pin drop for quick meeting points.
- Privacy mode: share only last check-in, not live.

### Phase 25: Customizable Themes & Personalization ✅
**Completed**: 2026-03-08
- Custom color theme picker (beyond dark/light).
- Custom app icon options.
- Couple nickname in header.
- Custom notification sounds (partner-specific tones, using standard tones for now).
- Customize tab header names for spaces to mess around with other members

### Phase 26a: Personalization V2 & Syncing ✅
**Completed**: 2026-03-09
- [x] Primary, Secondary, Tertiary Theme Colors (Sliders for Hue/Hex/RGB). Primary = foreground, Secondary = widgets background, Tertiary = app background (Dark/Light or Image).
- [x] Member Nicknames: Allow defining nicknames for each specific member in a Space, synced for everyone.
- [x] Sync Tab Names: Ensure custom tab names are synced across the space for all users.
- [x] Edit space name: ensure it syncs across the database for all users in real-time, not just locally.

### Phase 26b: Navigation & Home Screen Polish
**Status**: 🔄 In Progress
- [ ] Drawer Header: Keep "Settings" persistent below the "My Spaces" button in the menu.
- [ ] Drawer Header: Add a "Home" button top-right next to space selection.
- [ ] Rename tabs for simplicity: "Travel Map" -> "Travel", "Flashbang Bingo" -> "Bingo", "Date Night" -> "Date", "Our Album" -> "Album".
- [ ] Live Location: fix inaccurate coordinates, sync/toggle bugs (not turning off for partner, not showing when turned on).
- [ ] Widget Spacing: reduce gap between widgets; fix massive gap between Pic of the Day and Active Quests.
- [ ] Widget Colors: replace bland gray backgrounds with secondary theme or coordinating colors so they don't clash.
- [ ] Hierarchy: Move Streak counter above Music and Partner's Location.

### Phase 26c: Chat, Bingo & Album Polish
- [ ] Bingo Colors: Add "pizzazz" and complementary colors; remove dull gray boxes.
- [ ] Albums: Stop auto-adding Bingo pics to the global "Our Album" feed.
- [ ] Chat Colors: Replace clashing pink/gray bubble colors with a complimentary, aesthetically pleasing palette.
- [ ] Chat Input: Fix keyboard avoiding view (keyboard covers text bar).
- [ ] Pic of the Day sync: Fix severe delay (5 mins) for potd images appearing in "Our Album".

### Phase 26d: Lists, Gifts, Calendar & Travel Polish
- [ ] Gifts Tab layout: fix the layout taking full screen/hiding menu bar.
- [ ] AI Gift Generator: Fix `[404] models/gemini-1.5-flash is not found for API version v1beta` (update model string/API version).
- [ ] Lists UI: Add sub-headings for Bucket List and To-Do (like Recipes/Watchlist).
- [ ] Gift Inputs: Fix "Could not add item" error when optional link/price are left empty.
- [ ] Gift Keyboard: Fix keyboard avoiding view covering input fields.
- [ ] Gift Priority: Invert logic (higher number = higher priority), expand scale to 1-5.
- [ ] Gift Claims & Budgets: Fix claiming/buying bug where it doesn't show in the buyer's history or deduct from the budget.
- [ ] Gift Currency: Add ability to change currency / do currency conversion.
- [ ] Gift Layout Bug: Fix scaling/disappearing bug when multiple items are added to a wishlist.
- [ ] Calendar connection flow: add "Go to settings" button in Calendar tab if not connected.
- [ ] Calendar sync fix: fix the state where it still asks to connect even after successful connection.
- [ ] Settings cleanup: remove "partner connected" UI since we rely on spaces now.
- [ ] Events: replace manual text date input with a proper Date Picker component.
- [ ] Map Pins: Fix the delete button overflowing off the screen/box.

### Phase 26e: General Polish
- [ ] Alert Boxes: Replace dull gray alert boxes (e.g., after editing space name) with custom styled modals.

### Phase 27: Travel Itineraries & Media Expansion
- **Travel Itineraries**: Allow tapping pinned map entries to open an "Itinerary" sub-page with rich notes, PDF uploads (flights/hotels), in-app viewing, and external sharing (WhatsApp/Email).
- **Media Download**: Add ability to securely download images/videos to device storage from Album, Quests, Bingo, etc.
- **Rich Quest History**: Deduplicate completed quests and add support for rich inputs (photo/video/text) when submitting/reviewing quest completions.

### Phase 28: Lists Roulette & Calendar Expansion
- **Generalized Roulette**: Add a generic "Roulette/Spin" button to custom lists, Watchlist, Recipes, etc.
- **Roulette Sync**: Ensure that when one person spins via Date Night or custom lists, the chosen idea broadcasts and syncs to other space members.
- **List Renaming**: Allow renaming the pre-added default app lists.
- **Recurring Events**: Add support for recurring events (birthdays, anniversaries) in the Calendar widget.
- **Currency Conversion**: Convert wishlist and budget items automatically to user-preferred currency if different.

### Phase 29: Couple Quizzes & Compatibility Games
- "How Well Do You Know Me?" custom quizzes.
- Daily "Would You Rather" prompts with reveal after both answer.
- "This or That" swipe game with fun categories.
- Score tracking over time.

### Phase 30: Relationship Dashboard & Analytics
- Visual stats: days together, photos shared, notes exchanged, quests completed.
- Weekly/monthly activity heatmap.
- "Memory Lane" auto-generated slideshows on anniversaries.
- Exportable "Year in Review" report.

### Phase 31: Shared Routines & Habits
- Create shared daily/weekly routines (e.g., "Call at 9pm", "Weekly movie night").
- Check-off tracking for both partners.
- Gentle nudge notifications for missed routines.
- Streaks per routine.

### Phase 32: Self-Service Account & Data Management
**Objective**: Enable users to manage their own data without manual support.
- **In-app Account Deletion**: Allow users to delete their account directly from Settings.
- **Firebase Cloud Function**: Create HTTPS callable to automate account deletion:
  - Delete all Firestore collections for the couple
  - Use Cloudinary Admin API to delete associated images
  - Delete Firebase Auth user
- **Delete Individual Photos**: Add ability to delete specific photos from diary entries (not just whole entries).
- **Data Export**: Allow users to export their data as JSON (notes, lists, diary entries).
