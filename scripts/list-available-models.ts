import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY!;

async function listAvailableModels() {
  try {
    console.log('🔍 Fetching available models from Gemini API...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Available Models:\n');
    console.log('═'.repeat(80));
    
    if (data.models) {
      // Group models by capability
      const imageGenModels: any[] = [];
      const textGenModels: any[] = [];
      const otherModels: any[] = [];
      
      data.models.forEach((model: any) => {
        const modelInfo = {
          name: model.name,
          displayName: model.displayName || model.name,
          description: model.description || 'No description',
          supportedMethods: model.supportedGenerationMethods || []
        };
        
        // Check if model supports image generation
        if (model.name.toLowerCase().includes('imagen') || 
            model.description?.toLowerCase().includes('image generation')) {
          imageGenModels.push(modelInfo);
        } else if (model.supportedGenerationMethods?.includes('generateContent')) {
          textGenModels.push(modelInfo);
        } else {
          otherModels.push(modelInfo);
        }
      });
      
      // Display image generation models
      if (imageGenModels.length > 0) {
        console.log('\n🎨 IMAGE GENERATION MODELS:');
        console.log('-'.repeat(80));
        imageGenModels.forEach(model => {
          console.log(`\n📦 ${model.displayName}`);
          console.log(`   Name: ${model.name}`);
          console.log(`   Description: ${model.description}`);
          console.log(`   Methods: ${model.supportedMethods.join(', ')}`);
        });
      }
      
      // Display text generation models
      if (textGenModels.length > 0) {
        console.log('\n📝 TEXT GENERATION MODELS:');
        console.log('-'.repeat(80));
        textGenModels.forEach(model => {
          console.log(`\n📦 ${model.displayName}`);
          console.log(`   Name: ${model.name}`);
          console.log(`   Methods: ${model.supportedMethods.join(', ')}`);
        });
      }
      
      // Display other models
      if (otherModels.length > 0) {
        console.log('\n🔧 OTHER MODELS:');
        console.log('-'.repeat(80));
        otherModels.forEach(model => {
          console.log(`\n📦 ${model.displayName}`);
          console.log(`   Name: ${model.name}`);
          console.log(`   Methods: ${model.supportedMethods.join(', ')}`);
        });
      }
      
      console.log('\n' + '═'.repeat(80));
      console.log(`\nTotal models found: ${data.models.length}`);
      console.log(`Image generation models: ${imageGenModels.length}`);
      console.log(`Text generation models: ${textGenModels.length}`);
      console.log(`Other models: ${otherModels.length}`);
      
      // Check specifically for Imagen models
      console.log('\n🔍 Checking for Imagen-specific capabilities...');
      const imagenModels = data.models.filter((m: any) => 
        m.name.toLowerCase().includes('imagen')
      );
      
      if (imagenModels.length > 0) {
        console.log(`Found ${imagenModels.length} Imagen model(s):`);
        imagenModels.forEach((model: any) => {
          console.log(`  - ${model.name}`);
          if (model.supportedGenerationMethods) {
            console.log(`    Supports: ${model.supportedGenerationMethods.join(', ')}`);
          }
        });
      } else {
        console.log('❌ No Imagen models found in the available models list.');
        console.log('\n💡 This might mean:');
        console.log('   1. Imagen API requires separate authentication');
        console.log('   2. Your API key doesn\'t have access to Imagen models');
        console.log('   3. Imagen is only available in specific regions');
        console.log('   4. You need to enable Imagen in your Google Cloud project');
      }
      
    } else {
      console.log('No models data returned');
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching models:', error.message);
  }
}

// Check if API key is set
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_KEY not found in .env file');
  console.error('Please add your Gemini API key to the .env file:');
  console.error('GEMINI_KEY=your_api_key_here');
  process.exit(1);
}

// Run the check
listAvailableModels();