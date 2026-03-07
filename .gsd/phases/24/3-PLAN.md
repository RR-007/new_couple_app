---
phase: 24
plan: 3
wave: 3
depends_on: [2]
files_modified: ["src/components/gifts/BudgetTab.tsx", "src/components/gifts/GiftIdeaGenerator.tsx", "app/(app)/(drawer)/gifts.tsx"]
autonomous: true

must_haves:
  truths:
    - "Budgets visually indicate how close you are to the limit."
    - "Idea generator provides some heuristics based suggestions."
  artifacts:
    - "src/components/gifts/BudgetTab.tsx"
    - "src/components/gifts/GiftIdeaGenerator.tsx"
---

# Plan 24.3: Budgets & Idea Generator

<objective>
Implement budget tracking and a fun, heuristic-based gift idea generator.

Purpose: Finalize the gift features with financial tracking and helpful inspirations.
Output: Budget UI and Generator UI integrated into the Gifts screen.
</objective>

<context>
Load for context:
- app/(app)/(drawer)/gifts.tsx
- src/services/giftService.ts
- src/services/listService.ts (to pull partner's list items for heuristics)
</context>

<tasks>

<task type="auto">
  <name>Budget Tracker Tab</name>
  <files>
    src/components/gifts/BudgetTab.tsx
    app/(app)/(drawer)/gifts.tsx
  </files>
  <action>
    - Create `BudgetTab.tsx`. Display progress bars for each configured occasion (e.g. Anniversary - $150 / $200). 
    - Compute total spent by summing up `price` of items in GiftHistory for that occasion (or tracking manually in Budget doc).
    - Wire into the main `gifts.tsx` screen.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Budgets render with progress indicators.</done>
</task>

<task type="auto">
  <name>Gift Idea Generator</name>
  <files>
    src/components/gifts/GiftIdeaGenerator.tsx
    app/(app)/(drawer)/gifts.tsx
  </files>
  <action>
    - Ensure `@google/generative-ai` is installed.
    - Build a modal or expandable section "Need Ideas?".
    - Pull the partner's list items from `listService.ts` and send them as context to the Gemini 1.5 Flash model using the `EXPO_PUBLIC_GEMINI_API_KEY` from the environment.
    - Prompt Gemini to generate 3-5 specific, creative gift ideas based on the user's lists.
    - Add a button to auto-add a suggested idea to the partner's wishlist as a "Surprise Gift" (hidden from them).
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Generator suggests ideas based on list words and compiles successfully.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Budget calculation logic is safe from `NaN` or crashes.
- [ ] Idea generator handles empty lists gracefully without throwing errors.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
