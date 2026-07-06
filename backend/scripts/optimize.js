const sharp = require('sharp');
const fs = require('fs');

fs.mkdirSync('frontend/public/optimized', { recursive: true });

// Compress logo
sharp('frontend/public/logo.png')
    .resize(360, 80, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 80 })
    .toFile('frontend/public/logo.webp')
    .then(() => console.log('✅ logo.webp created'))
    .catch(err => console.error(err));

// Compress icon
sharp('frontend/public/icon.png')
    .resize(256, 256)
    .webp({ quality: 85 })
    .toFile('frontend/public/icon.webp')
    .then(() => console.log('✅ icon.webp created'))
    .catch(err => console.error(err));

// Compress OG image
sharp('frontend/public/og-image.png')
    .resize(1200, 630, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile('frontend/public/og-image.webp')
    .then(() => console.log('✅ og-image.webp created'))
    .catch(err => console.error(err));

console.log('Running optimization...');