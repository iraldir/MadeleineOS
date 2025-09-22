#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function removeBackground(inputPath, outputPath, backgroundColor = { r: 255, g: 192, b: 203 }) {
  try {
    const image = sharp(inputPath);
    const { width, height, channels } = await image.metadata();
    
    // Read the image as raw pixel data
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Create a new buffer for the output with alpha channel
    const outputBuffer = Buffer.alloc(width * height * 4);
    
    // Process each pixel
    for (let i = 0; i < width * height; i++) {
      const idx = i * channels;
      const outIdx = i * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;
      
      // Check if the pixel is close to the background color (with tolerance)
      const tolerance = 50;
      const isPinkBackground = 
        Math.abs(r - backgroundColor.r) < tolerance &&
        Math.abs(g - backgroundColor.g) < tolerance &&
        Math.abs(b - backgroundColor.b) < tolerance;
      
      if (isPinkBackground) {
        // Make it transparent
        outputBuffer[outIdx] = 0;
        outputBuffer[outIdx + 1] = 0;
        outputBuffer[outIdx + 2] = 0;
        outputBuffer[outIdx + 3] = 0;
      } else {
        // Keep the original pixel
        outputBuffer[outIdx] = r;
        outputBuffer[outIdx + 1] = g;
        outputBuffer[outIdx + 2] = b;
        outputBuffer[outIdx + 3] = a;
      }
    }
    
    // Save the processed image
    await sharp(outputBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
    .webp()
    .toFile(outputPath);
    
    console.log(`✅ Processed: ${path.basename(inputPath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
  }
}

async function processAllPlanets() {
  const baseDir = path.join(__dirname, '../public/images/solar-system');
  const styles = ['realistic', 'cute'];
  const planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  
  for (const style of styles) {
    for (const planet of planets) {
      const inputPath = path.join(baseDir, style, `${planet}.webp`);
      const outputPath = inputPath; // Overwrite the same file
      
      try {
        await removeBackground(inputPath, outputPath);
      } catch (error) {
        console.log(`Skipping ${style}/${planet}: ${error.message}`);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    processAllPlanets();
  } else if (args.length === 2) {
    removeBackground(args[0], args[1]);
  } else {
    console.log('Usage:');
    console.log('  node remove-background.js                    # Process all planets');
    console.log('  node remove-background.js input.webp output.webp  # Process single file');
  }
}

module.exports = { removeBackground };