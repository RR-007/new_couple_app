# Google Play Store Setup Guide

> Detailed step-by-step instructions for Phase 16 deployment.

---

## 1. Create the App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app** (top right)
3. **App name:** `UsQuest`
4. **Default language:** `English (United States)`
5. **App or game:** `App`
6. **Free or paid:** `Free`
7. Check declarations and click **Create app**

---

## 2. Set up your app (Dashboard)

Complete the "Set up your app" section:

### Privacy Policy
- **URL:** `https://rr-007.github.io/new_couple_app/privacy-policy.html`

### App Access
- Select: **All functionality is available without special access**

### Ads
- Select: **No, my app does not contain ads**

### Content Rating
- Fill out the questionnaire:
  - **Category:** Social / Communication
  - Violence/Sex/Language/etc: **No**

### Target Audience and Content
- **Age:** 18 and over
- **Appeal to children:** No

### News Apps
- Select **No**

### COVID-19 Contact Tracing
- Select **My app is not a publicly available COVID-19 app**

### Data Safety
- **Collect/share data?** Yes
- **Encrypted in transit?** Yes
- **Can users delete data?** Yes
- **Delete account URL:** `https://rr-007.github.io/new_couple_app/delete-account.html`

**Add these data types:**

| Data Type | Category | Collected | Shared |
|-----------|----------|-----------|--------|
| Email | Authentication | Required | Not Shared |
| Photos | Cloudinary | Optional | Not Shared |
| App Interactions | Firestore | Required | Not Shared |

### Government Apps
- Select **No**

### Financial Features
- Select **My app doesn't provide any financial features**

---

## 3. Store Settings & Listing

### Store Settings
- **Category:** Social
- **Contact email:** `rohitrajeev02@gmail.com`

### Main Store Listing

#### Short Description
```
The private space for couples and best friends to share lists, photos & quests.
```

#### Full Description
```
Welcome to UsQuest — the ultimate private space designed entirely for you and your favorite person. Whether it's your partner, your best friend, or your sibling, UsQuest gives you a shared, ad-free world where your memories, inside jokes, and daily plans live securely.

Stop losing track of shared ideas in messy chat threads. UsQuest brings everything that matters to your relationship into one beautifully organized app.

✨ Key Features:
• Shared Dashboard & Google Calendar Sync: See exactly what's happening in both your lives at a glance. Sync your Google Calendars privately so you never double-book or forget a date night again.
• Love Notes & Diary: Leave sweet surprises, vent about your day, or journal together in a secure, shared diary.
• Pic of the Day: A dedicated space to share one special photo every single day. Look back at your memories without them getting lost in a camera roll.
• Flashbang Bingo: Challenge each other to fun, spontaneous bingo games! Build inside jokes and keep things playful.
• Interactive Quests (Coming Soon!): Send each other fun missions, tasks, and challenges.

Why UsQuest?
Social media is for the world. Chat apps are for everyone. UsQuest is just for us. Create your secure, private hub today and start tracking your shared life together!
```

#### Assets Required

| Asset | Specs |
|-------|-------|
| **App Icon** | 512x512 PNG/JPEG — Upload `UsQuest.jpeg` |
| **Feature Graphic** | 1024x500 PNG/JPEG |
| **Phone Screenshots** | 2-8 screenshots |

---

## 4. Build & Upload APK

Once the store listing is complete:

1. Go to https://github.com/RR-007/new_couple_app/actions/workflows/build.yml
2. Click **Run workflow**
3. Check **Build Android APK**
4. Select Build Profile: **preview** (or production)
5. Click **Run workflow**
6. Wait for build to complete on expo.dev
7. Download the APK/AAB
8. Upload to Google Play Console (Production or Internal Testing)

---

*Last updated: Phase 16 Deployment*
