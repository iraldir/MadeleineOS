import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from 'sharp';
import dotenv from 'dotenv';
import { vocabularyWords, VocabularyWord } from '../types/vocabulary';

dotenv.config();

// Test configuration - only process first 10 words
const TEST_LIMIT = 10;
const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../public/images/vocabulary');

// Track progress
let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Initialize the Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY
});

async function generateImage(word: VocabularyWord) {
  const outputPath = path.join(OUTPUT_DIR, `${word.id}.webp`);
  
  // Check if image already exists
  try {
    await fs.access(outputPath);
    console.log(`✓ Image already exists for ${word.id} (${word.english})`);
    skippedCount++;
    return { success: true, skipped: true };
  } catch (error) {
    // Image doesn't exist, proceed with generation
  }

  // Enhanced prompt for better child-friendly images
  const prompt = `Create a simple, colorful, child-friendly illustration: ${word.imagePrompt}
Style: Cute cartoon style for children ages 3-7, bright vibrant colors, simple rounded shapes, educational.
Background: Clean white or soft pastel background.
The image should clearly represent the word "${word.english}" (${word.french} in French, ${word.italian} in Italian).
Make it cheerful and easy to understand for young children learning languages.`;

  try {
    console.log(`🎨 Generating image for ${word.id} (${word.english})...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });
    
    // Check if we have image data in the response
    let imageFound = false;
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }
    
    const candidate = response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("Invalid response structure");
    }
    
    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log(`📝 Text response: ${part.text.substring(0, 100)}...`);
      } else if (part.inlineData && part.inlineData.data) {
        imageFound = true;
        const imageData = part.inlineData.data;
        const imageBuffer = Buffer.from(imageData, "base64");
        
        console.log(`📦 Received image for ${word.id}`);
        
        // Process and optimize the image with sharp
        await sharp(imageBuffer)
          .resize(512, 512, { 
            fit: 'cover',
            position: 'center',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .webp({ 
            quality: 85,
            effort: 4
          })
          .toFile(outputPath);
        
        console.log(`✅ Saved image for ${word.id} (${word.english})`);
        processedCount++;
      }
    }
    
    if (imageFound) {
      return { success: true };
    } else {
      throw new Error('No image data in response');
    }
    
  } catch (error: any) {
    console.error(`❌ Error generating image for ${word.id} (${word.english}):`, error.message);
    errorCount++;
    
    // Create a colorful placeholder image on error
    try {
      const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg${word.id}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
            </radialGradient>
          </defs>
          <rect width="512" height="512" fill="url(#bg${word.id})"/>
          <rect x="20" y="20" width="472" height="472" rx="20" fill="white" opacity="0.95"/>
          <text x="256" y="200" font-family="Arial" font-size="52" fill="${color}" text-anchor="middle" font-weight="bold">
            ${word.english}
          </text>
          <text x="256" y="260" font-family="Arial" font-size="28" fill="#6b7280" text-anchor="middle">
            ${word.french}
          </text>
          <text x="256" y="300" font-family="Arial" font-size="28" fill="#6b7280" text-anchor="middle">
            ${word.italian}
          </text>
          <text x="256" y="380" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle">
            ${word.category}
          </text>
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      console.log(`📝 Created placeholder for ${word.id} (${word.english})`);
    } catch (placeholderError: any) {
      console.error(`Failed to create placeholder for ${word.id}:`, placeholderError.message);
    }
    
    return { success: false, error: error.message };
  }
}

async function generateTestImages() {
  console.log(`🚀 Nano Banana Image Generator Test`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between requests`);
  console.log(`🎨 Using model: gemini-2.5-flash-image-preview (Nano Banana)\n`);
  
  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
    process.exit(1);
  }
  
  // Get first 10 words for testing
  const testWords = vocabularyWords.slice(0, TEST_LIMIT);
  
  console.log('Testing with these words:');
  testWords.forEach((word, i) => {
    console.log(`${i + 1}. ${word.english} (${word.category})`);
  });
  console.log('\n' + '═'.repeat(50) + '\n');
  
  // Process each word
  for (let i = 0; i < testWords.length; i++) {
    const word = testWords[i];
    console.log(`\n[${i + 1}/${TEST_LIMIT}] Processing "${word.english}"...`);
    
    const result = await generateImage(word);
    
    // Rate limiting between requests (except if skipped)
    if (!(result as any).skipped && i < testWords.length - 1) {
      console.log(`⏸️  Waiting ${RATE_LIMIT_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log('✨ TEST COMPLETE ✨');
  console.log('═'.repeat(50));
  console.log(`Total words tested: ${TEST_LIMIT}`);
  console.log(`✅ Successfully generated: ${processedCount}`);
  console.log(`⏭️  Skipped (already existed): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (processedCount > 0) {
    console.log('\n🎉 Images generated successfully with Nano Banana!');
    console.log('Check your vocabulary game at http://localhost:3000/games/vocabulary');
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some images failed. Created colorful placeholders instead.');
  }
}

// Check if API key is set
if (!process.env.GEMINI_KEY) {
  console.error('❌ Error: GEMINI_KEY not found in .env file');
  console.error('Please add your Gemini API key to the .env file:');
  console.error('GEMINI_KEY=your_api_key_here');
  process.exit(1);
}

// Run the test
generateTestImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});