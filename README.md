# Chordara - AI-Powered Music Production App

An AI-powered in-browser music production application that lets users describe music in natural language, generate patterns with AI, play them in the browser, and export as audio files.

## Features

- 🎵 **AI Music Generation**: Describe your music in natural language and let AI create the perfect soundtrack
- 🎹 **Real-time Playback**: Hear your creations instantly with high-quality synthesizers and drum machines
- 📱 **Browser-Based**: No downloads required. Create music anywhere, anytime, on any device
- 💾 **Export & Save**: Download your tracks as MP3 or WAV files and save them to your personal library
- 🔐 **User Authentication**: Secure login with Google and email authentication
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

- **Frontend**: React 19, Vite, Plain CSS
- **Backend**: Firebase (Authentication, Firestore)
- **File Storage**: Cloudinary (Audio files)
- **Audio**: Tone.js for music synthesis and playback
- **AI**: OpenRouter API with Claude 3.5 Sonnet
- **Pattern Generation**: Custom algorithms for melody, bass, and drum patterns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install firebase tone brain.js react-router-dom
```

Note: If you encounter issues with Brain.js native dependencies, install with:
```bash
npm install brain.js --ignore-scripts
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp example.env .env
   ```

2. Fill in your environment variables in `.env`:

   **Firebase Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Google + Email/Password)
   - Enable Firestore Database
   - Get your config from Project Settings > General > Your apps

   **Cloudinary Setup:**
   - Go to [Cloudinary.com](https://cloudinary.com)
   - Create a free account
   - Get your cloud name, API key, and API secret
   - Create an unsigned upload preset (see CLOUDINARY_SETUP.md)

   **OpenRouter Setup:**
   - Go to [OpenRouter](https://openrouter.ai/)
   - Create an account and get your API key
   - Add credits to your account

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_firebase_app_id_here

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
   VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   VITE_CLOUDINARY_UPLOAD_PRESET=chordara_audio_upload

   # OpenRouter API Configuration
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### 3. Firebase Security Rules

Set up your Firestore security rules:

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

### 4. Cloudinary Setup

Follow the detailed setup guide in `CLOUDINARY_SETUP.md` to:
1. Create a Cloudinary account
2. Get your credentials
3. Create an upload preset
4. Update your environment variables

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Describe Your Music**: Enter a natural language description of the music you want to create
3. **Generate**: Click "Generate Music" to let AI create patterns based on your description
4. **Play**: Use the music player to listen to your generated track
5. **Export**: Record and download your track as an audio file
6. **Save**: Your tracks are automatically saved to your personal library

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Dashboard.jsx
│   ├── LandingPage.jsx
│   ├── MusicPlayer.jsx
│   └── MusicStudio.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   ├── brainService.js
│   ├── firebase.js
│   ├── openRouter.js
│   └── toneService.js
├── App.jsx
├── App.css
└── main.jsx
```

## Key Features Implementation

### AI Music Generation
- Uses OpenRouter API with Claude 3.5 Sonnet to convert natural language descriptions into structured music instructions
- Generates tempo, key, style, instruments, mood, chord progressions, and more

### Pattern Generation
- Custom algorithms generate melodies, bass lines, and drum patterns based on AI instructions
- Supports various musical styles and patterns

### Audio Playback
- Tone.js provides high-quality synthesizers and drum machines
- Real-time playback with visual waveform representation
- Support for multiple instruments: synth, bass, piano, drums

### Export Functionality
- Tone.js Recorder captures audio output
- Automatic compression to keep files under 1MB
- Firebase Storage integration for cloud storage
- Download as MP3/WAV files

## Limitations

- Maximum track duration: 5 minutes
- Maximum file size: 1MB (compressed)
- Requires internet connection for AI generation
- Audio quality depends on browser capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository.