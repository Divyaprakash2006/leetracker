# Auto-Changing Background Setup Guide

## ✅ Unsplash API Integration (Official API)

Your login and signup pages now use the official Unsplash API for high-quality, curated background images that rotate every 10 seconds!

## 🔑 Setup Instructions

### Step 1: Get Your Unsplash API Key (Free)

1. **Create an Unsplash Developer Account**
   - Visit: https://unsplash.com/developers
   - Click "Register as a developer"
   - Sign up or log in

2. **Create a New Application**
   - Go to: https://unsplash.com/oauth/applications
   - Click "New Application"
   - Accept the API Guidelines
   - Fill in application details:
     - **Application name**: "LeetCode Tracker"
     - **Description**: "Background images for authentication pages"
   - Click "Create Application"

3. **Get Your Access Key**
   - You'll see your **Access Key** and **Secret Key**
   - Copy the **Access Key** (starts with something like `abc123xyz...`)

### Step 2: Add API Key to Your Project

1. **Open** `frontend/.env.development`
2. **Replace** `YOUR_UNSPLASH_ACCESS_KEY_HERE` with your actual key:
   ```env
   VITE_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
   ```
3. **Save** the file
4. **Restart** the frontend dev server (it should auto-restart with Vite HMR)

### Step 3: Test It!

1. Navigate to `http://localhost:3002/login`
2. You should see high-quality workspace backgrounds
3. Wait 10 seconds - background will smoothly change
4. Try the signup page - same beautiful backgrounds!

## 🎨 Features

### Current Implementation
- ✅ **16 Curated Photos** - Handpicked professional workspace images
- ✅ **Official Unsplash API** - Better quality and control
- ✅ **10-Second Rotation** - Smooth automatic transitions
- ✅ **Fallback Support** - Uses Source API if no key provided
- ✅ **Image Preloading** - Seamless transitions
- ✅ **Free Tier**: 50 requests/hour (plenty for development)

### Photo Collections
**Workspace Collection**:
- Professional office setups
- Minimal desk arrangements  
- Modern workspace designs
- Tech-focused environments

**Office Collection**:
- Corporate office spaces
- Creative studio setups
- Collaborative workspaces
- Contemporary office designs

## 🎨 Customization Options

### 1. Change Rotation Speed
Edit `LoginPage.tsx` or `SignupPage.tsx`:
```typescript
}, 10000); // Change this number (milliseconds)
// 5000 = 5 seconds
// 10000 = 10 seconds (current)
// 15000 = 15 seconds
```

### 2. Change Transition Speed
Edit inline style:
```typescript
transition: 'background-image 1s ease-in-out'
// Change '1s' to '0.5s' for faster, '2s' for slower
```

### 3. Add Your Own Photo IDs
Edit `unsplashService.ts` and add photo IDs to collections:
```typescript
const PHOTO_COLLECTIONS = {
  workspace: [
    'pFqrYbhIAXs',  // Existing
    'YOUR_PHOTO_ID', // Add new photo IDs here
  ],
};
```

**How to find photo IDs**:
1. Browse https://unsplash.com
2. Find a photo you like
3. Copy the ID from the URL: `unsplash.com/photos/[THIS_IS_THE_ID]`
4. Add it to the array

### 4. Use Random Search Instead
Replace curated IDs with search:
```typescript
// In LoginPage.tsx
import { getRandomPhotos } from '../services/unsplashService';

useEffect(() => {
  const loadBackgrounds = async () => {
    const photos = await getRandomPhotos('workspace', 8);
    if (photos) {
      const urls = photos.map(p => p.urls.regular);
      setBackgroundImages(urls);
    }
  };
  loadBackgrounds();
}, []);
```

## 📊 API Limits & Pricing

### Free Tier (Demo/Development)
- ✅ 50 requests per hour
- ✅ Perfect for development
- ✅ No credit card required

### Production Tier
- 📈 5,000 requests per hour
- 💰 Free for approved apps
- 📝 Apply for production access

**For this app**: Free tier is more than enough since backgrounds are cached!

## 🔧 Troubleshooting

### Images Not Loading
1. **Check API key**: Make sure it's in `.env.development`
2. **Restart server**: `Ctrl+C` then `npm run dev`
3. **Check console**: Open browser DevTools (F12) for errors
4. **Verify key**: Should start with letters/numbers, no quotes

### API Rate Limit Hit
- **Wait 1 hour** for limit reset
- **Or** add more photo IDs to reduce API calls
- Images are cached after first load

### Slow Loading
- ✅ First load downloads images (may take 2-3 seconds)
- ✅ After that, images are cached
- ✅ Preloading ensures smooth transitions

### Want to Use Source API Instead?
If you don't want to set up an API key, the app falls back to Unsplash Source automatically when no key is provided. Just leave the key as `YOUR_UNSPLASH_ACCESS_KEY_HERE`.

## 🌟 Benefits of Official API vs Source

| Feature | Official API ✅ | Source API |
|---------|----------------|------------|
| Specific Photos | ✅ Yes | ❌ Random |
| Consistent Quality | ✅ Yes | ⚠️ Varies |
| Photo Details | ✅ Full metadata | ❌ None |
| Rate Limits | 50/hour | Unlimited |
| Setup Required | Yes (5 min) | No |

## 📝 Current Status

✅ **Unsplash API Service** created with full functionality
✅ **16 curated photos** in rotation
✅ **Both pages updated** (login & signup)
✅ **Fallback support** to Source API
✅ **Environment variable** ready in `.env.development`
⚠️ **Action needed**: Add your Unsplash API key to activate

## 🚀 Next Steps

1. Get your Unsplash API key (5 minutes)
2. Add it to `.env.development`
3. Refresh your browser
4. Enjoy beautiful, high-quality backgrounds! 🎨

### 1. Change Rotation Speed
Edit `LoginPage.tsx` or `SignupPage.tsx`:
```typescript
}, 10000); // Change this number (milliseconds)
// 5000 = 5 seconds
// 10000 = 10 seconds (current)
// 15000 = 15 seconds
// 20000 = 20 seconds
```

### 2. Change Transition Speed
Edit inline style in `LoginPage.tsx` or `SignupPage.tsx`:
```typescript
transition: 'background-image 1s ease-in-out'
// Change '1s' to '0.5s' for faster, '2s' for slower
```

### 3. Change Keywords (Themes)
Edit the `unsplashKeywords` array in `LoginPage.tsx`:
```typescript
const unsplashKeywords = [
  'office-desk',        // Change to your preferred keywords
  'workspace',
  'mountain-landscape', // Try: nature, city, abstract, gradient
  'ocean-view',         // Try: sunset, forest, technology, architecture
  // Add more keywords...
];
```

### 4. Add More Images
Simply add more keywords to the array:
```typescript
const unsplashKeywords = [
  'office-desk',
  'workspace',
  'minimal-office',
  'modern-workspace',
  'tech-workspace',
  'clean-desk',
  'professional-office',
  'creative-workspace',
  'innovation-hub',     // NEW
  'startup-culture',    // NEW
  'team-workspace',     // NEW
  // Keep adding more...
];
```

## Popular Keyword Categories

### Professional/Office
- `office-desk`, `workspace`, `modern-office`, `corporate`, `business`, `professional`

### Technology
- `tech-workspace`, `computer`, `coding`, `developer`, `technology`, `digital`

### Minimal/Clean
- `minimal`, `minimalist`, `clean`, `simple`, `white-space`, `modern`

### Nature
- `mountain`, `ocean`, `forest`, `sunset`, `landscape`, `nature`

### Abstract/Artistic
- `abstract`, `gradient`, `geometric`, `pattern`, `colorful`, `artistic`

### Urban/Architecture
- `city`, `building`, `architecture`, `urban`, `skyline`, `contemporary`

## Advanced Configuration

### Different Backgrounds for Each Page
**Login Page**: Professional office themes (already set)
**Signup Page**: Creative workspace themes (already set)

You can customize each page independently by editing their respective files.

### Cache Busting
The `&sig={number}` parameter ensures unique images. Change numbers for fresh images:
```typescript
`https://source.unsplash.com/1920x1080/?${keyword}&sig=${index + 200}`
// Changing 200 to 300, 400, etc. will fetch different images
```

## Testing

1. **Frontend is running on port 3002**
2. Navigate to: `http://localhost:3002/login`
3. Wait 10 seconds to see background change
4. Click "Sign Up" to see different backgrounds on signup page

## Performance Optimization

✅ **Image Preloading**: Next image loads in advance for smooth transitions
✅ **Browser Caching**: Unsplash images are cached automatically
✅ **Optimized Size**: 1920x1080 resolution balances quality and speed

## Troubleshooting

### Images Not Loading
1. Check internet connection (Unsplash requires internet)
2. Check browser console for errors (F12)
3. Try different keywords if some don't work
4. Clear browser cache (Ctrl + Shift + R)

### Slow Loading
1. Images are fetched from Unsplash servers
2. First load may be slower, then cached
3. Preloading helps with subsequent images
4. Consider reducing number of keywords for faster rotation

### Want Specific Images?
Use Unsplash photo IDs for specific images:
```typescript
const backgroundImages = [
  'https://source.unsplash.com/{photo-id}/1920x1080',
  // Browse unsplash.com, get photo ID from URL
];
```

## Current Status

✅ Unsplash API integrated (no key required)
✅ 8 backgrounds on login page
✅ 8 different backgrounds on signup page  
✅ 10-second auto-rotation
✅ 1-second smooth transitions
✅ Image preloading enabled
✅ No manual downloads required
✅ Free to use, no attribution required

## License & Credits

**Unsplash Source API**:
- Free to use commercially
- No attribution required
- High-quality curated photos
- Visit: https://source.unsplash.com

All images are provided by Unsplash photographers and comply with the Unsplash License.
