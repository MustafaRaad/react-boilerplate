# PWA Icon Generation Guide

This application requires PWA icons in the following sizes:

## Required Icons

1. **pwa-icon-192.png** - 192x192 pixels
2. **pwa-icon-512.png** - 512x512 pixels

## How to Generate Icons

### Option 1: Using Online Tools

1. **PWA Asset Generator**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload your source logo (minimum 512x512px)
   - Download generated icons
   - Place in `/public` folder

2. **Favicon Generator**
   - Visit: https://realfavicongenerator.net/
   - Upload your logo
   - Configure settings
   - Download and extract icons

### Option 2: Using Command Line (ImageMagick)

```bash
# Install ImageMagick first
# Then convert your source image

# Generate 192x192
magick convert logo.png -resize 192x192 public/pwa-icon-192.png

# Generate 512x512
magick convert logo.png -resize 512x512 public/pwa-icon-512.png
```

### Option 3: Using Node Script

```javascript
// install sharp: pnpm add -D sharp
const sharp = require('sharp');

sharp('logo.png')
  .resize(192, 192)
  .toFile('public/pwa-icon-192.png');

sharp('logo.png')
  .resize(512, 512)
  .toFile('public/pwa-icon-512.png');
```

## Icon Requirements

- **Format**: PNG with transparent background preferred
- **Shape**: Square (1:1 aspect ratio)
- **Quality**: High resolution source recommended
- **Design**: Simple, recognizable, works at small sizes
- **Maskable**: Should work with icon masks on Android

## Optional Screenshots

For better app store presence, add:

1. **screenshot-desktop.png** - 1280x720 pixels (wide form factor)
2. **screenshot-mobile.png** - 540x720 pixels (narrow form factor)

Place these in `/public` folder.

## Testing Icons

1. Build the app: `pnpm build`
2. Serve: `pnpm preview`
3. Open DevTools → Application → Manifest
4. Verify all icons appear correctly

## Current Status

⚠️ **Action Required**: Replace placeholder icons with your brand assets

Temporary: The app is using `/vite.svg` as a fallback. Replace with proper PWA icons for production.
