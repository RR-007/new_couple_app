---
phase: 26a
plan: 1
wave: 1
depends_on: []
files_modified: ["src/services/spaceService.ts", "src/context/ThemeContext.tsx"]
autonomous: true

must_haves:
  truths:
    - "Space interface supports primary, secondary, tertiary themes"
    - "Space interface supports a nicknames map for per-user nicknames"
    - "ThemeContext exposes the new theme structure and a getNickname function"
---

# Plan 26a.1: Personalization Data Layer & Context

<objective>
Refactor `spaceService.ts` to support the new `theme` structure (primary, secondary, tertiary) and `nicknames` map instead of `themeColor` and `coupleNickname`. Then, update `ThemeContext` to provide this new state structure and a `getNickname` helper.

Purpose: Foundation for advanced personalization features.
Output: Updated service and context files.
</objective>

<context>
Load for context:
- src/services/spaceService.ts
- src/context/ThemeContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Update Space Interface & Service</name>
  <files>src/services/spaceService.ts</files>
  <action>
    Modify `Space` interface: remove `themeColor`, `coupleNickname`. Add `theme?: { primary: string; secondary: string; tertiary: { type: 'color' | 'image'; value: string } }` and `nicknames?: Record<string, string>`.
    Modify `updateSpacePersonalization` to accept `theme`, `nicknames`, `tabNames`. Use `updateDoc` against the central space document to guarantee sync.
    AVOID: Modifying other space logic like user joining or leaving.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Space interface and service function updated.</done>
</task>

<task type="auto">
  <name>Update Theme Context</name>
  <files>src/context/ThemeContext.tsx</files>
  <action>
    Remove `themeColor`, `coupleNickname` from `ThemeContextType` and local state.
    Add `theme` and `nicknames` (defaulting to empty map).
    Add `getNickname: (userId: string) => string | null` to the context to fetch a specific user's nickname.
    In `onSnapshot`, map the new fields from the doc.
    AVOID: Changing the caching/loading logic unless necessary.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>ThemeContext exposes new theme structure and nickname helper.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Typescript compiles without errors in the edited files.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
