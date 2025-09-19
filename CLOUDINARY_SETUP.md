# Cloudinary Setup Guide

## 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Cloudinary Credentials

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy the following values:
   - **Cloud Name** (found in the dashboard)
   - **API Key** (found in the dashboard)
   - **API Secret** (found in the dashboard)

## 3. Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `chordara_audio_upload`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `chordara`
   - **Resource Type**: `Auto`
   - **Format**: `mp3`
   - **Quality**: `auto:good`
   - **Transformation**: `q_auto,f_auto`
5. Click **Save**

## 4. Update Your Environment Variables

Copy your credentials to your `.env` file:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=chordara_audio_upload
```

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Create a track and try to export it
3. Check your Cloudinary dashboard to see if the file was uploaded

## Benefits of Using Cloudinary

- ✅ **Easy Setup**: No complex configuration needed
- ✅ **Automatic Compression**: Built-in audio compression
- ✅ **CDN**: Fast global delivery
- ✅ **Free Tier**: 25GB storage, 25GB bandwidth per month
- ✅ **Transformations**: Automatic format optimization
- ✅ **Security**: Secure uploads with presets

## Troubleshooting

### Upload Fails
- Check that your upload preset is set to "Unsigned"
- Verify your cloud name and upload preset name
- Make sure the file size is under 100MB (Cloudinary free tier limit)

### File Not Appearing
- Check the folder structure in your Cloudinary dashboard
- Verify the upload preset configuration
- Check browser console for error messages

### Audio Quality Issues
- Adjust the quality setting in your upload preset
- Modify the compression settings in `cloudinary.js`
