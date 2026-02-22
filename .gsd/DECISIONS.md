# DECISIONS.md

## ADR-001: Tech Stack Selection
**Date**: 2026-02-22
**Context**: New Android developer needs a stack to build a real-time synced mobile app for an MVP.
**Decision**: Use **React Native with Expo** and **Firebase**.
**Rationale**: React Native/Expo offers a gentle learning curve, instant reloading, and great UI libraries. Firebase provides out-of-the-box real-time database (Firestore), Storage (for photos), and Authentication.

## ADR-002: Couple Linking Strategy
**Date**: 2026-02-22
**Context**: Need a simple but secure way to link two distinct user accounts into a shared "couple" experience.
**Decision**: Use a **Share a code** system.
**Rationale**: User A generates a 6-digit code. User B enters that code to establish the link. This is a common, frictionless, app-only experience that avoids relying on external email invites.

## ADR-003: Styling & Design System
**Date**: 2026-02-22
**Context**: Need a rapid UI development approach.
**Decision**: Use **TailwindCSS via NativeWind**.
**Rationale**: NativeWind allows using standard Tailwind utility classes in React Native, drastically speeding up UI development compared to standard StyleSheet objects.

## ADR-004: Firestore Data Model for Shared Content
**Date**: 2026-02-22
**Context**: Need a data model where both coupled users share lists and items with real-time sync.
**Decision**: Nest shared data under `couples/{coupleId}/lists/{listId}/items/{itemId}`.
**Rationale**: Using the couple document as the root for all shared content means both users query the same path. Firestore `onSnapshot` listeners on these subcollections provide instant real-time sync. The `coupleId` is stored on both user profiles during linking, making it easy to resolve.

