import * as fs from "node:fs/promises";
import * as path from "node:path";
import { formatSuccess, formatError, formatInfo, formatWarning } from "../config";
import { YouTubeSearchResult, YouTubeVideoDetails, createYouTubeClient } from "./youtube-search";

interface VideoEntry {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  category: string;
}

interface ServiceFileData {
  videos: VideoEntry[];
  categories: string[];
}

class YouTubeManager {
  private servicePath: string;

  constructor() {
    this.servicePath = path.join(__dirname, "../../services/youtubeService.ts");
  }

  /**
   * Parse the existing youtubeService.ts file to extract videos and categories
   */
  async parseServiceFile(): Promise<ServiceFileData> {
    try {
      const content = await fs.readFile(this.servicePath, "utf-8");
      
      // Extract categories from the union type definition
      const categoryTypeMatch = content.match(/category:\s*'([^']+)'(?:\s*\|\s*'([^']+)')*/g);
      const categories = new Set<string>();
      
      if (categoryTypeMatch) {
        categoryTypeMatch.forEach(match => {
          const cats = match.match(/'([^']+)'/g);
          if (cats) {
            cats.forEach(c => categories.add(c.replace(/'/g, "")));
          }
        });
      }

      // Extract existing videos using a more robust line-by-line approach
      const videos: VideoEntry[] = [];
      const lines = content.split('\n');
      
      let currentVideo: Partial<VideoEntry> = {};
      let inVideosArray = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('private readonly videos: Video[] = [')) {
          inVideosArray = true;
          continue;
        }
        
        if (inVideosArray && line === '];') {
          // End of videos array
          break;
        }
        
        if (inVideosArray) {
          // Extract id
          const idMatch = line.match(/id:\s*'([^']+)'/);
          if (idMatch) {
            currentVideo.id = idMatch[1];
          }
          
          // Extract youtubeId
          const youtubeIdMatch = line.match(/youtubeId:\s*'([^']+)'/);
          if (youtubeIdMatch) {
            currentVideo.youtubeId = youtubeIdMatch[1];
          }
          
          // Extract title (handle escaped quotes)
          const titleMatch = line.match(/title:\s*'((?:[^'\\\\]|\\\\.)*)'/);
          if (titleMatch) {
            currentVideo.title = titleMatch[1];
          }
          
          // Extract thumbnail
          const thumbnailMatch = line.match(/thumbnail:\s*'([^']+)'/);
          if (thumbnailMatch) {
            currentVideo.thumbnail = thumbnailMatch[1];
          }
          
          // Extract category
          const categoryMatch = line.match(/category:\s*'([^']+)'/);
          if (categoryMatch) {
            currentVideo.category = categoryMatch[1];
          }
          
          // Check if we completed a video object
          if (line.includes('}') && currentVideo.id && currentVideo.youtubeId && 
              currentVideo.title && currentVideo.thumbnail && currentVideo.category) {
            videos.push(currentVideo as VideoEntry);
            currentVideo = {};
          }
        }
      }

      return {
        videos,
        categories: Array.from(categories),
      };
    } catch (error) {
      throw new Error(`Failed to parse service file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate the next video ID for a category
   */
  generateNextId(category: string, existingVideos: VideoEntry[]): string {
    const categoryVideos = existingVideos.filter(v => v.category === category);
    const maxNum = categoryVideos.reduce((max, video) => {
      const match = video.id.match(new RegExp(`${category}-(\\d+)`));
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    return `${category}-${maxNum + 1}`;
  }

  /**
   * Add videos to the service file
   */
  async addVideos(
    videos: Array<{ youtubeId: string; title: string; thumbnail: string; duration?: string }>,
    category: string
  ): Promise<void> {
    try {
      const serviceData = await this.parseServiceFile();

      // Check if category exists
      if (!serviceData.categories.includes(category)) {
        throw new Error(
          `Category "${category}" not found. Available categories: ${serviceData.categories.join(", ")}`
        );
      }

      // Check for duplicates
      const existingYoutubeIds = new Set(serviceData.videos.map(v => v.youtubeId));
      const newVideos: VideoEntry[] = [];

      for (const video of videos) {
        if (existingYoutubeIds.has(video.youtubeId)) {
          console.log(formatWarning(`Video "${video.title}" (${video.youtubeId}) already exists, skipping`));
          continue;
        }

        const id = this.generateNextId(category, [...serviceData.videos, ...newVideos]);
        newVideos.push({
          id,
          youtubeId: video.youtubeId,
          title: video.title.replace(/'/g, "\\'"), // Escape single quotes
          thumbnail: video.thumbnail,
          duration: video.duration,
          category,
        });
      }

      if (newVideos.length === 0) {
        console.log(formatWarning("No new videos to add (all duplicates)"));
        return;
      }

      // Read the current file content
      let content = await fs.readFile(this.servicePath, "utf-8");

      // Find the position to insert new videos (at the end of the videos array)
      const videosArrayMatch = content.match(/private readonly videos: Video\[\] = \[([\s\S]*?)\];/);
      if (!videosArrayMatch) {
        throw new Error("Could not find videos array in service file");
      }

      const videosEndIndex = content.indexOf("];", videosArrayMatch.index!);
      
      // Generate the new video entries
      const newVideoEntries = newVideos.map(video => {
        const lines: string[] = [];
        lines.push("    {");
        lines.push(`      id: '${video.id}',`);
        lines.push(`      youtubeId: '${video.youtubeId}',`);
        lines.push(`      title: '${video.title}',`);
        lines.push(`      thumbnail: '${video.thumbnail}',`);
        lines.push(`      category: '${video.category}'`);
        lines.push("    }");
        return lines.join("\n");
      }).join(",\n");

      // Insert the new videos
      const beforeVideos = content.substring(0, videosEndIndex);
      const afterVideos = content.substring(videosEndIndex);

      // Check if there are existing videos to add comma
      const needsComma = beforeVideos.trim().endsWith("}");
      const newContent = beforeVideos + (needsComma ? ",\n" : "\n") + newVideoEntries + "\n  " + afterVideos;

      // Write the updated content
      await fs.writeFile(this.servicePath, newContent, "utf-8");

      console.log(formatSuccess(`Added ${newVideos.length} video(s) to category "${category}"`));
      newVideos.forEach(video => {
        console.log(formatInfo(`  ${video.id}: ${video.title}`));
      });
    } catch (error) {
      throw new Error(`Failed to add videos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search YouTube and add videos
   */
  async searchAndAdd(
    query: string,
    category: string,
    maxResults: number = 3
  ): Promise<void> {
    try {
      console.log(formatInfo(`Searching YouTube for: "${query}"`));
      
      const client = createYouTubeClient();
      const searchResults = await client.searchVideos(query, maxResults, {
        safeSearch: "strict",
      });

      if (searchResults.length === 0) {
        console.log(formatWarning("No videos found"));
        return;
      }

      console.log(formatInfo(`Found ${searchResults.length} video(s)`));

      // Get detailed information including duration
      const videoIds = searchResults.map(r => r.videoId);
      const videoDetails = await client.getVideoDetails(videoIds);

      // Display results
      videoDetails.forEach((video, index) => {
        console.log(formatInfo(`  ${index + 1}. ${video.title} (${video.duration}) - ${video.channelTitle}`));
      });

      // Add videos to service file
      await this.addVideos(
        videoDetails.map(v => ({
          youtubeId: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          duration: v.duration,
        })),
        category
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import all videos from a YouTube playlist
   */
  async importPlaylist(
    playlistId: string,
    category: string
  ): Promise<void> {
    try {
      console.log(formatInfo(`Fetching playlist: ${playlistId}`));
      
      const client = createYouTubeClient();
      const playlistVideos = await client.getPlaylistVideos(playlistId);

      if (playlistVideos.length === 0) {
        console.log(formatWarning("No videos found in playlist"));
        return;
      }

      console.log(formatInfo(`Found ${playlistVideos.length} video(s) in playlist`));

      // Get detailed information including duration (process in batches of 50)
      const allVideoDetails: any[] = [];
      const batchSize = 50;
      
      for (let i = 0; i < playlistVideos.length; i += batchSize) {
        const batch = playlistVideos.slice(i, i + batchSize);
        const videoIds = batch.map(v => v.videoId);
        const videoDetails = await client.getVideoDetails(videoIds);
        allVideoDetails.push(...videoDetails);
      }

      // Display results
      console.log(formatInfo("Videos from playlist:"));
      allVideoDetails.forEach((video, index) => {
        console.log(formatInfo(`  ${index + 1}. ${video.title} (${video.duration}) - ${video.channelTitle}`));
      });

      // Add videos to service file
      await this.addVideos(
        allVideoDetails.map(v => ({
          youtubeId: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          duration: v.duration,
        })),
        category
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all available categories
   */
  async listCategories(): Promise<string[]> {
    const serviceData = await this.parseServiceFile();
    return serviceData.categories;
  }

  /**
   * List videos in a category
   */
  async listVideos(category?: string): Promise<void> {
    const serviceData = await this.parseServiceFile();

    if (category) {
      const videos = serviceData.videos.filter(v => v.category === category);
      console.log(formatInfo(`Category "${category}": ${videos.length} video(s)`));
      videos.forEach(video => {
        console.log(`  ${video.id}: ${video.title} (${video.youtubeId})`);
      });
    } else {
      console.log(formatInfo("All categories:"));
      for (const cat of serviceData.categories) {
        const videos = serviceData.videos.filter(v => v.category === cat);
        console.log(`  ${cat}: ${videos.length} video(s)`);
      }
    }
  }
}

export const youtubeManager = new YouTubeManager();
