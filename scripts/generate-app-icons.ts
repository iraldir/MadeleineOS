import { mediaGenerator } from "./utils/media-generator";
import { CONFIG, formatSuccess, formatError, formatInfo } from "./config";
import * as path from "node:path";

interface AppIcon {
  id: string;
  filename: string;
  prompt: string;
}

const appIcons: AppIcon[] = [
  {
    id: "character-list",
    filename: "characterlist.webp",
    prompt: "Character portrait gallery app icon, colorful grid of happy cartoon character faces from Disney princesses, Pokemon, and children's shows, bright vibrant colors, rounded square app icon design, child-friendly illustration"
  },
  {
    id: "character-recognition",
    filename: "choice.webp",
    prompt: "Character recognition game app icon, cartoon character with question marks and multiple choice buttons A B C D, brain training theme, bright educational colors, playful learning icon for children"
  },
  {
    id: "coloring-search",
    filename: "coloring.webp",
    prompt: "Coloring book app icon, rainbow colored pencils and crayons with partially colored cartoon character drawing, art supplies, creative and colorful, child-friendly coloring app design"
  },
  {
    id: "character-writing",
    filename: "writing.webp",
    prompt: "Writing practice app icon, cartoon pencil writing letters ABC with dotted lines to trace, handwriting practice theme, educational and playful, bright colors for children"
  },
  {
    id: "math",
    filename: "math.webp",
    prompt: "Math game app icon, colorful numbers 1 2 3 with plus and minus symbols, calculator theme with happy cartoon numbers, educational math learning, bright and fun for children"
  },
  {
    id: "vocabulary",
    filename: "vocabulary.webp",
    prompt: "Vocabulary flashcards app icon, colorful word cards with pictures of common objects like apple, house, cat, multilingual learning theme with flags, educational language app for children"
  }
];

async function generateAppIcons() {
  console.log(formatInfo(`Generating ${appIcons.length} app icons...`));
  console.log(formatInfo("Skipping: Videos (youtube) and Today's Weather"));
  console.log("");

  const outputDir = path.join(__dirname, "../public/images/games");
  await mediaGenerator.ensureDirectoryExists(outputDir);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < appIcons.length; i++) {
    const icon = appIcons[i];
    const outputPath = path.join(outputDir, icon.filename);
    
    console.log(formatInfo(`[${i + 1}/${appIcons.length}] Generating ${icon.id} (${icon.filename})`));

    try {
      await mediaGenerator.generateImage({
        prompt: icon.prompt,
        outputPath,
        width: 512,
        height: 512,
        quality: 90
      });
      console.log(formatSuccess(`Generated ${icon.filename}`));
      successCount++;
    } catch (error: any) {
      console.error(formatError(`Failed to generate ${icon.filename}: ${error.message}`));
      errorCount++;
    }

    // Rate limiting
    if (i < appIcons.length - 1) {
      console.log("Waiting 3 seconds before next generation...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(formatSuccess("APP ICON GENERATION COMPLETE"));
  console.log("=".repeat(60));
  console.log(formatInfo(`Successfully generated: ${successCount}`));
  if (errorCount > 0) {
    console.log(formatError(`Failed: ${errorCount}`));
  }
}

// Run the generation
generateAppIcons().catch(error => {
  console.error(formatError(`Fatal error: ${error.message}`));
  process.exit(1);
});