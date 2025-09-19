# Firestore Rules Troubleshooting Guide

## 🚨 Dashboard Not Showing Tracks Issue

### Problem
The dashboard shows "No tracks yet" even though tracks have been created and exported successfully.

### Root Cause
The Firestore security rules were not properly configured to allow querying the tracks collection.

### Solution

#### 1. Deploy the Fixed Rules
Run the deployment script to update your Firestore rules:

```bash
./deploy-firestore-rules.sh
```

Or manually deploy using Firebase CLI:

```bash
# Login to Firebase (if not already logged in)
firebase login

# Deploy only the Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

#### 2. Verify Rules Deployment
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Verify the rules match the updated `firestore.rules` file

#### 3. Test the Dashboard
1. Create a new track in the studio
2. Export it to save to Firestore
3. Navigate to the dashboard
4. Check browser console for detailed logs

### Updated Firestore Rules

The corrected rules now properly handle:
- ✅ User authentication
- ✅ Track creation with proper user ID validation
- ✅ Track reading with user ID filtering
- ✅ Query permissions for listing user tracks

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own tracks
    match /tracks/{trackId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }

    // Users can only access their own user profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Debugging Steps

#### 1. Check Browser Console
Look for these log messages:
- `📊 Dashboard: Setting up tracks listener`
- `📊 Dashboard: Creating Firestore query`
- `📊 Dashboard: Firestore snapshot received: X user tracks`
- `📊 Dashboard: User tracks: [array of tracks]`

#### 2. Check Firebase Console
1. Go to Firebase Console → Firestore Database
2. Check if tracks exist in the "tracks" collection
3. Verify each track has a `userId` field matching your user ID

#### 3. Check Network Tab
1. Open browser DevTools → Network tab
2. Navigate to dashboard
3. Look for Firestore API calls
4. Check for any 403 (Forbidden) errors

### Common Issues

#### Issue 1: Rules Not Deployed
**Symptoms**: Dashboard shows 0 tracks, console shows 403 errors
**Solution**: Run `firebase deploy --only firestore:rules`

#### Issue 2: Wrong User ID
**Symptoms**: Tracks exist but don't show for current user
**Solution**: Check that `userId` in tracks matches `currentUser.uid`

#### Issue 3: Missing Indexes
**Symptoms**: Query fails with "index not found" error
**Solution**: Run `firebase deploy --only firestore:indexes`

#### Issue 4: Authentication Issues
**Symptoms**: User not authenticated
**Solution**: Check Firebase Auth configuration and user login status

### Testing Commands

```bash
# Check Firebase CLI status
firebase projects:list

# Check current project
firebase use

# Deploy rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# View logs
firebase functions:log
```

### Prevention

1. **Always deploy rules after changes**
2. **Test in Firebase Console Rules Playground**
3. **Use proper error handling in queries**
4. **Add comprehensive logging for debugging**

### Success Indicators

✅ Dashboard loads without errors
✅ Console shows "X user tracks" in logs
✅ Tracks appear in dashboard grid
✅ No 403 errors in Network tab
✅ Firestore rules show as deployed in console
