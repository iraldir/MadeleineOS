const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
require('dotenv').config();

// Import vocabulary data
const { vocabularyWords } = require('../types/vocabulary');

const GEMINI_API_KEY = process.env.GEMINI_KEY;

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

async function generateImage(word) {
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
  const enhancedPrompt = `Generate a simple, colorful, child-friendly illustration: ${word.imagePrompt}
Style: Cute cartoon style, bright vibrant colors, simple rounded shapes, educational illustration for children ages 3-7.
Background: Clean white or soft pastel background.
Make it clear, cheerful, and easy to understand for young children learning languages.
The image should be appealing to children and help them remember the word "${word.english}".`;

  try {
    console.log(`🎨 Generating image for ${word.id} (${word.english})...`);
    
    // Use the imagen model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "image/webp"
      }
    });

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
    } else if (response.text) {
      // Sometimes the API returns text instead of image
      console.log(`⚠️  Received text response instead of image for ${word.id}`);
      throw new Error('Text response instead of image');
    } else {
      throw new Error('No image data in response');
    }
  } catch (error) {
    console.error(`❌ Error generating image for ${word.id} (${word.english}):`, error.message);
    errorCount++;
    
    // Create a placeholder image on error
    try {
      const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#e0e7ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" fill="url(#bg)"/>
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
    } catch (placeholderError) {
      console.error(`Failed to create placeholder for ${word.id}:`, placeholderError.message);
    }
    
    return { success: false, error: error.message };
  }
}

async function testGenerateImages() {
  console.log(`🧪 TEST MODE: Generating first ${TEST_LIMIT} images`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between requests`);
  console.log(`🔑 Using Gemini API with model: gemini-2.0-flash-exp\n`);
  
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
    if (!result.skipped && i < testWords.length - 1) {
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
    console.log('Check your vocabulary game to see the new images.');
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