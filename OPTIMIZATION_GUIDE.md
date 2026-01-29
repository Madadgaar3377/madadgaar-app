# APK Size Optimization Guide

## Current Optimizations Applied

### 1. Removed Unused Dependencies
- ✅ Removed `react-dom` (web-only, not needed for mobile)
- ✅ Removed `react-refresh` (development only)
- ✅ Removed unused scripts and files

### 2. Android Build Optimizations
- ✅ Enabled ProGuard (`enableProguardInReleaseBuilds: true`)
- ✅ Enabled Resource Shrinking (`enableShrinkResourcesInReleaseBuilds: true`)
- ✅ Removed unused permission (`RECORD_AUDIO` - not used)

### 3. Image Optimization Required
**IMPORTANT:** The following images need to be optimized (currently 1.4MB each):
- `assets/home_logo.png` (1.4MB) → Should be < 100KB
- `assets/authlogo.png` (1.4MB) → Should be < 100KB
- `assets/logo_madadgaar.png` (745KB) → Should be < 100KB
- `assets/App_logo.png` (715KB) → Should be < 100KB

**To optimize images:**
1. Use online tools like TinyPNG, ImageOptim, or Squoosh
2. Resize images to appropriate dimensions (max 512x512 for logos)
3. Use WebP format if possible (better compression)
4. Or use PNG with optimized compression

### 4. Additional Optimizations to Apply

#### A. Optimize Images (Manual Step Required)
```bash
# Install image optimization tool
npm install -g sharp-cli

# Optimize images (run from madadgaar-app directory)
sharp -i assets/home_logo.png -o assets/home_logo.png --resize 512 512
sharp -i assets/authlogo.png -o assets/authlogo.png --resize 512 512
sharp -i assets/logo_madadgaar.png -o assets/logo_madadgaar.png --resize 512 512
sharp -i assets/App_logo.png -o assets/App_logo.png --resize 512 512
```

#### B. Remove Unused Assets
Check if all assets in `assets/` folder are actually used:
- `favicon.png` - only for web, can be removed if not needed
- `icon.png` - check if used
- `splash-icon.png` - check if used

#### C. Enable Hermes (Already Enabled)
✅ Hermes is enabled in app.json (`"jsEngine": "hermes"`)

#### D. Build Configuration
The EAS build is configured to:
- Build AAB (App Bundle) instead of APK (smaller size)
- Use production optimizations
- Enable ProGuard and resource shrinking

### 5. Expected Size Reduction

**Before Optimization:**
- APK: ~100+ MB

**After Optimization:**
- AAB: ~20-30 MB (with optimized images)
- APK: ~25-35 MB (if needed)

### 6. Build Commands

```bash
# Build optimized AAB (recommended for Play Store)
npx eas-cli build --platform android --profile production

# The build will automatically:
# - Enable ProGuard
# - Shrink resources
# - Remove unused code
# - Optimize bundle
```

### 7. Verification Steps

After building, check:
1. APK/AAB size should be 20-30 MB
2. App functionality should work correctly
3. Images should load properly (may need to re-optimize if too compressed)

### 8. Further Optimizations (If Still Large)

1. **Code Splitting**: Implement lazy loading for screens
2. **Remove Unused Icons**: Check if all lucide-react-native icons are used
3. **Bundle Analysis**: Use `npx react-native-bundle-visualizer` to find large dependencies
4. **Remove Console Logs**: Use babel plugin to remove console.log in production
5. **Optimize Dependencies**: Consider alternatives for large libraries

### 9. Image Optimization Script

Create a script to optimize all images:

```bash
# Create optimize-images.sh
#!/bin/bash
cd assets
for img in *.png *.jpg *.jpeg; do
  if [ -f "$img" ]; then
    echo "Optimizing $img..."
    # Use your preferred tool here
  fi
done
```

## Notes

- Always test the app after optimization
- Keep original images as backup
- ProGuard may require additional rules if you encounter runtime errors
- Resource shrinking may remove some assets - test thoroughly
