# Version Sync Script

## Overview
This script automatically syncs the version from `package.json` to `app.json` to ensure consistency across the project.

## Usage

### Manual Sync
After updating the version in `package.json`, run:
```bash
npm run sync-version
```

### Automatic Sync
The version is automatically synced when you run:
```bash
npm run prebuild
```

Or it runs automatically before builds via the `prebuild` hook.

## How It Works

1. Reads the `version` field from `package.json`
2. Updates the `version` field in `app.json` (under `expo.version`)
3. The app displays this version in the Profile screen using `expo-constants`

## Profile Screen Display

The version is displayed at the bottom of the Profile screen using:
```typescript
Constants.expoConfig?.version || Constants.manifest?.version || '1.0.2'
```

## Notes

- Always update the version in `package.json` first
- Run `npm run sync-version` after updating the version
- The version in `app.json` is what gets used by Expo/React Native
- The profile screen automatically displays the version from `app.json`
