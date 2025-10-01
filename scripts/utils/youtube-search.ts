import axios from "axios";
import { CONFIG } from "../config";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
}

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  description: string;
  viewCount: number;
}

class YouTubeSearchClient {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for videos on YouTube
   */
  async searchVideos(
    query: string,
    maxResults: number = 10,
    options: {
      safeSearch?: "none" | "moderate" | "strict";
      relevanceLanguage?: string;
      regionCode?: string;
    } = {}
  ): Promise<YouTubeSearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          part: "snippet",
          q: query,
          type: "video",
          maxResults,
          safeSearch: options.safeSearch || "strict",
          relevanceLanguage: options.relevanceLanguage || "en",
          regionCode: options.regionCode || "US",
          videoEmbeddable: true, // Only return embeddable videos
          videoSyndicated: true, // Only return videos that can be played outside youtube.com
        },
      });

      return response.data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.maxresdefault?.url || 
                   item.snippet.thumbnails.high?.url ||
                   item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `YouTube API error: ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get detailed information about specific videos
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(","),
        },
      });

      return response.data.items.map((item: any) => ({
        videoId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.maxresdefault?.url || 
                   item.snippet.thumbnails.high?.url ||
                   item.snippet.thumbnails.medium?.url,
        duration: this.formatDuration(item.contentDetails.duration),
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        viewCount: parseInt(item.statistics.viewCount || "0"),
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `YouTube API error: ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get all videos from a YouTube playlist
   */
  async getPlaylistVideos(playlistId: string): Promise<YouTubeSearchResult[]> {
    try {
      const videos: YouTubeSearchResult[] = [];
      let pageToken: string | undefined = undefined;

      // Fetch all pages of playlist items
      do {
        const response = await axios.get(`${this.baseUrl}/playlistItems`, {
          params: {
            key: this.apiKey,
            part: "snippet",
            playlistId: playlistId,
            maxResults: 50, // Maximum allowed per request
            pageToken: pageToken,
          },
        });

        const items = response.data.items || [];
        items.forEach((item: any) => {
          // Skip deleted or private videos
          if (item.snippet.title !== "Deleted video" && item.snippet.title !== "Private video") {
            videos.push({
              videoId: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.maxresdefault?.url ||
                         item.snippet.thumbnails.high?.url ||
                         item.snippet.thumbnails.medium?.url,
              channelTitle: item.snippet.channelTitle,
              description: item.snippet.description,
              publishedAt: item.snippet.publishedAt,
            });
          }
        });

        pageToken = response.data.nextPageToken;
      } while (pageToken);

      return videos;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `YouTube API error: ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Format ISO 8601 duration to human-readable format (e.g., "5:30")
   */
  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export function createYouTubeClient(): YouTubeSearchClient {
  if (!CONFIG.api.geminiKey) {
    throw new Error("GEMINI_KEY not found in environment variables");
  }
  return new YouTubeSearchClient(CONFIG.api.geminiKey);
}
