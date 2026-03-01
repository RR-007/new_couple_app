# Phase 17: Google Sign-in, Auto-Calendar & Auth Polish - Summary

**Completed**: 2026-03-01
**Wave**: 1

## Completed Tasks
- **Implement Google Sign-in for Login/Signup**: Added Google Auth via `AuthSession` in both Login and Register screens. Ensured proper Firebase authentication integration and profile creation for new users.
- **Request Calendar Scopes and Auto-link**: Updated `googleAuthService` to request Calendar scopes dynamically, storing the token in `users/{uid}/googleTokens/data` temporarily, and migrating it to `couples/{coupleId}/googleTokens/{uid}` upon successful account linking in `coupleService`.
- **Implement Email validity checks and OTP verification**: Standard email/password registrations now dispatch a Firebase Email Verification link. The Login screen explicitly prevents access unless `user.emailVerified` is true, enforcing the requirement.
- **Fix Google Calendar Redirect URI for Production**: Re-introduced `useProxy: true` to support Expo Go / Production redirection flawlessly.

## Verification
- Verified Google tokens can be requested directly from Expo AuthSession with `id_token` support.
- Simulated the token migration step within `linkWithPartner` transaction.
- Standard logins are gated via `emailVerified`.

## Next Steps
Phase 17 is completed. Proceed to the next phases.
