# Deployment Guide for Netlify

## What Changed

Your backend has been converted to **Netlify Functions** so everything runs on Netlify!

### New Files Created:
- `netlify/functions/upload.js` - Handles image uploads
- `netlify.toml` - Netlify configuration
- `.gitignore` - Git ignore file

### Modified Files:
- `script.js` - Updated API base URL to work with Netlify Functions

## How to Deploy

### Option 1: Connect to Git (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: convert backend to Netlify Functions"
   git push origin main
   ```

2. **In Netlify Dashboard:**
   - Go to your site: https://ugcn8n.netlify.app
   - It will automatically detect the changes and redeploy
   - Wait for deployment to complete (usually 1-2 minutes)

### Option 2: Manual Deploy

1. **Build locally (if needed):**
   ```bash
   npm install
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

## How It Works

- **Before:** Express server needed separate hosting
- **After:** Netlify Functions handle all API requests

### API Routes:
- `/api/upload` → `/.netlify/functions/upload`

The `netlify.toml` file automatically redirects `/api/*` to Netlify Functions.

## Important Notes

### Image Storage Limitation
⚠️ **Important:** Netlify Functions return images as **base64 data URLs** because Netlify Functions are stateless and cannot store files permanently.

For production, you should integrate with cloud storage:
- **Cloudinary** (recommended for images)
- **AWS S3**
- **Google Cloud Storage**
- **Uploadcare**

### Current Behavior:
Images are converted to base64 and embedded directly in the response. This works but:
- ✅ Pros: Simple, no external dependencies
- ❌ Cons: Larger payload size, images lost after page refresh

### To Add Cloud Storage (Cloudinary Example):

1. Install Cloudinary:
   ```bash
   npm install cloudinary
   ```

2. Update `netlify/functions/upload.js`:
   ```javascript
   const cloudinary = require('cloudinary').v2;

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   ```

3. Add environment variables in Netlify Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Testing

After deployment, test the upload functionality:
1. Visit https://ugcn8n.netlify.app
2. Upload an image
3. Check browser console for upload status
4. Submit the form

## Troubleshooting

### 404 Error on /api/upload
- Check `netlify.toml` is in root directory
- Verify `netlify/functions/upload.js` exists
- Check Netlify deployment logs

### Function Timeout
- Netlify Functions have a 10-second timeout (26 seconds for Pro)
- For large files, use background functions or external storage

### CORS Issues
- Functions automatically handle CORS
- If issues persist, add CORS headers in function response

## Next Steps

1. ✅ Deploy to Netlify
2. ✅ Test image upload
3. 🔄 (Optional) Integrate cloud storage for persistence
4. 🔄 (Optional) Add image optimization

Need help? Check Netlify Functions docs: https://docs.netlify.com/functions/overview/
