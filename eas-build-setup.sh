#!/bin/bash

# EAS Build Setup Script for Madadgaar App
# Run this script to build and submit your app

echo "🚀 Setting up EAS Build for Madadgaar App"
echo "=========================================="

# Navigate to app directory
cd "$(dirname "$0")"

# Check if logged in
echo "📋 Checking EAS login status..."
npx eas-cli whoami

# Verify project is linked
echo ""
echo "🔗 Verifying project link..."
npx eas-cli project:info

# Configure Android credentials (interactive)
echo ""
echo "🔐 Configuring Android credentials..."
echo "   Select 'production' profile when prompted"
echo "   Choose to generate a new keystore if you don't have one"
npx eas-cli credentials --platform android

# Build for Android (Production APK)
echo ""
echo "📦 Building Android APK (Production)..."
echo "   This will take several minutes..."
npx eas-cli build --platform android --profile production

# Optional: Build AAB for Play Store
echo ""
read -p "Do you want to build an AAB (App Bundle) for Google Play Store? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📦 Building Android AAB (Production)..."
    npx eas-cli build --platform android --profile production-aab
fi

# Optional: Build for iOS
echo ""
read -p "Do you want to build for iOS? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📦 Building iOS app..."
    npx eas-cli build --platform ios --profile production
fi

echo ""
echo "✅ Build process complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Wait for builds to complete (check status at https://expo.dev)"
echo "   2. Download builds from EAS dashboard"
echo "   3. Submit to app stores using: npx eas-cli submit --platform android"
echo "   4. Or submit manually through Google Play Console / App Store Connect"
