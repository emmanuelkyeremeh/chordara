# Chordara Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install firebase tone brain.js @tonejs/recorder
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Firebase and OpenRouter credentials.

3. **Run the Application**
   ```bash
   npm run dev
   ```

## Required Services Setup

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google + Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Get your config from Project Settings > General > Your apps

### OpenRouter Setup
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account
3. Get your API key
4. Add credits to your account

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tracks/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tracks/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features Ready to Use

✅ Landing page with modern design
✅ User authentication (Google + Email)
✅ Dashboard for saved tracks
✅ AI music generation with OpenRouter
✅ Pattern generation with custom algorithms
✅ Real-time audio playback with Tone.js
✅ Waveform visualization
✅ Audio export and compression
✅ Firebase Storage integration
✅ Responsive design

## Next Steps

1. Run the setup commands above
2. Configure your environment variables
3. Set up Firebase security rules
4. Start creating music!
