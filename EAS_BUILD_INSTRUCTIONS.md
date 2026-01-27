# 🚀 EAS Build & Upload Instructions

## Prerequisites

1. ✅ EAS CLI is available (via `npx eas-cli`)
2. ✅ Logged in as: `madadgaar_expert`
3. ✅ Project ID: `0af1cdcc-1aeb-49db-9181-bf996aa2a6cc`
4. ✅ Project slug: `madadgaar-app`

## Quick Start

### Option 1: Run the Setup Script
```bash
cd /home/abubakkar-sajid/Downloads/agent+backend/madadgaar-app
chmod +x eas-build-setup.sh
./eas-build-setup.sh
```

### Option 2: Manual Commands

#### Step 1: Configure Android Credentials
```bash
cd /home/abubakkar-sajid/Downloads/agent+backend/madadgaar-app
npx eas-cli credentials --platform android
```
- Select `production` profile
- Choose to generate a new keystore (if you don't have one)
- Follow the prompts to complete setup

#### Step 2: Build Android APK
```bash
npx eas-cli build --platform android --profile production
```

#### Step 3: Build Android AAB (for Play Store)
```bash
npx eas-cli build --platform android --profile production-aab
```

#### Step 4: Build iOS (optional)
```bash
npx eas-cli build --platform ios --profile production
```

## Build Profiles

The app has the following build profiles configured in `eas.json`:

- **development**: Development client with internal distribution
- **preview**: Preview build (APK for Android)
- **production**: Production APK for Android
- **production-aab**: Production AAB (App Bundle) for Google Play Store

## Submitting to App Stores

### Google Play Store
```bash
# After building AAB
npx eas-cli submit --platform android
```

### Apple App Store
```bash
# After building iOS
npx eas-cli submit --platform ios
```

## Monitoring Builds

- Check build status: https://expo.dev/accounts/madadgaar_expert/projects/madadgaar-app/builds
- Builds typically take 10-20 minutes
- You'll receive email notifications when builds complete

## Important Notes

1. **Android Package Name**: Currently set to `com.anonymous.madadgaar`
   - Consider changing to `com.madadgaar.app` for production
   - Update in `app.json` → `android.package`

2. **App Version**: Currently `1.0.1`
   - Update version in `app.json` before each release

3. **Keystore**: 
   - EAS will generate and securely store your keystore
   - Keep your credentials safe - you'll need them for updates

4. **Build Time**: 
   - First build: ~15-20 minutes
   - Subsequent builds: ~10-15 minutes

## Troubleshooting

### Build Fails
- Check build logs at: https://expo.dev
- Ensure all dependencies are installed: `npm install`
- Verify app.json configuration is valid

### Credentials Issues
- Run: `npx eas-cli credentials --platform android`
- Choose to regenerate if needed

### Project Link Issues
- Verify project ID in `app.json`: `0af1cdcc-1aeb-49db-9181-bf996aa2a6cc`
- Check slug matches: `madadgaar-app`

## Next Steps After Build

1. ✅ Download the APK/AAB from EAS dashboard
2. ✅ Test the build on a device
3. ✅ Submit to Google Play Store (for AAB)
4. ✅ Submit to Apple App Store (for iOS)
5. ✅ Update app version for next release

---

**Current Configuration:**
- Project ID: `0af1cdcc-1aeb-49db-9181-bf996aa2a6cc`
- Slug: `madadgaar-app`
- Version: `1.0.1`
- Package: `com.anonymous.madadgaar`
