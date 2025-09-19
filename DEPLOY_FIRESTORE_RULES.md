# Deploy Firestore Security Rules

## Quick Fix for Permission Errors

If you're getting "Missing or insufficient permissions" errors when fetching tracks, you need to deploy the updated Firestore security rules.

### Method 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Navigate to your project directory**:
   ```bash
   cd chordara
   ```

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Method 2: Using Firebase Console (Web)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules`
5. Click **Publish**

### Method 3: Using Firebase CLI with Project Selection

If you have multiple Firebase projects:

1. **List your projects**:
   ```bash
   firebase projects:list
   ```

2. **Set the active project**:
   ```bash
   firebase use your-project-id
   ```

3. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What the Rules Do

The updated rules allow:
- ✅ **Authenticated users** to read/write their own tracks
- ✅ **Authenticated users** to create new tracks (with their own userId)
- ✅ **Authenticated users** to list their own tracks
- ❌ **Unauthenticated users** cannot access any data
- ❌ **Users cannot access other users' tracks**

## Testing the Rules

After deploying, test by:
1. Sign in to your app
2. Generate a track
3. Check if it appears in the Dashboard
4. Try accessing the app without signing in (should be blocked)

## Troubleshooting

### Still Getting Permission Errors?

1. **Check your project ID** in `.env` matches your Firebase project
2. **Verify authentication** is working (check browser console)
3. **Clear browser cache** and try again
4. **Check Firebase Console** for any rule deployment errors

### Rule Deployment Failed?

1. **Check syntax** in `firestore.rules`
2. **Verify Firebase CLI** is logged in
3. **Check project permissions** in Firebase Console
4. **Try deploying from Firebase Console** instead

## Security Notes

- These rules are secure and follow Firebase best practices
- Users can only access their own data
- No public access to any collections
- All operations require authentication
