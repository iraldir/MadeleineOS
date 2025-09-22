import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

export interface ImageGenerationOptions {
  prompt: string;
  outputPath: string;
  width?: number;
  height?: number;
  quality?: number;
  model?: string;
}

export interface TTSGenerationOptions {
  text: string;
  language: "en" | "fr" | "it";
  outputPath: string;
  voiceName?: string;
  speakingRate?: number;
}

export interface VoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: string;
}

const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  en: {
    languageCode: "en-US",
    name: "en-US-Journey-F",
    ssmlGender: "FEMALE",
  },
  fr: {
    languageCode: "fr-FR",
    name: "fr-FR-Wavenet-C",
    ssmlGender: "FEMALE",
  },
  it: {
    languageCode: "it-IT",
    name: "it-IT-Journey-F",
    ssmlGender: "FEMALE",
  },
};

export class MediaGenerator {
  private ai: GoogleGenAI | null = null;
  private initialized = false;

  constructor() {
    if (process.env.GEMINI_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_KEY,
      });
      this.initialized = true;
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<boolean> {
    const {
      prompt,
      outputPath,
      width = 512,
      height = 512,
      quality = 85,
      model = "gemini-2.5-flash-image-preview",
    } = options;

    if (!this.ai) {
      throw new Error("GEMINI_KEY not configured");
    }

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });

      let imageFound = false;

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageFound = true;
          const imageData = part.inlineData.data;
          const imageBuffer = Buffer.from(imageData, "base64");

          await sharp(imageBuffer)
            .resize(width, height, {
              fit: "cover",
              position: "center",
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .webp({ quality, effort: 4 })
            .toFile(outputPath);

          return true;
        }
      }

      if (!imageFound) {
        throw new Error("No image data in response");
      }

      return false;
    } catch (error) {
      console.error(`Error generating image: ${error.message}`);
      throw error;
    }
  }

  async generateTTS(options: TTSGenerationOptions): Promise<boolean> {
    const {
      text,
      language,
      outputPath,
      voiceName,
      speakingRate = 1.0,
    } = options;

    const voiceConfig = VOICE_CONFIGS[language];
    if (!voiceConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const requestBody = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceName || voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate,
      },
    };

    try {
      // Get auth token and project ID
      const { stdout: token } = await execAsync("gcloud auth print-access-token");
      const { stdout: project } = await execAsync(
        "gcloud config list --format='value(core.project)'"
      );

      // Create temp file for request body
      const tempFile = path.join(path.dirname(outputPath), "temp_request.json");
      await fs.writeFile(tempFile, JSON.stringify(requestBody));

      // Make API call using curl
      const curlCommand = `curl -s -X POST \
        -H "Authorization: Bearer ${token.trim()}" \
        -H "x-goog-user-project: ${project.trim()}" \
        -H "Content-Type: application/json" \
        --data @${tempFile} \
        "https://texttospeech.googleapis.com/v1/text:synthesize"`;

      const { stdout: response } = await execAsync(curlCommand);

      // Clean up temp file
      await fs.unlink(tempFile);

      // Parse response
      const responseData = JSON.parse(response);

      if (responseData.audioContent) {
        const audioBuffer = Buffer.from(responseData.audioContent, "base64");
        await fs.writeFile(outputPath, audioBuffer);
        return true;
      } else if (responseData.error) {
        throw new Error(
          responseData.error.message || JSON.stringify(responseData.error)
        );
      } else {
        throw new Error("No audio content in response");
      }
    } catch (error) {
      console.error(`Error generating TTS: ${error.message}`);
      throw error;
    }
  }

  async generatePlaceholderImage(
    text: string,
    outputPath: string,
    color?: string
  ): Promise<void> {
    const colors = ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
    const selectedColor = color || colors[Math.floor(Math.random() * colors.length)];

    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${selectedColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${selectedColor};stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="512" height="512" fill="url(#bg)"/>
        <rect x="20" y="20" width="472" height="472" rx="20" fill="white" opacity="0.95"/>
        <text x="256" y="256" font-family="Arial" font-size="48" fill="${selectedColor}" text-anchor="middle" font-weight="bold">
          ${text}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outputPath);
  }

  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async generateAppIcon(
    prompt: string,
    outputDir: string,
    sizes: number[] = [16, 32, 64, 128, 256, 512, 1024]
  ): Promise<void> {
    const baseImagePath = path.join(outputDir, "icon-base.webp");

    // Generate the base image
    await this.generateImage({
      prompt: `App icon design: ${prompt}\nStyle: Modern, clean, professional app icon with rounded corners, suitable for desktop and mobile applications.`,
      outputPath: baseImagePath,
      width: 1024,
      height: 1024,
      quality: 95,
    });

    // Generate different sizes
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(baseImagePath)
        .resize(size, size, {
          fit: "cover",
          position: "center",
        })
        .png({ quality: 95 })
        .toFile(outputPath);
    }

    console.log(`Generated app icons in ${sizes.length} sizes`);
  }
}

export const mediaGenerator = new MediaGenerator();