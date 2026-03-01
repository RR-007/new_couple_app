---
phase: 17
plan: 1
wave: 1
---

# Plan 17.1: Google Sign-in, Auto-Calendar & Auth Polish

## Objective
Implement Google Sign-In at the initial login/signup page and request Calendar scopes to auto-link the user's Google Calendar. Additionally, implement email OTP validity checks for the standard email sign-up flow, and fix the Google Calendar Redirect URI for production build.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- src/services/googleAuthService.ts
- app/(auth)/login.tsx
- app/(auth)/register.tsx

## Objective
Implement Google Sign-In at the initial login/signup page and request Calendar scopes to auto-link the user's Google Calendar. Additionally, implement email OTP validity checks for the standard email sign-up flow, and fix the Google Calendar Redirect URI for production build.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- src/services/googleAuthService.ts
- app/(auth)/login.tsx
- app/(auth)/register.tsx

## Tasks

<task type="auto">
  <name>Implement Google Sign-in for Login/Signup</name>
  <files>src/screens/LoginScreen.tsx, src/services/googleAuthService.ts</files>
  <action>
    - Add a "Sign in with Google" button to the intro/login/signup flow.
    - Wire up Google Authentication logic utilizing the existing `useGoogleAuth` hook from `googleAuthService.ts`.
    - Ensure new user documents are created in Firestore if they are signing up.
  </action>
  <verify>Check that the app correctly redirects and signs in a user via Google OAuth.</verify>
  <done>User can successfully authenticate and enter the app using Google Sign-in.</done>
</task>

<task type="auto">
  <name>Request Calendar Scopes and Auto-link</name>
  <files>src/services/googleAuthService.ts</files>
  <action>
    - Ensure Calendar scopes (`https://www.googleapis.com/auth/calendar.events`) are correctly requested during the Google auth flow.
    - Upon successful sign-in/sign-up, automatically store the retrieved token in the `googleTokens` subcollection for the user.
    - This skips the manual "Link Calendar" step inside the app settings for users who use Google Sign-in.
  </action>
  <verify>Check Firestore database to verify `googleTokens` are populated right after account creation.</verify>
  <done>Google calendar token is fetched and linked directly to the user's account upon sign-in.</done>
</task>

<task type="auto">
  <name>Implement Email validity checks and OTP verification</name>
  <files>app/(auth)/login.tsx, app/(auth)/register.tsx</files>
  <action>
    - Add logic to verify if the email provided during signup is valid (standard regex/Firebase validation).
    - Implement an OTP (One-Time Password) email verification step during the registration flow to ensure users own the email they register with.
    - Check if the user's email is verified before allowing them to fully log in or access the app (`user.emailVerified`).
  </action>
  <verify>Attempt to register with a dummy email and ensure access is blocked until OTP/verification link is clicked.</verify>
  <done>Standard signups require email verification before the user can access the main app features.</done>
</task>

<task type="auto">
  <name>Fix Google Calendar Redirect URI for Production</name>
  <files>src/services/googleAuthService.ts</files>
  <action>
    - Remove the hardcoded `scheme: 'ustogether'` in the `makeRedirectUri` call.
    - Add `useProxy: true` to the `makeRedirectUri` options to properly resolve the redirect URI in Expo production builds. 
    - If needed, expose the resolved URI using a temporary alert to whitelist it in the Google Cloud Console.
  </action>
  <verify>Check that the OAuth consent screen opens correctly without a 400 redirect_uri_mismatch error in both dev and preview builds.</verify>
  <done>Google Sign-in and Calendar auto-linking works seamlessly without redirect URI errors.</done>
</task>

## Success Criteria
- [ ] Users can log in or sign up using Google.
- [ ] Google Calendar is automatically linked and tokens are saved after Google sign-in.
- [ ] Users signing up via Email/Password are required to verify their email (OTP/Link).
- [ ] The Google Auth Redirect URI resolves correctly in production (no 400 error).
