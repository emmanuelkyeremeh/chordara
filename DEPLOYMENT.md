# Chordara - AI Music Generator

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Firebase project set up
- Cloudinary account
- Vercel account (for deployment)

### Environment Setup

1. **Copy environment variables:**
   ```bash
   cp example.env .env
   ```

2. **Fill in your environment variables in `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

### Deployment to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from your `.env` file

### SEO Optimization Features

✅ **Meta Tags**: Comprehensive meta tags for search engines
✅ **Open Graph**: Facebook and social media sharing
✅ **Twitter Cards**: Twitter sharing optimization
✅ **Structured Data**: JSON-LD schema markup
✅ **Sitemap**: XML sitemap for search engines
✅ **Robots.txt**: Search engine crawling instructions
✅ **Favicon**: Custom favicon and app icons
✅ **Web App Manifest**: PWA capabilities

### Performance Features

✅ **Route Optimization**: Vercel.json for proper routing
✅ **Caching Headers**: Optimized caching for static assets
✅ **Preconnect**: Preconnect to external domains
✅ **Compression**: Built-in asset compression

### Security Features

✅ **Content Security**: X-Content-Type-Options
✅ **Frame Protection**: X-Frame-Options
✅ **XSS Protection**: X-XSS-Protection headers

## 🎵 Features

- **AI Music Generation**: Create unique songs with AI
- **Multiple Styles**: Electronic, rock, jazz, pop, classical, ambient
- **Real-time Playback**: Listen to generated music immediately
- **Export Options**: Download as MP3, WAV, or OGG
- **User Dashboard**: Manage your music library
- **Responsive Design**: Works on all devices

## 🔧 Troubleshooting

### Dashboard Not Showing Tracks
The dashboard now includes enhanced debugging. Check the browser console for detailed logs about:
- Firestore query results
- User authentication status
- Track filtering process

### Music Generation Issues
- Ensure OpenRouter API key is valid
- Check browser console for generation logs
- Verify Tone.js audio context initialization

### Deployment Issues
- Verify all environment variables are set in Vercel
- Check Firebase security rules are deployed
- Ensure Cloudinary upload presets are configured

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- App manifest for installation
- Service worker support
- Offline capabilities
- Mobile-optimized interface

## 🎯 SEO Ranking Factors

The app is optimized for search engines with:
- Fast loading times
- Mobile-friendly design
- Rich meta descriptions
- Structured data markup
- Social media optimization
- Clean URL structure
