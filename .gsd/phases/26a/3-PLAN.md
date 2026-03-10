---
phase: 26a
plan: 3
wave: 3
depends_on: ["1", "2"]
files_modified: ["app/_layout.tsx", "app/(app)/_layout.tsx", "app/(app)/(drawer)/_layout.tsx", "app/(app)/(drawer)/index.tsx", "app/(app)/(drawer)/notes.tsx"]
autonomous: true

must_haves:
  truths:
    - "Root app layouts apply the primary and tertiary themes"
    - "Navigational elements apply primary colors"
    - "Widgets apply secondary theme for backgrounds"
    - "Anywhere a generic partner name was shown, the specific member's nickname from getNickname is used"
---

# Plan 26a.3: Applying Themes & Nicknames Across App

<objective>
Update navigation, layouts, and main screens (Home, Chat) to consume the new `theme` (primary/secondary/tertiary colors) and the `getNickname` function.

Purpose: Visually apply the new personalization settings everywhere in the app.
Output: Consistently themed app views.
</objective>

<context>
Load for context:
- app/_layout.tsx
- app/(app)/_layout.tsx
- app/(app)/(drawer)/_layout.tsx
- app/(app)/(drawer)/index.tsx
- app/(app)/(drawer)/notes.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply Colors to Layouts</name>
  <files>app/_layout.tsx, app/(app)/_layout.tsx, app/(app)/(drawer)/_layout.tsx</files>
  <action>
    In standard layouts that use the theme, switch references from `customization.themeColor` to `customization.theme?.primary`.
    If possible, apply `customization.theme?.tertiary` to the background of the root views (e.g., using a wrapper View or ImageBackground).
    AVOID: Breaking navigation nesting.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Layouts apply primary and tertiary colors properly.</done>
</task>

<task type="auto">
  <name>Apply Colors & Nicknames to Widgets & Chat</name>
  <files>app/(app)/(drawer)/index.tsx, app/(app)/(drawer)/notes.tsx</files>
  <action>
    Update the backgrounds of widgets (e.g., in index.tsx Dashboard) to use `customization.theme?.secondary` instead of hardcoded greys.
    Replace any usage of `customization.coupleNickname` with calls to `customization.getNickname(userId)` where appropriate, or default mapping if we are displaying a global greeting.
    AVOID: Hardcoding backgrounds.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Widgets have colored backgrounds, names use getNickname.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Build compiles and all usages of old `themeColor` and `coupleNickname` are removed.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
