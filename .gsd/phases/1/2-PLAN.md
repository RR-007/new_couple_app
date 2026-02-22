---
phase: 1
plan: 2
wave: 2
depends_on: [1.1]
files_modified: []
autonomous: false
user_setup:
  - service: firebase
    why: "Database, Auth, and Storage for real-time couple app."
    env_vars:
      - name: EXPO_PUBLIC_FIREBASE_API_KEY
        source: "Firebase Console -> Project Settings -> General -> Web App"
      - name: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
        source: "Firebase Console -> Project Settings"
      - name: EXPO_PUBLIC_FIREBASE_PROJECT_ID
        source: "Firebase Console -> Project Settings"
      - name: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
        source: "Firebase Console -> Project Settings"
      - name: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        source: "Firebase Console -> Project Settings"
      - name: EXPO_PUBLIC_FIREBASE_APP_ID
        source: "Firebase Console -> Project Settings"
    dashboard_config:
      - task: "Enable Email/Password Authentication"
        location: "Firebase Console -> Authentication -> Sign-in method"
      - task: "Enable Firestore Database (Test Mode is fine for now)"
        location: "Firebase Console -> Firestore Database -> Create database"

must_haves:
  truths:
    - "Firebase SDK is initialized in the app"
    - "Authentication state is managed globally"
  artifacts:
    - "src/config/firebase.ts exists"
    - "src/context/AuthContext.tsx exists"
---

# Plan 1.2: Firebase Auth & Couple Linking

<objective>
Configure Firebase for the project, implement Email/Password User Authentication, and build the "Share a code" couple linking flow.

Purpose: Enable secure logins and connect two users so they can share lists.
Output: Firebase config, Auth Context, Auth UI screens, and Linking UI screens.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- package.json
</context>

<tasks>

<task type="checkpoint:human-action">
  <name>Setup Firebase Project</name>
  <files>.env, .gitignore</files>
  <action>
    User needs to create a Firebase Project, add a Web App, enable Email/Password Auth, and enable Firestore.
    Then, the User must create a `.env` file in the root with the `EXPO_PUBLIC_FIREBASE_*` variables.
    Make sure `.env` is inside `.gitignore`.
  </action>
  <verify>Check that `.env` file exists with required keys.</verify>
  <done>Firebase credentials are available locally.</done>
</task>

<task type="auto">
  <name>Initialize Firebase & Auth Context</name>
  <files>src/config/firebase.ts, src/context/AuthContext.tsx, app/_layout.tsx</files>
  <action>
    Install `firebase` npm package.
    Create `src/config/firebase.ts` to initialize `initializeApp` and `getAuth` using `process.env.EXPO_PUBLIC_FIREBASE_*`.
    Create a React Context provider (`src/context/AuthContext.tsx`) that listens to `onAuthStateChanged`.
    Wrap the root `_layout.tsx` with `<AuthProvider>`.
  </action>
  <verify>The app compiles and runs without crashes indicating Firebase initialization success.</verify>
  <done>Firebase is initialized and Auth state is globally available.</done>
</task>

<task type="auto">
  <name>Build Auth UI Screens</name>
  <files>app/(auth)/login.tsx, app/(auth)/register.tsx</files>
  <action>
    Build simple, Tailwind-styled login and registration screens using `expo-router`.
    Use Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
  </action>
  <verify>User can create an account and log in successfully. Auth Context should reflect the logged-in user.</verify>
  <done>Registration and Login flows are functional.</done>
</task>

<task type="auto">
  <name>Build Couple Linking Flow</name>
  <files>app/(app)/link.tsx, src/services/coupleService.ts</files>
  <action>
    Create a screen (`link.tsx`) shown immediately after a new user registers if they aren't linked yet.
    The screen should show a generated 6-digit "Join Code" (save this to a Firestore `users` document under their UID).
    The screen should also have a text input to "Enter Partner's Code".
    When submitted, explicitly link the two UIDs in Firestore (e.g., set `partnerId` on both documents, or create a shared `couples` document containing both UIDs).
  </action>
  <verify>Create two test accounts. Account 1 generates a code. Account 2 enters the code. Firestore should reflect the link.</verify>
  <done>Users can link their accounts successfully using a shared code.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] User can create an account and log in.
- [ ] User 1 and User 2 can securely link their accounts in Firestore via a 6-digit code.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
