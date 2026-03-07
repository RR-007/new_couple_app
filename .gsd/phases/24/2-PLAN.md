---
phase: 24
plan: 2
wave: 2
depends_on: [1]
files_modified: ["app/(app)/(drawer)/_layout.tsx", "app/(app)/(drawer)/gifts.tsx", "src/components/gifts/WishlistTab.tsx", "src/components/gifts/GiftHistoryTab.tsx"]
autonomous: true

must_haves:
  truths:
    - "User can navigate to the Gifts page from the drawer."
    - "Wishlist items show as claimed to the claimer, but not to the creator."
  artifacts:
    - "app/(app)/(drawer)/gifts.tsx"
---

# Plan 24.2: Gifts Dashboard & Basic Tabs

<objective>
Build the Gifts dashboard UI and the initial sub-tabs for Wishlist and Gift History.

Purpose: Provide a visual interface for partners to view wishlists and past gifts.
Output: New screens and components for the Gifts tab.
</objective>

<context>
Load for context:
- app/(app)/(drawer)/_layout.tsx
- src/services/giftService.ts
- src/components/CreateListModal.tsx (For reference on modals)
</context>

<tasks>

<task type="auto">
  <name>Gifts Screen & Layout Injection</name>
  <files>
    app/(app)/(drawer)/_layout.tsx
    app/(app)/(drawer)/gifts.tsx
  </files>
  <action>
    - Add `gifts` screen to `app/(app)/(drawer)/_layout.tsx` (Icon: "gift" or similar).
    - Create `gifts.tsx`: A dashboard with a segmented control or simple tab bar swapping between "Wishlist", "History", and "Budgets".
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Drawer includes Gifts, and screen compiles successfully.</done>
</task>

<task type="auto">
  <name>Wishlist & History Components</name>
  <files>
    src/components/gifts/WishlistTab.tsx
    src/components/gifts/GiftHistoryTab.tsx
  </files>
  <action>
    - `WishlistTab`: Lists items. If `item.createdBy === currentUser.uid`, never show `claimedBy`. If `item.createdBy !== currentUser.uid`, show "Claim" button or "Claimed by you".
    - `GiftHistoryTab`: Simple list showing past gifts, date given, and an optional image (Cloudinary style).
    
    AVOID: Revealing claimed status to the creator user in `WishlistTab`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Components render conditionally based on user ID and compile successfully.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Navigation works and screen loads.
- [ ] Claim hiding logic is strictly implemented.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
