---
phase: 26a
plan: 2
wave: 2
depends_on: ["1"]
files_modified: ["app/(app)/space-personalization.tsx", "app/(app)/space-settings.tsx"]
autonomous: true

must_haves:
  truths:
    - "space-personalization UI allows selecting primary, secondary, and tertiary themes"
    - "space-personalization UI allows setting per-member nicknames"
    - "Space Name editing in settings updates the central database so it is globally synced"
---

# Plan 26a.2: Personalization UI & Global Sync Fixes

<objective>
Update the Personalization screen to utilize the new `theme` and `nicknames` structures, allowing detailed color configurations and per-user nickname settings. Ensure space name updates correctly sync globally.

Purpose: Let users interact with the new personalization settings.
Output: Updated UI screens.
</objective>

<context>
Load for context:
- app/(app)/space-personalization.tsx
- app/(app)/space-settings.tsx
- src/services/spaceService.ts
- src/context/ThemeContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Revamp Personalization Screen</name>
  <files>app/(app)/space-personalization.tsx</files>
  <action>
    Remove the old static swatch picker and couple nickname input.
    Add UI for setting `primary`, `secondary`, and `tertiary` (color or image via url string) themes. (You can use simple hex inputs + swatch buttons for now).
    Add UI to list current space members (you can use space.members or similar state) and set their nicknames individually.
    On save, construct the new `theme` and `nicknames` objects and call `updateSpacePersonalization`.
    AVOID: Using complex 3rd party color picker libraries initially unless simple to drop in. Standard text inputs + preset buttons are safer for an MVP.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Screen compiles, uses new ThemeContext types.</done>
</task>

<task type="auto">
  <name>Fix Space Name Global Sync</name>
  <files>app/(app)/space-settings.tsx</files>
  <action>
    When saving the space name, ensure it calls `renameSpace` from `spaceService`, which should update the central space document in Firestore (`spaces/{spaceId}`). This ensures `ThemeContext` onSnapshot listeners on all clients pick it up.
    AVOID: Only updating the local user's space record.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Space name updates are broadcast globally.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No type errors in the UI files.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
