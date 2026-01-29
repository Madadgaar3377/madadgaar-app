#!/usr/bin/env node

/**
 * Script to sync version from package.json to app.json
 * Run this script after updating version in package.json:
 * node scripts/sync-version.js
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const appJsonPath = path.join(__dirname, '../app.json');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version) {
    console.error('❌ No version found in package.json');
    process.exit(1);
  }

  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // Update version in app.json
  if (appJson.expo) {
    appJson.expo.version = version;
    
    // Also update Android versionCode if needed (increment it)
    if (appJson.expo.android) {
      const currentVersionCode = appJson.expo.android.versionCode || 1;
      // You can auto-increment versionCode here if needed
      // appJson.expo.android.versionCode = currentVersionCode + 1;
    }
  }

  // Write updated app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');

  console.log(`✅ Successfully synced version ${version} from package.json to app.json`);
} catch (error) {
  console.error('❌ Error syncing version:', error.message);
  process.exit(1);
}
