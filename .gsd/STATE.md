# STATE.md

> **Current Phase**: 4
> **Active Task**: Phase 4 complete, pending user testing

## What Was Built (Phase 4)

### 💌 Love Notes
- `noteService.ts` — CRUD with real-time subscription
- Notes tab with chat-bubble UI (pink for you, white for partner)
- Relative timestamps ("2h ago"), long-press to delete

### 📊 Mood Check-In
- `moodService.ts` — date-based upsert (one mood per person per day)
- Dashboard widget with emoji picker + both partners' moods visible

### 🎯 Date Night Roulette
- `dateIdeaService.ts` — CRUD with done toggle
- Standalone screen at `/(app)/datenight` with spin animation
- Mark ideas as done, long-press to delete

## Tab Navigation
🏠 Home → 💌 Notes → 📓 Diary → ⏳ Events → ⚙️ Settings

## Next Steps
- User tests Phase 4 features
- Plan Phase 5 (Google Calendar Integration)
