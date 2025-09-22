export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  category: 'yoga' | 'drawing';
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  thumbnail: string;
}

class YouTubeService {
  private static instance: YouTubeService;

  private readonly categories: Category[] = [
    {
      id: 'yoga',
      name: 'Yoga',
      emoji: '🧘‍♀️',
      color: '#9C27B0',
      thumbnail: '/images/youtube/yoga-thumb.png'
    },
    {
      id: 'drawing',
      name: 'Drawing',
      emoji: '🎨',
      color: '#FF6B6B',
      thumbnail: '/images/youtube/drawing-thumb.png'
    }
  ];

  private readonly videos: Video[] = [
    // Yoga Videos - Kid-friendly yoga sessions
    {
      id: 'yoga-1',
      youtubeId: 'X655B4ISakg', // Cosmic Kids Yoga - Frozen
      title: 'Frozen Yoga Adventure',
      thumbnail: 'https://img.youtube.com/vi/X655B4ISakg/maxresdefault.jpg',
      duration: '10:30',
      category: 'yoga'
    },
    {
      id: 'yoga-2',
      youtubeId: '5y3gCrL_XIM', // Cosmic Kids Yoga - Moana
      title: 'Moana Yoga Adventure',
      thumbnail: 'https://img.youtube.com/vi/5y3gCrL_XIM/maxresdefault.jpg',
      duration: '15:00',
      category: 'yoga'
    },
    {
      id: 'yoga-3',
      youtubeId: 'xlg052EKMtk', // Cosmic Kids Yoga - Dinosaur Disco
      title: 'Dinosaur Disco Yoga',
      thumbnail: 'https://img.youtube.com/vi/xlg052EKMtk/maxresdefault.jpg',
      duration: '20:00',
      category: 'yoga'
    },
    {
      id: 'yoga-4',
      youtubeId: 'pT-s1-phgxs', // Cosmic Kids Yoga - Squish the Fish
      title: 'Squish the Fish Yoga',
      thumbnail: 'https://img.youtube.com/vi/pT-s1-phgxs/maxresdefault.jpg',
      duration: '15:00',
      category: 'yoga'
    },
    {
      id: 'yoga-5',
      youtubeId: '02E1468SdHg', // Cosmic Kids Yoga - We're Going on a Bear Hunt
      title: 'Bear Hunt Yoga',
      thumbnail: 'https://img.youtube.com/vi/02E1468SdHg/maxresdefault.jpg',
      duration: '25:00',
      category: 'yoga'
    },

    // Drawing Videos - Simple drawing tutorials for kids
    {
      id: 'drawing-1',
      youtubeId: 'wCqgU1kE-UM', // Art for Kids Hub - How to Draw a Unicorn
      title: 'Draw a Unicorn',
      thumbnail: 'https://img.youtube.com/vi/wCqgU1kE-UM/maxresdefault.jpg',
      duration: '8:00',
      category: 'drawing'
    },
    {
      id: 'drawing-2',
      youtubeId: '3lOz1C3rDsU', // Art for Kids Hub - How to Draw a Rainbow
      title: 'Draw a Rainbow',
      thumbnail: 'https://img.youtube.com/vi/3lOz1C3rDsU/maxresdefault.jpg',
      duration: '6:00',
      category: 'drawing'
    },
    {
      id: 'drawing-3',
      youtubeId: 'bBMT_LdKUZA', // Art for Kids Hub - How to Draw a Butterfly
      title: 'Draw a Butterfly',
      thumbnail: 'https://img.youtube.com/vi/bBMT_LdKUZA/maxresdefault.jpg',
      duration: '7:00',
      category: 'drawing'
    },
    {
      id: 'drawing-4',
      youtubeId: 'By4eLUdfgAQ', // Art for Kids Hub - How to Draw a Cat
      title: 'Draw a Cat',
      thumbnail: 'https://img.youtube.com/vi/By4eLUdfgAQ/maxresdefault.jpg',
      duration: '10:00',
      category: 'drawing'
    },
    {
      id: 'drawing-5',
      youtubeId: 'LRsiK1kBGPI', // Art for Kids Hub - How to Draw a House
      title: 'Draw a House',
      thumbnail: 'https://img.youtube.com/vi/LRsiK1kBGPI/maxresdefault.jpg',
      duration: '9:00',
      category: 'drawing'
    }
  ];

  private constructor() {}

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getCategory(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  public getVideosByCategory(category: 'yoga' | 'drawing'): Video[] {
    return this.videos.filter(video => video.category === category);
  }

  public getVideo(id: string): Video | undefined {
    return this.videos.find(video => video.id === id);
  }

  public getAllVideos(): Video[] {
    return this.videos;
  }

  // YouTube Player options for ad-free, clean experience
  public getPlayerOptions() {
    return {
      playerVars: {
        autoplay: 0,
        controls: 0, // Hide YouTube controls, we'll use custom ones
        disablekb: 1, // Disable keyboard controls
        fs: 0, // Disable fullscreen button
        modestbranding: 1, // Minimal YouTube branding
        rel: 0, // Don't show related videos at the end
        showinfo: 0, // Hide video info
        iv_load_policy: 3, // Hide annotations
        cc_load_policy: 0, // Hide closed captions by default
        playsinline: 1, // Play inline on iOS
        enablejsapi: 1 // Enable JS API
      }
    };
  }
}

export const youtubeService = YouTubeService.getInstance();