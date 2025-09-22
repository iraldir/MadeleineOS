#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/characters
mkdir -p public/images/coloring

# Copy character images from Elsa to the new characters
cp public/images/characters/elsa.webp public/images/characters/toph.webp
cp public/images/characters/elsa.webp public/images/characters/fluttershy.webp
cp public/images/characters/elsa.webp public/images/characters/rainbowdash.webp

# Copy coloring pages from Elsa to Toph
cp public/images/coloring/elsa1.webp public/images/coloring/toph1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/toph2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/toph3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/toph4.webp

# Copy coloring pages from Elsa to Fluttershy
cp public/images/coloring/elsa1.webp public/images/coloring/fluttershy1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/fluttershy2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/fluttershy3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/fluttershy4.webp

# Copy coloring pages from Elsa to Rainbow Dash
cp public/images/coloring/elsa1.webp public/images/coloring/rainbowdash1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/rainbowdash2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/rainbowdash3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/rainbowdash4.webp

echo "All image files have been copied. You can now replace them with the actual character images." 