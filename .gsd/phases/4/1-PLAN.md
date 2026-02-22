# Phase 4 Plan — Engagement & Fun

> **Status**: `PLANNED`
> **Phase**: 4
> **Goal**: Add three fun, low-complexity features that give couples a reason to open the app every day.

---

## Feature 1: 💌 Love Notes

### What
Send short appreciation notes to your partner. They appear as a scrollable feed showing notes from both partners.

### Firestore Structure
```
couples/{coupleId}/notes/{noteId}
  text: string         ("You made me smile today 💛")
  authorUid: string
  createdAt: timestamp
```

### Implementation
1. **noteService.ts** — `createNote`, `subscribeToNotes`, `deleteNote`
2. **New screen or tab** — Scrollable feed of notes with "You" / "Partner" labels
3. **Compose input** — Simple text input at the bottom (like a chat)

### Complexity: Low

---

## Feature 2: 🎯 Date Night Roulette

### What
Both partners add date ideas to a shared pool. A "Spin" button randomly picks one. Mark ideas as "Done" after completing.

### Firestore Structure
```
couples/{coupleId}/dateIdeas/{ideaId}
  text: string         ("Cook a new recipe together")
  addedBy: string
  done: boolean
  createdAt: timestamp
```

### Implementation
1. **dateIdeaService.ts** — `addIdea`, `subscribeToIdeas`, `markDone`, `deleteIdea`
2. **Date Ideas screen** — List of ideas + "🎲 Spin!" button
3. **Spin animation** — Cycle through ideas rapidly, land on random pick
4. **Done toggle** — Mark completed ideas (greyed out)

### Complexity: Low

---

## Feature 3: 📊 Mood Check-In

### What
Daily mood log using emojis. Both partners can see each other's mood. Simple and fast.

### Firestore Structure
```
couples/{coupleId}/moods/{date}_{uid}
  mood: string         ("😊")
  uid: string
  date: string         ("2026-02-22")
  createdAt: timestamp
```

### Implementation
1. **moodService.ts** — `logMood`, `subscribeTodaysMoods`, `subscribeToMoodHistory`
2. **Mood section** — Emoji picker (5-6 moods), shows partner's mood for today
3. **Could live on the home dashboard** or as its own tab

### Complexity: Low

---

## Tab Navigation Plan
Current: 📋 Lists → 📓 Diary → ⏳ Events → ⚙️ Settings

These 3 features are lightweight and don't all need their own tabs. Proposed approach:
- **💌 Love Notes** → New tab (high daily use)
- **🎯 Date Roulette** → Accessible from dashboard or settings
- **📊 Mood Check-In** → Widget on the dashboard (like countdown widget)

Updated tabs: 📋 Lists → 💌 Notes → 📓 Diary → ⏳ Events → ⚙️ Settings

---

## Order of Execution

### Wave 1: Love Notes (new tab, highest daily engagement)
### Wave 2: Mood Check-In (dashboard widget, quick to build)
### Wave 3: Date Night Roulette (fun standalone screen)

---

## Verification
- [ ] Send a love note → partner sees it in real-time
- [ ] Log mood → partner sees your mood on their dashboard
- [ ] Add date ideas → spin randomly picks one
- [ ] Mark date idea as done → shows as completed
