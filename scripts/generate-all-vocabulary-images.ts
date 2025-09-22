import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from 'sharp';
import dotenv from 'dotenv';
import { vocabularyWords, VocabularyWord } from '../types/vocabulary';

dotenv.config();

// Configuration
const BATCH_SIZE = 10; // Process 10 images per batch
const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests
const BATCH_DELAY = 30000; // 30 seconds between batches

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
    
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(`📝 Text response: ${part.text.substring(0, 100)}...`);
      } else if (part.inlineData) {
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

async function processBatch(words: VocabularyWord[]) {
  const results = [];
  let batchHasNewImages = false;
  
  for (const word of words) {
    const result = await generateImage(word);
    results.push(result);
    
    // Track if any new images were generated in this batch
    if (!(result as any).skipped) {
      batchHasNewImages = true;
      // Rate limiting between individual requests
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  
  return { results, batchHasNewImages };
}

async function generateAllImages() {
  console.log(`🚀 Nano Banana Vocabulary Image Generator`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📊 Total words to process: ${vocabularyWords.length}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between requests`);
  console.log(`📦 Batch size: ${BATCH_SIZE} images per batch`);
  console.log(`⏸️  Batch delay: ${BATCH_DELAY}ms between batches`);
  console.log(`🎨 Using model: gemini-2.5-flash-image-preview (Nano Banana)\n`);
  
  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
    process.exit(1);
  }
  
  // Allow starting from a specific index (useful for resuming)
  const startIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  if (startIndex > 0) {
    console.log(`📌 Starting from word index ${startIndex}\n`);
  }
  
  // Process words in batches
  for (let i = startIndex; i < vocabularyWords.length; i += BATCH_SIZE) {
    const batch = vocabularyWords.slice(i, Math.min(i + BATCH_SIZE, vocabularyWords.length));
    const batchNumber = Math.floor((i - startIndex) / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil((vocabularyWords.length - startIndex) / BATCH_SIZE);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📦 BATCH ${batchNumber}/${totalBatches} (Words ${i+1}-${Math.min(i + BATCH_SIZE, vocabularyWords.length)})`);
    console.log(`${'═'.repeat(60)}`);
    
    const batchResult = await processBatch(batch);
    
    // Show progress
    const totalProcessed = processedCount + skippedCount + errorCount;
    const percentComplete = ((i + batch.length) / vocabularyWords.length * 100).toFixed(1);
    console.log(`\n📊 Overall Progress: ${percentComplete}%`);
    console.log(`   ✅ Generated: ${processedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // Save progress to file
    const progressFile = path.join(OUTPUT_DIR, 'generation-progress.json');
    await fs.writeFile(progressFile, JSON.stringify({
      lastProcessedIndex: i + batch.length,
      processedCount,
      skippedCount,
      errorCount,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    // Delay between batches only if new images were generated and not the last batch
    if (i + BATCH_SIZE < vocabularyWords.length) {
      if (batchResult.batchHasNewImages) {
        console.log(`\n⏸️  Waiting ${BATCH_DELAY / 1000} seconds before next batch...`);
        console.log(`   (You can stop and resume from word ${i + BATCH_SIZE} later)`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      } else {
        console.log(`\n⚡ Skipping batch delay - all images already existed`);
      }
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('✨ IMAGE GENERATION COMPLETE ✨');
  console.log('═'.repeat(60));
  console.log(`Total words processed: ${vocabularyWords.length - startIndex}`);
  console.log(`✅ Successfully generated: ${processedCount}`);
  console.log(`⏭️  Skipped (already existed): ${skippedCount}`);
  console.log(`❌ Errors/Placeholders: ${errorCount}`);
  
  const successRate = ((processedCount / (processedCount + errorCount)) * 100).toFixed(1);
  console.log(`\n📈 Success rate: ${successRate}%`);
  
  if (processedCount > 0) {
    console.log('\n🎉 Images generated successfully!');
    console.log('Visit http://localhost:3000/games/vocabulary to see your vocabulary cards.');
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some images failed and were replaced with placeholders.');
    console.log('You can run the script again to retry failed images (they will be skipped if successful).');
  }
}

// Check if API key is set
if (!process.env.GEMINI_KEY) {
  console.error('❌ Error: GEMINI_KEY not found in .env file');
  console.error('Please add your Gemini API key to the .env file:');
  console.error('GEMINI_KEY=your_api_key_here');
  process.exit(1);
}

// Run the generation
console.log('\n🎨 Nano Banana Vocabulary Image Generator');
console.log('━'.repeat(60));
console.log('Usage: npx tsx scripts/generate-all-vocabulary-images.ts [startIndex]');
console.log('Example: npx tsx scripts/generate-all-vocabulary-images.ts 100');
console.log('━'.repeat(60) + '\n');

generateAllImages().catch(error => {
  console.error('\n❌ Fatal error:', error);
  console.error('\nYou can resume from the last successful batch.');
  process.exit(1);
});