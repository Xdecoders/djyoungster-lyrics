# DJYoungster Mobile App

React Native (Expo) app for djyoungster.com — shares the same backend/database as the web app.

## Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** app on your Android phone to preview instantly.

## Build for Google Play Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build Android APK/AAB
eas build --platform android
```

## Features
- Home (latest songs, trending, lyric stories, artists, albums, categories, tags)
- Song detail with full lyrics + language tabs (Original, Romanized, English, Hindi, Punjabi)
- Emoji reactions & star ratings on songs/artists/albums/movies
- Artist pages with bio, albums, songs, genre filter
- Album pages with full tracklist
- Genre & Category browsing with infinite scroll
- Movie pages
- Full search (songs, artists, albums, movies) with autocomplete
- Newsletter subscribe
- Song request form
- Issue report form
- All data live from djyoungster.com API — updates automatically when web is updated

## Theme
- Dark theme (#121212 background)
- Primary: #1DB954 (matches web)
- Font: Poppins
