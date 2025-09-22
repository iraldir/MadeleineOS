const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const BATCH_SIZE = 10; // Process in batches
const BATCH_DELAY = 5000; // 5 seconds between batches

// Output directories
const OUTPUT_DIR_EN = path.join(__dirname, '../public/sounds/vocabulary/en');
const OUTPUT_DIR_FR = path.join(__dirname, '../public/sounds/vocabulary/fr');
const OUTPUT_DIR_IT = path.join(__dirname, '../public/sounds/vocabulary/it');

// Track progress
let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Voice configurations for each language
const VOICE_CONFIG = {
  en: 'Puck', // English voice
  fr: 'Kore', // Can be used for French 
  it: 'Kore'  // Can be used for Italian
};

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_KEY not found in .env file');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function synthesizeSpeech(text, language, outputPath) {
  const voiceName = VOICE_CONFIG[language];
  
  // Create a more natural prompt for the language
  let prompt = '';
  if (language === 'en') {
    prompt = `Say clearly in English with a friendly tone for children: "${text}"`;
  } else if (language === 'fr') {
    prompt = `Dis clairement en français avec une voix amicale pour les enfants: "${text}"`;
  } else if (language === 'it') {
    prompt = `Dì chiaramente in italiano con una voce amichevole per i bambini: "${text}"`;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });
    
    const result = await model.generateContent({
      contents: [{ 
        role: "user",
        parts: [{ 
          text: prompt 
        }] 
      }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "audio/mp3"
      }
    });

    const response = result.response;
    
    // Check if we have audio data in the response
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const audioData = response.candidates[0].content.parts[0].inlineData.data;
      
      // Decode base64 audio and save
      const audioBuffer = Buffer.from(audioData, 'base64');
      await fs.writeFile(outputPath, audioBuffer);
      
      return true;
    } else if (response.text) {
      throw new Error('Received text response instead of audio');
    } else {
      throw new Error('No audio data in response');
    }
  } catch (error) {
    throw error;
  }
}

async function generateTTSForWord(word) {
  const results = {
    en: false,
    fr: false,
    it: false
  };
  
  // Check and create audio files for each language
  const languages = [
    { code: 'en', text: word.english, dir: OUTPUT_DIR_EN },
    { code: 'fr', text: word.french, dir: OUTPUT_DIR_FR },
    { code: 'it', text: word.italian, dir: OUTPUT_DIR_IT }
  ];
  
  for (const lang of languages) {
    const outputPath = path.join(lang.dir, `${word.id}.mp3`);
    
    // Check if audio already exists
    try {
      await fs.access(outputPath);
      console.log(`✓ Audio already exists for ${word.id} (${lang.code}: ${lang.text})`);
      results[lang.code] = 'skipped';
      continue;
    } catch (error) {
      // Audio doesn't exist, proceed with generation
    }
    
    try {
      console.log(`🔊 Generating audio for ${word.id} (${lang.code}: ${lang.text})...`);
      await synthesizeSpeech(lang.text, lang.code, outputPath);
      console.log(`✅ Saved audio for ${word.id} (${lang.code})`);
      results[lang.code] = 'success';
    } catch (error) {
      console.error(`❌ Error generating ${lang.code} audio for ${word.id}:`, error.message);
      results[lang.code] = 'error';
    }
    
    // Rate limiting between requests
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  }
  
  // Count results
  const allSkipped = Object.values(results).every(r => r === 'skipped');
  const hasError = Object.values(results).some(r => r === 'error');
  
  if (allSkipped) {
    skippedCount++;
  } else if (hasError) {
    errorCount++;
  } else {
    processedCount++;
  }
  
  return results;
}

async function processBatch(words) {
  const results = [];
  
  for (const word of words) {
    const result = await generateTTSForWord(word);
    results.push(result);
  }
  
  return results;
}

async function generateAllTTS() {
  // Load vocabulary data from TypeScript file
  const vocabularyModule = await fs.readFile(path.join(__dirname, '../types/vocabulary.ts'), 'utf-8');
  const vocabularyMatch = vocabularyModule.match(/export const vocabularyWords[^=]*=\s*(\[[\s\S]*?\n\];)/);
  
  if (!vocabularyMatch) {
    console.error('Could not parse vocabulary data from TypeScript file');
    process.exit(1);
  }
  
  // Parse the vocabulary array
  let vocabularyWords;
  try {
    // Clean up TypeScript syntax to make it valid JavaScript
    let jsCode = vocabularyMatch[1]
      .replace(/: VocabularyWord\[\]/g, '')
      .replace(/id:\s*'/g, "id: '")
      .replace(/english:\s*'/g, "english: '")
      .replace(/french:\s*'/g, "french: '")
      .replace(/italian:\s*'/g, "italian: '")
      .replace(/category:\s*'/g, "category: '")
      .replace(/imagePrompt:\s*'/g, "imagePrompt: '");
    
    vocabularyWords = eval(jsCode);
  } catch (error) {
    console.error('Error parsing vocabulary data:', error);
    process.exit(1);
  }
  
  console.log(`🚀 Starting TTS generation for ${vocabularyWords.length} words using Gemini`);
  console.log(`📁 Output directories:`);
  console.log(`   English: ${OUTPUT_DIR_EN}`);
  console.log(`   French: ${OUTPUT_DIR_FR}`);
  console.log(`   Italian: ${OUTPUT_DIR_IT}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between requests`);
  console.log(`📦 Batch size: ${BATCH_SIZE} words per batch`);
  console.log(`⏸️  Batch delay: ${BATCH_DELAY}ms between batches`);
  console.log(`🔑 Using Gemini API with model: gemini-2.0-flash-exp\n`);
  
  // Ensure output directories exist
  try {
    await fs.mkdir(OUTPUT_DIR_EN, { recursive: true });
    await fs.mkdir(OUTPUT_DIR_FR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR_IT, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directories:', error);
    process.exit(1);
  }
  
  // Allow starting from a specific index (useful for resuming)
  const startIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  const endIndex = process.argv[3] ? parseInt(process.argv[3]) : 1; // Default to 1 word for POC
  
  if (startIndex > 0 || endIndex !== vocabularyWords.length) {
    console.log(`📌 Processing words from index ${startIndex} to ${endIndex - 1}\n`);
  }
  
  // Process only the specified range
  const wordsToProcess = vocabularyWords.slice(startIndex, endIndex);
  
  // Process words in batches
  for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
    const batch = wordsToProcess.slice(i, Math.min(i + BATCH_SIZE, wordsToProcess.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (words ${startIndex + i}-${startIndex + Math.min(i + BATCH_SIZE - 1, wordsToProcess.length - 1)})`);
    console.log('═'.repeat(50));
    
    await processBatch(batch);
    
    // Show progress
    const totalProcessed = processedCount + skippedCount + errorCount;
    const percentComplete = ((totalProcessed / wordsToProcess.length) * 100).toFixed(1);
    console.log(`\n📊 Progress: ${totalProcessed}/${wordsToProcess.length} (${percentComplete}%)`);
    console.log(`   ✅ Generated: ${processedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // Delay between batches (except for the last batch)
    if (i + BATCH_SIZE < wordsToProcess.length) {
      console.log(`\n⏸️  Waiting ${BATCH_DELAY / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log('✨ TTS GENERATION COMPLETE ✨');
  console.log('═'.repeat(50));
  console.log(`Total words processed: ${wordsToProcess.length}`);
  console.log(`✅ Successfully generated: ${processedCount}`);
  console.log(`⏭️  Skipped (already existed): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some audio files failed to generate. You can run this script again to retry failed files.');
    console.log('   The script will skip already generated files automatically.');
  }
}

// Run the script
console.log('🔧 Gemini Text-to-Speech Vocabulary Generator');
console.log('Usage: node generate-vocabulary-tts-gemini.js [startIndex] [endIndex]');
console.log('Example: node generate-vocabulary-tts-gemini.js 0 1 (to process first word only)');
console.log('Example: node generate-vocabulary-tts-gemini.js 10 20 (to process words 10-19)\n');

generateAllTTS().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});