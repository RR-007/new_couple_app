# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A personal, real-time synced Android app for couples to build, manage, and share dynamic bucket lists. Whether it's places to travel, food to cook, or games to play, the app provides a shared space to plan the future together.

## Goals
1. Allow users to register/login and link their accounts as a couple.
2. Enable creation of dynamic, custom lists (e.g., Travel, Food, Games).
3. Support detailed entries within lists (e.g., recipes with ingredients, instructions, and photos; travel destinations with completed photos).
4. Provide real-time synchronization between both users' devices.

## Non-Goals (Out of Scope for v1)
- Push notifications
- In-app chat messaging
- Shared calendar/scheduling
- Budget tracking
- iOS version (strictly focusing on Android for now, though tech stack may support it)

## Users
Couples (specifically starting with the creator and his girlfriend) who want a dedicated space to manage their shared goals, ideas, and memories. Eventually, other couples via the Play Store.

## Constraints
- **Technical**: Built by a new Android developer, so the tech stack must be beginner-friendly with excellent documentation (React Native + Expo with Firebase is recommended).
- **Timeline**: Fast time-to-market for the initial version to start using it immediately.
- **Platform**: Primarily Android initially.

## Success Criteria
- [ ] Both users can install the app on their Android phones.
- [ ] Users can create a new custom list and it appears on the other person's phone instantly.
- [ ] Users can add a recipe with details and photos.
- [ ] The app is stable enough for daily personal use.
