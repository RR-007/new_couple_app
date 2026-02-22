# PRD.md — Product Requirements Document

## 1. Project Overview
**Name**: Couples Bucket List App
**Vision**: A personal, real-time synced Android app for couples to build, manage, and share dynamic bucket lists. Whether it's places to travel, food to cook, or games to play, the app provides a shared space to plan the future together.

## 2. Target Audience
Couples who want a dedicated space to manage their shared goals, ideas, and memories. The initial target users are the app creator and his girlfriend, with a potential future release on the Google Play Store for other couples.

## 3. Core Features (MVP / v1.0)
The MVP focuses exclusively on Android and the features immediately necessary to fulfill the core vision.

### 3.1 Authentication & Linking
- **User Registration/Login**: Users can sign up and log in using an email and password.
- **Couple Linking (Share a Code)**:
  - Upon registration, a user generates a unique 6-digit code.
  - The partner enters this code to securely link the two accounts.
  - Linking ensures that both users share exactly the same lists and items in real-time.

### 3.2 Dynamic List Management
- **List Creation**: Users can create custom categories/lists dynamically (e.g., "Places to Travel", "Food to Cook", "Games to Play").
- **Real-time Syncing**: Any list created or modified by one user instantly appears on the partner's device without refreshing.
- **List Viewing**: A clean, shared dashboard displaying all available categories.

### 3.3 Detailed List Items
- **CRUD Operations on Items**: Users can add, edit, read, and delete items within any specific list.
- **Rich Details for Specific Items**:
  - **Recipes**: Ability to click into a food item and add/view detailed recipes, including ingredients checklists, step-by-step instructions, and photos.
  - **Travel/Activities**: Ability to add completed photos to destinations or activities once they have been achieved.

## 4. Out of Scope (For v1.0)
- Push notifications
- In-app chat messaging
- Shared calendar / scheduling
- Budget tracking
- iOS version (strictly Android for the initial MVP)

## 5. Technical Requirements
- **Tech Stack**: React Native (with Expo file-based router) for cross-platform potential, though deploying exclusively for Android initially.
- **Styling**: TailwindCSS via NativeWind for fast, modern UI development.
- **Backend**: Firebase.
  - **Authentication**: Firebase Auth (Email/Password).
  - **Database**: Firestore (Real-time NoSQL database) for storing users, couples, lists, and items.
  - **Storage**: Firebase Storage for saving user-uploaded photos (e.g., recipe photos, travel memories).

## 6. Success Metrics (MVP)
1. Both initial users can successfully install the app on their Android devices.
2. The account linking process via the 6-digit code works reliably.
3. Creating a list or adding an item on Device A immediately reflects on Device B.
4. Users can successfully upload and view photos attached to recipes or travel destinations.
5. The application is stable and performant enough for daily personal use without crashes.
