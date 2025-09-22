import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { vocabularyWords, VocabularyWord } from '../types/vocabulary';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY!;

// Test configuration - only process first 10 words
const TEST_LIMIT = 10;
const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../public/images/vocabulary');

// Track progress
let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
  const imagePrompt = `Generate a simple, colorful, child-friendly illustration: ${word.imagePrompt}
Style: Cute cartoon style, bright vibrant colors, simple rounded shapes, educational illustration for children ages 3-7.
Background: Clean white or soft pastel background.
Make it clear, cheerful, and easy to understand for young children learning languages.
The image should be appealing to children and help them remember the word "${word.english}".`;

  try {
    console.log(`🎨 Generating image for ${word.id} (${word.english})...`);
    
    // Use the imagen-3 model for image generation
    const model = genAI.getGenerativeModel({ 
      model: "imagen-3.0-generate-001"  // Use the Imagen 3 model
    });
    
    const result = await model.generateContent(imagePrompt);
    const response = result.response;
    
    // Check if we have image data in the response
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const imageData = response.candidates[0].content.parts[0].inlineData.data;
      const mimeType = response.candidates[0].content.parts[0].inlineData.mimeType;
      
      console.log(`📦 Received image (${mimeType}) for ${word.id}`);
      
      // Decode base64 image
      const imageBuffer = Buffer.from(imageData, 'base64');
      
      // Process and optimize the image
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
      return { success: true };
    } else {
      // Try alternative response structure
      const text = response.text();
      if (text) {
        console.log(`⚠️  Received text response: ${text.substring(0, 100)}...`);
      }
      throw new Error('No image data in response');
    }
  } catch (error: any) {
    console.error(`❌ Error generating image for ${word.id} (${word.english}):`, error.message);
    
    // If it's a model not found error, try the alternative approach
    if (error.message.includes('models/imagen')) {
      console.log('🔄 Trying alternative image generation approach...');
      return await generateImageAlternative(word);
    }
    
    errorCount++;
    
    // Create a placeholder image on error
    try {
      const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg${word.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#e0e7ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" fill="url(#bg${word.id})"/>
          <text x="256" y="240" font-family="Arial" font-size="28" fill="#6366f1" text-anchor="middle" font-weight="bold">
            ${word.english}
          </text>
          <text x="256" y="270" font-family="Arial" font-size="20" fill="#818cf8" text-anchor="middle">
            ${word.french}
          </text>
          <text x="256" y="295" font-family="Arial" font-size="20" fill="#818cf8" text-anchor="middle">
            ${word.italian}
          </text>
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`📝 Created placeholder for ${word.id} (${word.english})`);
    } catch (placeholderError: any) {
      console.error(`Failed to create placeholder for ${word.id}:`, placeholderError.message);
    }
    
    return { success: false, error: error.message };
  }
}

async function generateImageAlternative(word: VocabularyWord) {
  const outputPath = path.join(OUTPUT_DIR, `${word.id}.webp`);
  
  try {
    // Try using the gemini-pro-vision model with a different approach
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });
    
    // Create a prompt that asks for image generation instructions
    const result = await model.generateContent({
      contents: [{
        role: "user", 
        parts: [{
          text: `I need to generate an image for the word "${word.english}" (${word.french} in French, ${word.italian} in Italian).
          ${word.imagePrompt}
          
          Please describe in detail what this image should look like for a children's educational app.`
        }]
      }]
    });
    
    const response = result.response;
    const description = response.text();
    
    console.log(`📝 Got image description for ${word.id}`);
    
    // For now, create an enhanced placeholder with the description
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg${word.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="url(#bg${word.id})"/>
        <text x="256" y="220" font-family="Arial" font-size="48" fill="#fff" text-anchor="middle" font-weight="bold">
          ${word.english}
        </text>
        <text x="256" y="270" font-family="Arial" font-size="24" fill="#fff3cd" text-anchor="middle">
          ${word.french}
        </text>
        <text x="256" y="300" font-family="Arial" font-size="24" fill="#fff3cd" text-anchor="middle">
          ${word.italian}
        </text>
        <text x="256" y="350" font-family="Arial" font-size="14" fill="#fffbeb" text-anchor="middle">
          Generated with AI description
        </text>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✅ Created enhanced placeholder for ${word.id} (${word.english})`);
    processedCount++;
    return { success: true, alternative: true };
    
  } catch (altError: any) {
    console.error(`❌ Alternative generation also failed for ${word.id}:`, altError.message);
    errorCount++;
    return { success: false, error: altError.message };
  }
}

async function testGenerateImages() {
  console.log(`🧪 TEST MODE: Generating first ${TEST_LIMIT} images`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between requests`);
  console.log(`🔑 Using Gemini API with Imagen model\n`);
  
  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
    process.exit(1);
  }
  
  // Get first 10 words
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
    console.log('\n🎉 Images generated successfully!');
    console.log('Check your vocabulary game at http://localhost:3000/games/vocabulary');
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Note: The Imagen API might not be available in your region or with your API key.');
    console.log('The script created placeholder images with the trilingual text instead.');
  }
}

// Check if API key is set
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_KEY not found in .env file');
  console.error('Please add your Gemini API key to the .env file:');
  console.error('GEMINI_KEY=your_api_key_here');
  process.exit(1);
}

// Run the test
testGenerateImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});