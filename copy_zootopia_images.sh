#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/characters
mkdir -p public/images/coloring

# Copy character images from Elsa to the Zootopia characters
cp public/images/characters/elsa.webp public/images/characters/judy.webp
cp public/images/characters/elsa.webp public/images/characters/nick.webp

# Copy coloring pages from Elsa to Judy
cp public/images/coloring/elsa1.webp public/images/coloring/judy1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/judy2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/judy3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/judy4.webp

# Copy coloring pages from Elsa to Nick
cp public/images/coloring/elsa1.webp public/images/coloring/nick1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/nick2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/nick3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/nick4.webp

echo "All Zootopia character image files have been copied. You can now replace them with the actual character images." 