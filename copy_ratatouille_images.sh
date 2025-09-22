#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/characters
mkdir -p public/images/coloring

# Copy character image from Elsa to Ratatouille
cp public/images/characters/elsa.webp public/images/characters/ratatouille.webp

# Copy coloring pages from Elsa to Ratatouille
cp public/images/coloring/elsa1.webp public/images/coloring/ratatouille1.webp
cp public/images/coloring/elsa2.webp public/images/coloring/ratatouille2.webp
cp public/images/coloring/elsa3.webp public/images/coloring/ratatouille3.webp
cp public/images/coloring/elsa4.webp public/images/coloring/ratatouille4.webp

echo "All Ratatouille image files have been copied. You can now replace them with the actual character images." 