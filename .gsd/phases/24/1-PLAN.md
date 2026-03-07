---
phase: 24
plan: 1
wave: 1
depends_on: []
files_modified: ["src/services/giftService.ts"]
autonomous: true

must_haves:
  truths:
    - "Gift items can be created, updated, and deleted."
    - "Claiming a gift updates the claimedBy field without creator knowing via UI."
  artifacts:
    - "src/services/giftService.ts exists and exports standard CRUD functions"
---

# Plan 24.1: Gift Service Data Layer

<objective>
Establish the Firestore service functions for handling wishlists, gift history, and budgets, enabling the core functionality of Phase 24.

Purpose: We need a dedicated service separate from listService because gifts require specialized fields like `price`, `claimedBy`, and `photoUrl`.
Output: New `src/services/giftService.ts` file.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- src/services/listService.ts (Reference for how we structure Firestore services)
</context>

<tasks>

<task type="auto">
  <name>Create giftService.ts</name>
  <files>src/services/giftService.ts</files>
  <action>
    Implement Firestore CRUD operations for gifts using the spaces architecture.
    Methods needed:
    - `addWishlistItem(spaceId, item: Omit<WishlistItem, 'id' | 'createdAt'>)`
    - `subscribeToWishlist(spaceId, callback)`
    - `claimWishlistItem(spaceId, itemId, claimerUserId)`
    - `unclaimWishlistItem(spaceId, itemId)`
    - `addGiftHistory(spaceId, item: Omit<GiftHistory, 'id' | 'createdAt'>)`
    - `subscribeToGiftHistory(spaceId, callback)`
    - `setGiftBudget(spaceId, occasion, amount)`
    - `subscribeToBudgets(spaceId, callback)`
    
    AVOID: Relying on `coupleId`. Ensure all queries use `spaceId` as migrated in Phase 19.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Service compiles successfully with strong TypeScript types for WishlistItem, GiftHistory, and Budget.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] TypeScript compiler passes without errors.
- [ ] Exported functions exist for Wishlist, History, and Budgets.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
