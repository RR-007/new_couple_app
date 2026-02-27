# Feature Ideas Backlog

> Living document for all feature ideas. Items here are **not committed to the roadmap** until prioritized and planned.
> Last updated: 2026-02-22

## Current State
- ✅ Auth & couple linking
- ✅ Dynamic shared lists with real-time sync
- ✅ List items with completed status

---

## User Ideas

### 📓 Diary / Journal Entries
Shared diary entries with photo support. Both partners can write entries, attach photos, and revisit shared memories.
- Rich text or simple text + photos
- Date-stamped, scrollable timeline
- Private vs shared entry toggle?

### ⏰ Reminders & Important Dates
Track anniversaries, birthdays, special dates with reminders.
- Add custom dates with labels
- Push notifications (future)
- Countdown display ("14 days until our anniversary!")

### 🛒 Purchase Links / Wishlist
Attach purchase links to wishlist items so users can tap and go directly to the store.
- URL field on list items
- Link preview (title, image, price) — scrape or OG tags
- "Bought" status to track gifting without spoilers?

---

## Additional Suggestions

### 🎯 Date Night Roulette
A randomizer that picks from a curated list of date ideas.
- Both partners add ideas to a shared pool
- Spin/shuffle to pick one randomly
- Mark as "done" after completing

### ⏳ Countdown Timers
Visual countdowns for upcoming events (trips, visits, milestones).
- Homepage widget showing next upcoming event
- Pairs well with Reminders feature

### 🗺️ Travel Map
Pin places you've visited and want to visit on a shared map.
- Completed trips get a photo attached
- Bucket list pins in a different color

### 🍳 Recipe Viewer (Enhancements)
- Custom tags (Breakfast, Lunch/Dinner, Dessert, Cuisine)
- Sort and filter by tags

### 🎬 Shared Watchlist / Playlist
Lists specifically for movies, shows, songs, books.
- Pull metadata from APIs (poster, rating, link)
- "Watched/Listened" status
- Rating after completion (both partners rate)
- Custom tags (Anime, Shows, Movies, Genre)
- Sort and filter by tags

### 📸 Pic of the Day
Daily shared photo album.
- "How we feeling today?" Replacement or addition
- Take a daily picture to show the other person
- Add a custom caption
- Forms a day-by-day continuous album over time

### 🗺️ Native Travel Map (v2)
Phone-compatible travel map (replacing the old leaflet web version).
- Uses react-native-maps for smooth mobile performance
- Pin places visited instead of every single entry
- Pins use the country flag as the marker

### 💌 Love Notes / Appreciation
Quick notes of appreciation that appear on partner's screen.
- Daily prompt: "What do you appreciate about your partner today?"
- Notification when partner leaves a note
- Scrollable history of notes

### 📊 Mood Check-In
Daily mood log that both partners can see.
- Simple emoji-based mood selector
- Weekly/monthly mood trends visualization
- Helps partners stay emotionally connected across distance

### 📅 Google Calendar Integration *(Partner's suggestion)*
Connect both partners' Google Calendars into a shared view.
- Google OAuth for both partners
- Merged calendar showing both schedules, color-coded
- Travel/booking alerts (flights, trains from Gmail)
- Requires FastAPI backend for secure OAuth token handling

---

## Prioritization
| Priority | Feature | Complexity | Phase | Status |
|----------|---------|------------|-------|--------|
| 1 | Diary Entries | Medium | 3 | ✅ Done |
| 2 | Purchase Links | Low | 3 | ✅ Done |
| 3 | Countdown Timers | Low | 3 | ✅ Done |
| 4 | Love Notes | Low | 4 | ⬜ Next |
| 5 | Date Night Roulette | Low | 4 | ⬜ Next |
| 6 | Mood Check-In | Low | 4 | ⬜ Next |
| 7 | Google Calendar | High | 5 | ⬜ Planned |
| 8 | Recipe Viewer | Medium | 6 | ⬜ Backlog |
| 9 | Shared Watchlist | Medium | 6 | ⬜ Backlog |
| 10 | Travel Map | High | 6 | ⬜ Backlog |

---

## Version 2 (V2) Concepts

### 👥 Multi-Profile / Group Spaces
Allow users to create multiple isolated "spaces" for different friends/groups instead of just one partner.
- Replaces "Love Notes" with standard "Notes" or "Messages" based on group context.
- Single login can switch contexts fluidly between Partner, Squad, etc.

### 💨 Quick Text & Feed (Home Redesign)
- Remove Mood Tracker.
- Add Quick Text input on the Home screen to send directly to Notes without navigating.
- Below the input, display a mini-feed of the latest 2 messages sent to Notes.

### 🔑 Google Sign-In & Auto-Calendar (Onboarding)
- Fast onboarding via Google Sign-in.
- Pass Calendar OAuth scopes during initial auth so calendar is automatically connected.

### 🎮 Streak System & Gamification
- Daily streak counter for app engagement, Pic of the Day, Love Notes.
- Achievement badges for milestones (100 Love Notes, 10 Bingo Wins, etc.).
- Trophy case display in profile.
- Weekly recap push notification with fun stats summary.

### 🎵 Shared Spotify / Music Integration
- Link Spotify accounts, display "Currently Listening" on Home screen.
- Shared "Our Songs" playlist curation.
- "Song of the Day" daily pick.
- Listening history overlap.

### 📍 Location Sharing & Proximity Features
- Opt-in live location sharing.
- "Near You" proximity alerts.
- "Meet Me Here" pin drop.
- Privacy mode: last check-in only.

### 🎁 Gift Tracker & Wishlist V2
- Price tracking, priority ranking, hidden "claimed" status.
- Gift history log with dates and photos.
- Gift budget tracker per occasion.
- "Gift Idea Generator" based on partner's interests.

### 🧩 Couple Quizzes & Compatibility Games
- "How Well Do You Know Me?" custom quizzes.
- Daily "Would You Rather" prompts.
- "This or That" swipe game.
- Score tracking over time.

### 📊 Relationship Dashboard & Analytics
- Visual stats: days together, photos shared, notes exchanged, quests completed.
- Weekly/monthly activity heatmap.
- "Memory Lane" auto-generated slideshows.
- Exportable "Year in Review" report.

### 🗓️ Shared Routines & Habits
- Shared daily/weekly routines with check-off tracking.
- Gentle nudge notifications for missed routines.
- Streaks per routine.

### 🎨 Customizable Themes & Personalization
- Custom color theme picker (beyond dark/light).
- Custom app icon options.
- Couple nickname in header.
- Custom notification sounds.

