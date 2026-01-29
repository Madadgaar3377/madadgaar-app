#!/bin/bash

# Image Optimization Script
# This script optimizes images in the assets folder to reduce APK size

echo "🖼️  Starting image optimization..."

cd "$(dirname "$0")/.." || exit

# Check if required tools are available
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing dependencies..."
    echo "Please install ImageMagick: sudo apt-get install imagemagick"
    echo "Or use online tools like TinyPNG to optimize images manually"
    exit 1
fi

# Create backup directory
mkdir -p assets/backup
cp assets/*.png assets/backup/ 2>/dev/null || true
cp assets/*.jpg assets/backup/ 2>/dev/null || true
cp assets/*.jpeg assets/backup/ 2>/dev/null || true

echo "✅ Backups created in assets/backup/"

# Optimize main logo images (resize and compress)
echo "📦 Optimizing logo images..."

# Optimize App_logo.png (should be max 512x512 for app icon)
if [ -f "assets/App_logo.png" ]; then
    echo "  - Optimizing App_logo.png..."
    convert "assets/App_logo.png" -resize 512x512 -quality 85 -strip "assets/App_logo.png"
fi

# Optimize home_logo.png
if [ -f "assets/home_logo.png" ]; then
    echo "  - Optimizing home_logo.png..."
    convert "assets/home_logo.png" -resize 512x512 -quality 85 -strip "assets/home_logo.png"
fi

# Optimize authlogo.png
if [ -f "assets/authlogo.png" ]; then
    echo "  - Optimizing authlogo.png..."
    convert "assets/authlogo.png" -resize 512x512 -quality 85 -strip "assets/authlogo.png"
fi

# Optimize logo_madadgaar.png
if [ -f "assets/logo_madadgaar.png" ]; then
    echo "  - Optimizing logo_madadgaar.png..."
    convert "assets/logo_madadgaar.png" -resize 512x512 -quality 85 -strip "assets/logo_madadgaar.png"
fi

# Optimize icon.png
if [ -f "assets/icon.png" ]; then
    echo "  - Optimizing icon.png..."
    convert "assets/icon.png" -resize 192x192 -quality 90 -strip "assets/icon.png"
fi

# Optimize adaptive-icon.png
if [ -f "assets/adaptive-icon.png" ]; then
    echo "  - Optimizing adaptive-icon.png..."
    convert "assets/adaptive-icon.png" -resize 1024x1024 -quality 90 -strip "assets/adaptive-icon.png"
fi

# Optimize splash-icon.png
if [ -f "assets/splash-icon.png" ]; then
    echo "  - Optimizing splash-icon.png..."
    convert "assets/splash-icon.png" -resize 512x512 -quality 85 -strip "assets/splash-icon.png"
fi

# Optimize onboarding images
if [ -d "assets/onboarding screens images" ]; then
    echo "📦 Optimizing onboarding images..."
    for img in "assets/onboarding screens images"/*.{png,jpg,jpeg}; do
        if [ -f "$img" ]; then
            echo "  - Optimizing $(basename "$img")..."
            convert "$img" -resize 1080x1920 -quality 80 -strip "$img"
        fi
    done
fi

echo ""
echo "✅ Image optimization complete!"
echo "📊 Checking file sizes..."
ls -lh assets/*.png assets/*.jpg assets/*.jpeg 2>/dev/null | awk '{print $5, $9}' | sort -hr

echo ""
echo "💡 Tips:"
echo "  - Original images backed up in assets/backup/"
echo "  - If images are still large, use online tools like TinyPNG"
echo "  - Consider using WebP format for even better compression"
