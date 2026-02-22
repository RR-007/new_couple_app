---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified: []
autonomous: true
user_setup: []

must_haves:
  truths:
    - "React Native Expo app is initialized"
    - "TailwindCSS (NativeWind) is configured"
  artifacts:
    - "app/_layout.tsx exists"
    - "tailwind.config.js exists"
---

# Plan 1.1: Initialize Expo & NativeWind

<objective>
Initialize a new Expo React Native application using expo-router, and set up NativeWind for Tailwind styling.

Purpose: Foundation for the mobile app UI.
Output: Expo project files and styling configuration.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/DECISIONS.md
</context>

<tasks>

<task type="auto">
  <name>Initialize Expo App</name>
  <files>package.json, app/_layout.tsx, app/index.tsx</files>
  <action>
    Use `npx create-expo-app@latest .` to scaffold a blank app in the current root directory (`c:\My Drive\Projects\new_couple_app`).
    AVOID: Creating a nested folder for the app. The current directory should be the root of the React Native app since it's already a dedicated repo.
  </action>
  <verify>npm run start -- --reset</verify>
  <done>package.json exists with expo dependencies and app directory contains _layout.tsx</done>
</task>

<task type="auto">
  <name>Install and Configure NativeWind</name>
  <files>tailwind.config.js, babel.config.js, global.css, app/_layout.tsx</files>
  <action>
    Install nativewind and its dependencies (tailwindcss).
    Configure tailwind.config.js.
    Configure babel.config.js.
    Import global.css in app/_layout.tsx.
    Add a simple Tailwind class to app/index.tsx (e.g., `<View className="flex-1 items-center justify-center bg-blue-100">`) to verify.
    AVOID: Using outdated NativeWind v2 setups. Use the latest setup for Expo router.
  </action>
  <verify>npm run start</verify>
  <done>Tailwind classes render correctly in the Expo app</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [x] React Native Expo app is initialized
- [x] TailwindCSS (NativeWind) is configured
</verification>

<success_criteria>
- [x] All tasks verified
- [x] Must-haves confirmed
</success_criteria>
