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
  icon: string;
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
      icon: '/images/youtube/yoga-icon.webp',
      color: '#9C27B0',
      thumbnail: '/images/youtube/yoga-thumb.png'
    },
    {
      id: 'drawing',
      name: 'Drawing',
      emoji: '🎨',
      icon: '/images/youtube/drawing-icon.webp',
      color: '#FF6B6B',
      thumbnail: '/images/youtube/drawing-thumb.png'
    }
  ];

  private readonly videos: Video[] = [
    // Yoga Videos - Kid-friendly yoga sessions
    {
      id: 'yoga-1',
      youtubeId: '2cxcGwDZNWQ',
      title: '10 min Morning Yoga Full Body Stretch for Beginners',
      thumbnail: 'https://img.youtube.com/vi/2cxcGwDZNWQ/maxresdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-2',
      youtubeId: 'LCVengYJHss',
      title: 'Halloween Yoga for Kids | Cosmic Kids',
      thumbnail: 'https://img.youtube.com/vi/LCVengYJHss/maxresdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-3',
      youtubeId: 'Sjq2OPw3AMQ',
      title: 'Dinosaur Yoga for Kids | Cosmic Kids',
      thumbnail: 'https://img.youtube.com/vi/Sjq2OPw3AMQ/maxresdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-4',
      youtubeId: 'Jw03oUANsZg',
      title: 'Ariel Yoga | Mermaid Inspired',
      thumbnail: 'https://img.youtube.com/vi/Jw03oUANsZg/maxresdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-5',
      youtubeId: '6ftVNC0_8Sw',
      title: 'Grinch Summer Yoga',
      thumbnail: 'https://img.youtube.com/vi/6ftVNC0_8Sw/maxresdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-6',
      youtubeId: 'YkqbXc84nVQ',
      title: 'Disney Princess Yoga | Cosmic Yoga',
      thumbnail: 'https://img.youtube.com/vi/YkqbXc84nVQ/maxresdefault.jpg',
      category: 'yoga'
    },

    // Drawing Videos - Simple drawing tutorials for kids
    {
      id: 'drawing-1',
      youtubeId: 'NLD3QQSVUZE',
      title: 'How To Draw A Giant Rainbow Lollipop',
      thumbnail: 'https://img.youtube.com/vi/NLD3QQSVUZE/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-2',
      youtubeId: 'ST5GG-zS1BE',
      title: 'How To Draw A Cute Raccoon',
      thumbnail: 'https://img.youtube.com/vi/ST5GG-zS1BE/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-3',
      youtubeId: '6lfV3XDfA64',
      title: 'How To Draw POKEMON | VULPIX Step By Step Tutorial',
      thumbnail: 'https://img.youtube.com/vi/6lfV3XDfA64/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-4',
      youtubeId: 'Iy-qngRwYxU',
      title: 'HOW TO DRAW VULPIX - Easy Pokémon Drawing',
      thumbnail: 'https://img.youtube.com/vi/Iy-qngRwYxU/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-5',
      youtubeId: 'jCCPBGOCo6Q',
      title: 'How to Draw Vulpix | Pokemon',
      thumbnail: 'https://img.youtube.com/vi/jCCPBGOCo6Q/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-6',
      youtubeId: '-RRw77w183w',
      title: 'How To Draw Charizard',
      thumbnail: 'https://img.youtube.com/vi/-RRw77w183w/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-7',
      youtubeId: 'yLmPwjDtMnQ',
      title: 'How To Draw Pokemon | Charizard || Step by Step',
      thumbnail: 'https://img.youtube.com/vi/yLmPwjDtMnQ/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-8',
      youtubeId: 'bJZQYRywEAc',
      title: 'Handwriting name #calligraphy #art',
      thumbnail: 'https://img.youtube.com/vi/bJZQYRywEAc/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-9',
      youtubeId: 'qN6bXtsBBsI',
      title: 'How to Draw a CHICK',
      thumbnail: 'https://img.youtube.com/vi/qN6bXtsBBsI/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-10',
      youtubeId: 'VzX-xntLpL0',
      title: 'How to Draw a BUTTERFLY',
      thumbnail: 'https://img.youtube.com/vi/VzX-xntLpL0/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-11',
      youtubeId: '8qrq6ZIX0W0',
      title: 'How to Draw a MOUSE (Easy for Kids)',
      thumbnail: 'https://img.youtube.com/vi/8qrq6ZIX0W0/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-12',
      youtubeId: 'hky2ggpPM88',
      title: 'How To Draw A Cartoon Belle (Beauty and the Beast)',
      thumbnail: 'https://img.youtube.com/vi/hky2ggpPM88/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-13',
      youtubeId: 'aeJQsbPAEhc',
      title: 'How to Draw Cinderella',
      thumbnail: 'https://img.youtube.com/vi/aeJQsbPAEhc/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-14',
      youtubeId: 'RWtrnnvNBGc',
      title: 'How To Draw A Cartoon Mouse',
      thumbnail: 'https://img.youtube.com/vi/RWtrnnvNBGc/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-15',
      youtubeId: 'UDzGI6KFBrY',
      title: 'How to Draw a Penguin (Beginner)',
      thumbnail: 'https://img.youtube.com/vi/UDzGI6KFBrY/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-16',
      youtubeId: 'eEenczJV_l8',
      title: 'How to Draw a Penguin | Easy Step-by-Step',
      thumbnail: 'https://img.youtube.com/vi/eEenczJV_l8/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-17',
      youtubeId: 'MilR2D3cJRY',
      title: 'How To Draw A Cartoon Penguin',
      thumbnail: 'https://img.youtube.com/vi/MilR2D3cJRY/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-18',
      youtubeId: 'tQNbRUuzLXw',
      title: 'How to Draw a Horse',
      thumbnail: 'https://img.youtube.com/vi/tQNbRUuzLXw/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-19',
      youtubeId: 'l_4ZAq5zyJM',
      title: 'How to Draw Bluey the Puppy (Disney)',
      thumbnail: 'https://img.youtube.com/vi/l_4ZAq5zyJM/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-20',
      youtubeId: 'laVebaRmKdA',
      title: 'How To Draw A Cartoon Horse',
      thumbnail: 'https://img.youtube.com/vi/laVebaRmKdA/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-21',
      youtubeId: 'mSAlNhm0F-8',
      title: 'Horse Drawing from 243 Number',
      thumbnail: 'https://img.youtube.com/vi/mSAlNhm0F-8/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-22',
      youtubeId: 'cDlA1QmDVUs',
      title: 'How to Draw a Horse Rider',
      thumbnail: 'https://img.youtube.com/vi/cDlA1QmDVUs/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-23',
      youtubeId: 'YPB2R8YqWXc',
      title: 'How to draw a cat! (Kids)',
      thumbnail: 'https://img.youtube.com/vi/YPB2R8YqWXc/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-24',
      youtubeId: 'nuyrn3WWDKA',
      title: 'How to Draw a Cow - Easy',
      thumbnail: 'https://img.youtube.com/vi/nuyrn3WWDKA/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-25',
      youtubeId: 'cZrQRg-yWS0',
      title: 'How To Draw A Frog Prince',
      thumbnail: 'https://img.youtube.com/vi/cZrQRg-yWS0/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-26',
      youtubeId: 'CGXCyzcXsYk',
      title: 'How To Draw A Cute Cupcake Monster Folding Surprise',
      thumbnail: 'https://img.youtube.com/vi/CGXCyzcXsYk/maxresdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-27',
      youtubeId: '21jWNVrcrw4',
      title: 'How To Draw A Mario Mushroom',
      thumbnail: 'https://img.youtube.com/vi/21jWNVrcrw4/maxresdefault.jpg',
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