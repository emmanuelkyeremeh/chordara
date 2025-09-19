# Chordara Troubleshooting Guide

## Common Issues and Solutions

### 1. Tracks Not Appearing in Dashboard

**Symptoms:**
- Created tracks don't show up in the dashboard
- Console shows `ERR_BLOCKED_BY_CLIENT` errors
- "No tracks yet" message persists after creating tracks

**Causes:**
- Ad blockers blocking Firestore connections
- Browser extensions interfering with real-time listeners
- Network connectivity issues
- Firestore security rules not deployed

**Solutions:**

#### A. Disable Ad Blockers
1. **uBlock Origin**: Click the extension icon → Turn off for this site
2. **AdBlock Plus**: Click the extension icon → Disable on this site
3. **AdGuard**: Right-click → AdGuard → Disable protection on this site
4. **Brave Browser**: Click the shield icon → Turn off shields for this site

#### B. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors like:
   - `ERR_BLOCKED_BY_CLIENT`
   - `FirebaseError: Missing or insufficient permissions`
   - `Failed to load resource`

#### C. Deploy Firestore Rules
```bash
cd chordara
firebase deploy --only firestore:rules
```

#### D. Manual Refresh
- Click the "🔄 Refresh" button in the dashboard
- Or refresh the page manually (F5)

### 2. Auto-Save Not Working

**Symptoms:**
- Tracks are generated but not automatically saved
- No "Track automatically saved" message appears

**Solutions:**

#### A. Check Console Logs
Look for these messages in the console:
- "Saving track to Firestore: [track data]"
- "Track saved with ID: [document ID]"

#### B. Verify Cloudinary Setup
1. Check your `.env` file has correct Cloudinary credentials
2. Ensure upload preset is set to "Unsigned"
3. Verify Cloudinary account has sufficient credits

#### C. Check Firebase Authentication
- Ensure you're logged in
- Check that `currentUser` is not null in console

### 3. Audio Playback Issues

**Symptoms:**
- No sound when playing tracks
- "AudioContext was not allowed to start" warnings

**Solutions:**

#### A. User Interaction Required
- Click the play button to start audio context
- This is a browser security requirement

#### B. Check Browser Audio Settings
- Ensure browser allows audio playback
- Check system volume levels

### 4. Export/Download Issues

**Symptoms:**
- Export button doesn't work
- Files don't download properly

**Solutions:**

#### A. Check Cloudinary Upload
- Verify files are being uploaded successfully
- Check Cloudinary dashboard for uploaded files

#### B. Check File Size
- Ensure files are under 1MB after compression
- Check console for compression errors

### 5. Development vs Production Issues

**Symptoms:**
- Works in development but not in production
- Different behavior between environments

**Solutions:**

#### A. Environment Variables
- Ensure all environment variables are set in production
- Check that `.env` file is properly configured

#### B. Firebase Project
- Verify you're using the correct Firebase project
- Check project ID matches in all configurations

### 6. Debugging Steps

#### A. Enable Console Logging
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for these debug messages:
   - "Firestore snapshot received: X tracks"
   - "Saving track to Firestore: [data]"
   - "Track saved with ID: [id]"

#### B. Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Look for failed requests to:
   - `firestore.googleapis.com`
   - `api.cloudinary.com`

#### C. Test Firestore Connection
```javascript
// Run this in browser console
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/services/firebase';

getDocs(collection(db, 'tracks')).then(snapshot => {
  console.log('Tracks in database:', snapshot.docs.length);
});
```

### 7. Quick Fixes

#### A. Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies

#### B. Try Different Browser
- Test in Chrome, Firefox, Safari, or Edge
- Use incognito/private mode

#### C. Check Internet Connection
- Ensure stable internet connection
- Try disabling VPN if using one

### 8. Still Having Issues?

If none of the above solutions work:

1. **Check the console** for specific error messages
2. **Verify Firebase setup** is correct
3. **Test with a simple track** (short duration)
4. **Check Cloudinary dashboard** for uploaded files
5. **Verify Firestore rules** are deployed correctly

### 9. Contact Support

If you continue to have issues, please provide:
- Browser and version
- Console error messages
- Steps to reproduce the issue
- Screenshots of the problem
