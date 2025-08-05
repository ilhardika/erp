#!/bin/bash

# Script to generate PWA icons from SVG
# You can run this manually or use online tools to convert SVG to PNG

echo "Generate the following icons from icon.svg:"
echo "- favicon.ico (16x16, 32x32, 48x48)"
echo "- icon-192x192.png"
echo "- icon-256x256.png" 
echo "- icon-384x384.png"
echo "- icon-512x512.png"
echo ""
echo "You can use online tools like:"
echo "- https://realfavicongenerator.net/"
echo "- https://favicon.io/favicon-converter/"
echo "- https://www.favicon-generator.org/"
echo ""
echo "Or use ImageMagick if installed:"
echo "convert icon.svg -resize 192x192 icon-192x192.png"
echo "convert icon.svg -resize 256x256 icon-256x256.png"
echo "convert icon.svg -resize 384x384 icon-384x384.png"
echo "convert icon.svg -resize 512x512 icon-512x512.png"
