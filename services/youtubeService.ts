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
    },
    {
      id: 'drawing-28',
      youtubeId: 'r6cJl89axqY',
      title: 'How To Draw A Cute Unicorn',
      thumbnail: 'https://i.ytimg.com/vi/r6cJl89axqY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-29',
      youtubeId: '9Eg-rk2P1Ks',
      title: 'How To Draw A Unicorn - Preschool',
      thumbnail: 'https://i.ytimg.com/vi/9Eg-rk2P1Ks/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'yoga-7',
      youtubeId: 'oLC13hFePTc',
      title: 'Morning Yoga! Stretch, breathe, sing along and greet the day with @yogapalooza!',
      thumbnail: 'https://i.ytimg.com/vi/oLC13hFePTc/hqdefault.jpg',
      category: 'yoga'
    }
  ,
    {
      id: 'drawing-30',
      youtubeId: 'KRAarF177Y4',
      title: 'How To Draw A Dragon',
      thumbnail: 'https://i.ytimg.com/vi/KRAarF177Y4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-31',
      youtubeId: '4lc82nvj7bo',
      title: 'How To Draw A Funny Summer Dragon',
      thumbnail: 'https://i.ytimg.com/vi/4lc82nvj7bo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-32',
      youtubeId: 'O0_2y4G6eAs',
      title: 'How To Draw A Funny Turkey',
      thumbnail: 'https://img.youtube.com/vi/O0_2y4G6eAs/maxresdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'yoga-8',
      youtubeId: 'a6wrKLFLLeI',
      title: '✨ New Demon Hunters K-Pop Songs You’ve Never Heard 🎵 – Yoga & Chill 🧘‍♀️💜Brain Break✨',
      thumbnail: 'https://i.ytimg.com/vi/a6wrKLFLLeI/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-9',
      youtubeId: 'OXdRnk6gM_E',
      title: '🎃WEDNESDAY YOGA🧘🏻‍♀️🖤Halloween Cosmic Kids Yoga! Relaxing Addams family Brain break for students',
      thumbnail: 'https://i.ytimg.com/vi/OXdRnk6gM_E/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-10',
      youtubeId: '3WM5MXc1b2E',
      title: '🌞 Summer Yoga by the Pool! 🧘‍♂️🌴 Brain Break to Stay Cool 🌞 Fun Poses for Kids 🐶 ft. Bluey and Bingo',
      thumbnail: 'https://i.ytimg.com/vi/3WM5MXc1b2E/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-11',
      youtubeId: 'CLwlqj_Vp3k',
      title: '🌞 Summer Yoga Brain Break with Sonic & Friends 🌀🧘‍♂️ | Relaxing Sonic World Music 🎵',
      thumbnail: 'https://i.ytimg.com/vi/CLwlqj_Vp3k/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-12',
      youtubeId: 'COQL4nmV4gA',
      title: '🔵STITCH YOGA🌸Calming yoga for kids🏖️ Lilo & Stitch Summer Brain Break🧘🏽‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/COQL4nmV4gA/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-13',
      youtubeId: 'mwna2yhrvsE',
      title: '☀️FROZEN YOGA🧘‍♀️Calming yoga for kids🏖️ Summer Brain Break✨ Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/mwna2yhrvsE/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-14',
      youtubeId: 'gAqYFZo2Pmw',
      title: '🐞LADYBUG YOGA for Kids! 🧘‍♀️ Fun Brain Break on the Rooftops of Paris!🇫🇷🗼',
      thumbnail: 'https://i.ytimg.com/vi/gAqYFZo2Pmw/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-15',
      youtubeId: 'UctMlcgsc0g',
      title: '🍎 SNOW WHITE & The Seven Dwarfs Yoga 🧘‍♀️ | Relaxing Cosmic Yoga for Kids! 🍎✨ Brain Break 🌿',
      thumbnail: 'https://i.ytimg.com/vi/UctMlcgsc0g/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-16',
      youtubeId: 'vKuy6pH0Uh8',
      title: '🔵Yoga for Kids with Bluey and Friends! 🐾🧘‍♂️ Fun and Relaxing Brain Break!',
      thumbnail: 'https://i.ytimg.com/vi/vKuy6pH0Uh8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-17',
      youtubeId: 'j5RP53eZzCg',
      title: '🔵INSIDE OUT 2 YOGA🟣Calming yoga for kids | Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/j5RP53eZzCg/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-18',
      youtubeId: 'EUfwa2oprxw',
      title: '🌹BEAUTY and the BEAST YOGA🧘‍♂️Read the Love story | Reading practise | Brain Break for kids',
      thumbnail: 'https://i.ytimg.com/vi/EUfwa2oprxw/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-19',
      youtubeId: 'Xqp55rTw_Zg',
      title: 'DISNEY PRINCESS YOGA 🧘‍♀️ calming yoga for kids | Valentine’s day Brain Break | Cosmic GoNoodle',
      thumbnail: 'https://i.ytimg.com/vi/Xqp55rTw_Zg/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-20',
      youtubeId: 'yU-k5zYFW-8',
      title: '🌻BARBIE SPRING YOGA 🌻🧘‍♀️ calming yoga for kids | Brain Break | Danny Go Noodle inspired🌻',
      thumbnail: 'https://i.ytimg.com/vi/yU-k5zYFW-8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-21',
      youtubeId: 'c0Xb5TK5mYg',
      title: '🧘‍♀️🐰Easter Yoga Brain Break with Barbie | Fun & Relaxing Moves for kids! 🎀🌸',
      thumbnail: 'https://i.ytimg.com/vi/c0Xb5TK5mYg/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-22',
      youtubeId: 'gK4Ot-tUaqs',
      title: '💕Frozen Yoga ❄️🧘‍♀️Valentine’s day calming yoga for kids💕Brain Break💕Relaxing cosmic yoga❄️💕Elsa',
      thumbnail: 'https://i.ytimg.com/vi/gK4Ot-tUaqs/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-23',
      youtubeId: 'cvKGxllxJC8',
      title: '☀️Lion King Yoga 🦁: A Wild Adventure to Inner Peace! Brain Break for kids 🌅Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/cvKGxllxJC8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-24',
      youtubeId: 'zHAL_2Ao26U',
      title: '🍀FROZEN YOGA 🧘‍♀️ calming yoga for kids | St. Patrick’s Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/zHAL_2Ao26U/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-25',
      youtubeId: '8U-X4cgXD9Q',
      title: '🟢 GRINCH CHRISTMAS YOGA🧘‍♀️ calming yoga for kids | Winter Brain Break | Danny Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/8U-X4cgXD9Q/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-26',
      youtubeId: '71uTdpWO-W0',
      title: '❄️Frozen Yoga ❄️ Winter fun☃️Elsa, Anna, Olaf & Kristoff ❄️🧘 Christmas Brain break for kids!🎄',
      thumbnail: 'https://i.ytimg.com/vi/71uTdpWO-W0/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-27',
      youtubeId: 'RZpebeUPc7s',
      title: '🔴​MARIO CHRISTMAS YOGA 🧘‍♀️ calming yoga for kids | Winter Brain Break | Cosmic GoNoodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/RZpebeUPc7s/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-28',
      youtubeId: 'I-7MrePivNE',
      title: '🌀SONIC WINTER YOGA 🧘‍♀️ calming yoga for kids | Christmas Brain Break | Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/I-7MrePivNE/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-29',
      youtubeId: 'O7qi1arcr_I',
      title: '❄️FROZEN YOGA 🧘‍♀️ calming yoga for kids | Brain Break | Cosmic kids Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/O7qi1arcr_I/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-30',
      youtubeId: 'WeWDGdrI9nc',
      title: '🟢 GRINCH CHRISTMAS YOGA🧘‍♀️ calming yoga for kids | Winter Brain Break | Go Noodle inspired🎄',
      thumbnail: 'https://i.ytimg.com/vi/WeWDGdrI9nc/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-31',
      youtubeId: 'eNev0X6yo6Y',
      title: 'MALEFICENT YOGA🧘‍♀️🖤HALLOWEEN brain break for kids🎃 Spooky Relaxing Cosmic Yoga!🦇',
      thumbnail: 'https://i.ytimg.com/vi/eNev0X6yo6Y/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-32',
      youtubeId: '05lBMRLZhwg',
      title: '💀Halloween Yoga with Jack Skellington & Sally 🎃🧘‍♂️ Spooky Stretches for a Fang-tastic Flow!',
      thumbnail: 'https://i.ytimg.com/vi/05lBMRLZhwg/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-33',
      youtubeId: 'FluFdtJXZC8',
      title: '🌵COCO’s Cinco de Mayo YOGA 🎉🌮Brain Break for Kids | relaxing yoga for all🪇Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/FluFdtJXZC8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-34',
      youtubeId: 'ZAEVnH6yIDU',
      title: 'Halloween Yoga with Harley Quinn | 🧘‍♀️🖤🎃 A Wickedly Fun Cosmic Yoga Adventure! Brain break for kids',
      thumbnail: 'https://i.ytimg.com/vi/ZAEVnH6yIDU/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-35',
      youtubeId: '5y1nYMfU7is',
      title: '🚨MEGA MINION’s YOGA! 🦸‍♂️Despicable me 4 BRAIN BREAK💪Relaxing yoga for kids 🧘‍♀️Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/5y1nYMfU7is/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-36',
      youtubeId: 'DCaxhfe1aP8',
      title: '🏫Back to School Yoga with FROZEN❄️🧘‍♀️🎒✨ Relaxing Yoga for kids | Brain break for children',
      thumbnail: 'https://i.ytimg.com/vi/DCaxhfe1aP8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-37',
      youtubeId: 'jUVoMyZ9TfE',
      title: '⛩️Mulan Yoga🧘‍♀️🌸🌞 Relaxing Cosmic Yoga for kids! Summer Brain Break | Danny Go Noodle inspired💫',
      thumbnail: 'https://i.ytimg.com/vi/jUVoMyZ9TfE/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-38',
      youtubeId: 'Z6VezbNy9pI',
      title: '🧘‍♀️BRAVE YOGA🌸Calming yoga for kids🏖️ Summer Brain Break🏹Danny Go Noodle Merida inspired',
      thumbnail: 'https://i.ytimg.com/vi/Z6VezbNy9pI/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-39',
      youtubeId: 'cqHP1HBug-k',
      title: '🌟Rapunzel YOGA🧘‍♀️🌴✨ Fun Kids Yoga Adventure! 🌊 Summer Tangled Brain Break | Danny Go Noodle 💫',
      thumbnail: 'https://i.ytimg.com/vi/cqHP1HBug-k/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-40',
      youtubeId: '9AuhuNBSgCs',
      title: '🧘‍♀️MOANA YOGA🌸Calming yoga for kids🏖️ Summer Brain Break🌊Danny Go Noodle Maui inspired',
      thumbnail: 'https://i.ytimg.com/vi/9AuhuNBSgCs/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-41',
      youtubeId: 'XQIuhXJ5GWA',
      title: '🧞‍♂️JASMINE YOGA🌸Aladdin 🕌 Calming yoga for kids🧘🏽‍♀️Summer Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/XQIuhXJ5GWA/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-42',
      youtubeId: 'LpZ7BqA6exE',
      title: '🐼 KUNG FU PANDA 4 YOGA 🧘‍♀️ calming yoga for kids | St. Patrick’s day Brain Break | GoNoodle',
      thumbnail: 'https://i.ytimg.com/vi/LpZ7BqA6exE/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-43',
      youtubeId: 'u98dNiWaWyk',
      title: '🌸Frozen Spring Yoga🌸Brain Break | Calming yoga for kids | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/u98dNiWaWyk/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-44',
      youtubeId: 'ZTf_G9EsrFM',
      title: '🐰🌸FROZEN YOGA 🧘‍♀️ calming yoga for kids | Easter Bunny Brain Break | Danny Go Noodle inspired🌸',
      thumbnail: 'https://i.ytimg.com/vi/ZTf_G9EsrFM/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-45',
      youtubeId: 'WaPJDvQWH1w',
      title: '🐢 TMNT Yoga! Ninja Turtles Relaxing yoga for kids🧘‍♂️🌟 Brain Break 🐢 Danny go Noodle inspired💫',
      thumbnail: 'https://i.ytimg.com/vi/WaPJDvQWH1w/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-46',
      youtubeId: 'yhUB0a8UlgI',
      title: '✨Star Wars Yoga May the 4th! 🌟🧘‍♂️Bluey Brain Break for kids | Relaxing yoga for all✨',
      thumbnail: 'https://i.ytimg.com/vi/yhUB0a8UlgI/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-47',
      youtubeId: '5upPfUE0OkI',
      title: '✨Star Wars YOGA | Mandalorian baby yoda Bluey🌟🧘‍♂️ | Brain Break | Relaxing cosmic yoga for kids✨',
      thumbnail: 'https://i.ytimg.com/vi/5upPfUE0OkI/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-48',
      youtubeId: 'czYLT3Oj9aY',
      title: '🔴POKEMON YOGA 🧘‍♀️ calming yoga for kids | Brain Break | Cosmic Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/czYLT3Oj9aY/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-49',
      youtubeId: 'cfc39k6O05Q',
      title: '🌍Simpsons Earth Day Yoga Session 🧘‍♀️ Brain Break | Calming yoga for kids | Cosmic Yoga inspired🧘‍♀️',
      thumbnail: 'https://i.ytimg.com/vi/cfc39k6O05Q/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-50',
      youtubeId: 'osYWVaxqd8s',
      title: '🟡SPONGE BOB YOGA🐙🧘‍♂️🌊 Relaxing Yoga for kids and all!🍍Brain Break | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/osYWVaxqd8s/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-51',
      youtubeId: 'TPmJWXJrr6Q',
      title: '🔵INSIDE OUT 2 RACES🟣FEELINGS game for kids | Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/TPmJWXJrr6Q/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-52',
      youtubeId: 'KGbpI98nmEo',
      title: '👑 YOGA with Princess TIANA and the Frog | 🧘‍♀️🐸✨ Fun Brain Break for Kids | Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/KGbpI98nmEo/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-53',
      youtubeId: 'jjoBKc0MnQ8',
      title: '🧊Frozen’s Feelings from Inside Out 2!❄️✨ Brain Break for Kids! Just dance🌟',
      thumbnail: 'https://i.ytimg.com/vi/jjoBKc0MnQ8/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-54',
      youtubeId: 'Eje2boTbAZA',
      title: 'Halloween Yoga with Jack O’Lantern 🎃🧘Spooky Brain break for kids | Fun relaxing cosmic yoga!',
      thumbnail: 'https://i.ytimg.com/vi/Eje2boTbAZA/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-55',
      youtubeId: 'JBQ1Qhas69o',
      title: '🔵Inside Out Party with Joy: Feelings, Workout & Yoga for Kids! 🎭❄️🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/JBQ1Qhas69o/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-56',
      youtubeId: 'GVX4m4Y4R30',
      title: '🔴RUDOLPH YOGA🎄Christmas Brain break for kids 🦌Relaxing Cosmic Yoga | Danny Go Noodle',
      thumbnail: 'https://i.ytimg.com/vi/GVX4m4Y4R30/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-57',
      youtubeId: '3vyBk_wT0q4',
      title: '🎉12-Minute Rudolph Party: Freeze Dance & Yoga Fun for Kids! 🎄🦌Christmas Brain Break | Just Dance',
      thumbnail: 'https://i.ytimg.com/vi/3vyBk_wT0q4/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-58',
      youtubeId: 'HXys2IeAR7Y',
      title: '🔴INSIDE OUT 2 RACES🟣FEELINGS game for kids | Valentine’s day Brain Break🧘‍♀️Danny Go Noodle inspired',
      thumbnail: 'https://i.ytimg.com/vi/HXys2IeAR7Y/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-59',
      youtubeId: 'wh9dRFUM42c',
      title: '❤️Valentine\'s Day Fun with Bluey: Would You Rather, Freeze Dance & Yoga! 💖🎉 JUST DANCE | 20 min!🕺❤️',
      thumbnail: 'https://i.ytimg.com/vi/wh9dRFUM42c/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-60',
      youtubeId: '2Nud9QJTyeQ',
      title: '4️⃣The Fantastic Four! 💪💙 | Yoga, Games & Dance Party! Brain break for kids ft. Bluey',
      thumbnail: 'https://i.ytimg.com/vi/2Nud9QJTyeQ/hqdefault.jpg',
      category: 'yoga'
    },
    {
      id: 'yoga-61',
      youtubeId: 'cR9mGcb4joA',
      title: '✨ The MOST Fun Gabby’s Dollhouse Brain Break Ever! 🧘‍♀️🎾🐱Yoga, Games & more with Mister Alonso 🎉🐱',
      thumbnail: 'https://i.ytimg.com/vi/cR9mGcb4joA/hqdefault.jpg',
      category: 'yoga'
    }
  ,
    {
      id: 'drawing-33',
      youtubeId: 'ezegUT9U6fM',
      title: 'How To Draw A Cartoon Cow',
      thumbnail: 'https://i.ytimg.com/vi/ezegUT9U6fM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-34',
      youtubeId: 'Pu7v_3qUfs8',
      title: 'How To Draw A Pig For Young Artists',
      thumbnail: 'https://i.ytimg.com/vi/Pu7v_3qUfs8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-35',
      youtubeId: 'rLk0uovLscQ',
      title: 'How To Draw A Chicken (for super young artists)',
      thumbnail: 'https://i.ytimg.com/vi/rLk0uovLscQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-36',
      youtubeId: 'tpwyCVfKe_A',
      title: 'How To Draw A Cartoon Turkey',
      thumbnail: 'https://i.ytimg.com/vi/tpwyCVfKe_A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-37',
      youtubeId: 'tpwyCVfKe_A',
      title: 'How To Draw A Cartoon Turkey',
      thumbnail: 'https://i.ytimg.com/vi/tpwyCVfKe_A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-38',
      youtubeId: '-03ZYb-Qpec',
      title: 'How To Draw A Turkey',
      thumbnail: 'https://i.ytimg.com/vi/-03ZYb-Qpec/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-39',
      youtubeId: 'nxatuBKGAVs',
      title: 'How To Draw Momma And Baby Ducks',
      thumbnail: 'https://i.ytimg.com/vi/nxatuBKGAVs/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-40',
      youtubeId: 'CfunFth2P1Y',
      title: 'How To Draw A Duck',
      thumbnail: 'https://i.ytimg.com/vi/CfunFth2P1Y/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-41',
      youtubeId: 'rAgBdvTMjvg',
      title: 'How To Draw A Cartoon Sheep',
      thumbnail: 'https://i.ytimg.com/vi/rAgBdvTMjvg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-42',
      youtubeId: 'il-2SmoQS7Y',
      title: 'How To Draw A Funny Scarecrow',
      thumbnail: 'https://i.ytimg.com/vi/il-2SmoQS7Y/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-43',
      youtubeId: 'kTt0Iid6YFE',
      title: 'How To Draw A Cute Cartoon Goat',
      thumbnail: 'https://i.ytimg.com/vi/kTt0Iid6YFE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-44',
      youtubeId: '5GOFwmqQ7oU',
      title: 'How To Draw A Cartoon Baby Chick',
      thumbnail: 'https://i.ytimg.com/vi/5GOFwmqQ7oU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-45',
      youtubeId: 'TMCYgdFPt-k',
      title: 'How To Draw A Donkey - Nativity',
      thumbnail: 'https://i.ytimg.com/vi/TMCYgdFPt-k/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-46',
      youtubeId: 'hTNzh5gyOIc',
      title: 'Drawing A Pig Using Shapes - Preschool',
      thumbnail: 'https://i.ytimg.com/vi/hTNzh5gyOIc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-47',
      youtubeId: 'lrKMn__pnKo',
      title: 'How To Draw A Barn (farm) 👩‍🌾',
      thumbnail: 'https://i.ytimg.com/vi/lrKMn__pnKo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-48',
      youtubeId: 'jNawjZ40pOY',
      title: 'How To Draw An Ox',
      thumbnail: 'https://i.ytimg.com/vi/jNawjZ40pOY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-49',
      youtubeId: 'UhwIN1e4rEY',
      title: 'How To Draw A Duck - Preschool',
      thumbnail: 'https://i.ytimg.com/vi/UhwIN1e4rEY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-50',
      youtubeId: 'H0yCGmZf-GU',
      title: 'How To Draw A Farm Truck With Pumpkins',
      thumbnail: 'https://i.ytimg.com/vi/H0yCGmZf-GU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-51',
      youtubeId: 'aW9OA4ot00o',
      title: 'How To Draw A Funny Cartoon Turkey In Disguise',
      thumbnail: 'https://i.ytimg.com/vi/aW9OA4ot00o/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-52',
      youtubeId: 'YysRjvVW_8M',
      title: 'How To Draw A Chicken - Mom And Baby - Preschool',
      thumbnail: 'https://i.ytimg.com/vi/YysRjvVW_8M/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-53',
      youtubeId: 'Gr4hqOSg598',
      title: 'How To Draw A Horse - Preschool',
      thumbnail: 'https://i.ytimg.com/vi/Gr4hqOSg598/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-54',
      youtubeId: 'ZX9NxiPmDI4',
      title: 'How To Draw A Highland Cow Blowing Bubble Gum Bubble',
      thumbnail: 'https://i.ytimg.com/vi/ZX9NxiPmDI4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-55',
      youtubeId: 'NfyDG7obGoE',
      title: 'How To Draw A Fall Goose',
      thumbnail: 'https://i.ytimg.com/vi/NfyDG7obGoE/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-56',
      youtubeId: 'WoV4f1ncE7U',
      title: 'How To Draw Pikachu (with color)',
      thumbnail: 'https://i.ytimg.com/vi/WoV4f1ncE7U/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-57',
      youtubeId: '4BFzt5i1jXA',
      title: 'How To Draw A Poké Ball Folding Surprise',
      thumbnail: 'https://i.ytimg.com/vi/4BFzt5i1jXA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-58',
      youtubeId: 'xV2n-KUeltc',
      title: 'How To Draw A Poké Ball From Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/xV2n-KUeltc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-59',
      youtubeId: '1zX0hLFrlbQ',
      title: 'How To Draw Ash Ketchum From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/1zX0hLFrlbQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-60',
      youtubeId: 'S8DfLCsWxc0',
      title: 'How To Draw Mew From Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/S8DfLCsWxc0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-61',
      youtubeId: 'HXW6W1eVo3c',
      title: 'How To Draw Eevee Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/HXW6W1eVo3c/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-62',
      youtubeId: '6IeaiSVU7Cc',
      title: 'How To Draw Squirtle',
      thumbnail: 'https://i.ytimg.com/vi/6IeaiSVU7Cc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-63',
      youtubeId: 'hbo1WnqlMrc',
      title: 'How To Draw Charmander + Pokemon Giveaway',
      thumbnail: 'https://i.ytimg.com/vi/hbo1WnqlMrc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-64',
      youtubeId: '8Hi-04JwsuM',
      title: 'How To Draw Blastoise From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/8Hi-04JwsuM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-65',
      youtubeId: 'nye7BaaRW8g',
      title: 'How To Draw Mega Gyarados Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/nye7BaaRW8g/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-66',
      youtubeId: 'V2wfQyCN6B8',
      title: 'How To Draw Frogadier Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/V2wfQyCN6B8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-67',
      youtubeId: 'K48siVDktpI',
      title: 'How To Draw Bulbasaur Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/K48siVDktpI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-68',
      youtubeId: 'J5Q35SLMezY',
      title: 'How To Draw Snorlax Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/J5Q35SLMezY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-69',
      youtubeId: 'ASjXtCp51M4',
      title: 'How To Draw Jigglypuff',
      thumbnail: 'https://i.ytimg.com/vi/ASjXtCp51M4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-70',
      youtubeId: 'U4uf_F6JY1M',
      title: 'How To Draw Mewtwo',
      thumbnail: 'https://i.ytimg.com/vi/U4uf_F6JY1M/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-71',
      youtubeId: 'fx1cYZfDh8U',
      title: 'How To Draw Gengar Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/fx1cYZfDh8U/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-72',
      youtubeId: '9k1pbD03_d0',
      title: 'How To Draw Pokemon Detective Pikachu',
      thumbnail: 'https://i.ytimg.com/vi/9k1pbD03_d0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-73',
      youtubeId: 'vsjzWTfP7iE',
      title: 'How To Draw Scorbunny Pokemon From Sword And Shield',
      thumbnail: 'https://i.ytimg.com/vi/vsjzWTfP7iE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-74',
      youtubeId: 'EcF9856AUQM',
      title: 'How To Draw Pichu Pokemon - NEW BLUE TABLE',
      thumbnail: 'https://i.ytimg.com/vi/EcF9856AUQM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-75',
      youtubeId: 'gPpuLnCIwOM',
      title: 'How To Draw Litten Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/gPpuLnCIwOM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-76',
      youtubeId: 'j3RafPJ3iWY',
      title: 'How To Draw Vaporeon Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/j3RafPJ3iWY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-77',
      youtubeId: 'hXTpdKLh-64',
      title: 'How To Draw Meowth Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/hXTpdKLh-64/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-78',
      youtubeId: 'pa-tg0C-6fo',
      title: 'How To Draw Quaxly Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/pa-tg0C-6fo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-79',
      youtubeId: 'CBjTZBRCas8',
      title: 'How To Draw Diglett From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/CBjTZBRCas8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-80',
      youtubeId: 'GwfNncN9Muw',
      title: 'How To Draw Fennekin Pokemon (Toy Giveaway)',
      thumbnail: 'https://i.ytimg.com/vi/GwfNncN9Muw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-81',
      youtubeId: 'zsrFZMVxBs8',
      title: 'How To Draw Sprigatito Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/zsrFZMVxBs8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-82',
      youtubeId: 'yn_hiXj5jVw',
      title: 'How To Draw Lapras',
      thumbnail: 'https://i.ytimg.com/vi/yn_hiXj5jVw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-83',
      youtubeId: 'KpUquUAUR9I',
      title: 'How To Draw Grookey Pokemon From Sword And Shield',
      thumbnail: 'https://i.ytimg.com/vi/KpUquUAUR9I/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-84',
      youtubeId: 'DIX6WIcd1mc',
      title: 'How To Draw A Cubone Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/DIX6WIcd1mc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-85',
      youtubeId: 'vDnuJEtaxnE',
      title: 'How To Draw Torchic Pokemon + Toy Giveaway',
      thumbnail: 'https://i.ytimg.com/vi/vDnuJEtaxnE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-86',
      youtubeId: 'QbcXQqZX1ew',
      title: 'How To Draw Oddish Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/QbcXQqZX1ew/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-87',
      youtubeId: 't-ZEi0gXmkw',
      title: 'How To Draw Fall Pikachu',
      thumbnail: 'https://i.ytimg.com/vi/t-ZEi0gXmkw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-88',
      youtubeId: 'DBnSpOXlepo',
      title: 'How To Draw Popplio Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/DBnSpOXlepo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-89',
      youtubeId: 'LEIFiHRbl60',
      title: 'How To Draw Sobble Pokémon From Sword And Shield',
      thumbnail: 'https://i.ytimg.com/vi/LEIFiHRbl60/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-90',
      youtubeId: 'bPRSmPbA3Wg',
      title: 'How To Draw Fuecoco Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/bPRSmPbA3Wg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-91',
      youtubeId: 'BxFiQvoqjSw',
      title: 'How To Draw Zubat From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/BxFiQvoqjSw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-92',
      youtubeId: 'fuSTL99GTR4',
      title: 'How To Draw Alola Vulpix',
      thumbnail: 'https://i.ytimg.com/vi/fuSTL99GTR4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-93',
      youtubeId: '6MiS12zGOkI',
      title: 'How To Draw A Froakie Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/6MiS12zGOkI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-94',
      youtubeId: 'nhj6qfhOIp4',
      title: 'How To Draw Minccino Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/nhj6qfhOIp4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-95',
      youtubeId: 'MMCT8xqebZY',
      title: 'How To Draw Beedrill Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/MMCT8xqebZY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-96',
      youtubeId: 'gERFI27EcCw',
      title: 'How To Fold Pikachu',
      thumbnail: 'https://i.ytimg.com/vi/gERFI27EcCw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-97',
      youtubeId: 'YpekLNkWRNw',
      title: 'How To Draw Marill Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/YpekLNkWRNw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-98',
      youtubeId: 'z6mq2FWrK-g',
      title: 'How To Draw Chespin From Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/z6mq2FWrK-g/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-99',
      youtubeId: '3Dj7rmHWV14',
      title: 'How To Draw Weedle Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/3Dj7rmHWV14/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-100',
      youtubeId: 'eI_d7fkwqIw',
      title: 'How To Draw Kakuna Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/eI_d7fkwqIw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-101',
      youtubeId: '9CtryYZpYZ4',
      title: 'How To Draw A Golbat Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/9CtryYZpYZ4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-102',
      youtubeId: 'eB1IZSPF2IQ',
      title: 'How To Draw Furret Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/eB1IZSPF2IQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-103',
      youtubeId: 'rDOWeio-lSc',
      title: 'How To Draw Oshawott',
      thumbnail: 'https://i.ytimg.com/vi/rDOWeio-lSc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-104',
      youtubeId: '6sA8-es7Yx0',
      title: 'How To Draw Togepi Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/6sA8-es7Yx0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-105',
      youtubeId: 'Y_x9DOgmnVY',
      title: 'How To Draw Pikipek Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/Y_x9DOgmnVY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-106',
      youtubeId: 'O59Fr2rJ_O4',
      title: 'How To Draw Parasect Pokémon',
      thumbnail: 'https://i.ytimg.com/vi/O59Fr2rJ_O4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-107',
      youtubeId: 'IZVA3jTh5MQ',
      title: 'How To Draw Emolga Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/IZVA3jTh5MQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-108',
      youtubeId: 'BWLLwOsoBis',
      title: 'How To Draw Caterpie Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/BWLLwOsoBis/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-109',
      youtubeId: 'LIKBKiF5cTc',
      title: 'How To Draw Seaking Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/LIKBKiF5cTc/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-110',
      youtubeId: 'exnB0L_AVU4',
      title: 'How To Draw A Mario Piranha Plant',
      thumbnail: 'https://i.ytimg.com/vi/exnB0L_AVU4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-111',
      youtubeId: 'u6qZDv8v2fQ',
      title: 'How To Draw Toad From Mario (With Body)',
      thumbnail: 'https://i.ytimg.com/vi/u6qZDv8v2fQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-112',
      youtubeId: 'JwSVs1aRs9A',
      title: 'How To Draw King Boo From Mario',
      thumbnail: 'https://i.ytimg.com/vi/JwSVs1aRs9A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-113',
      youtubeId: 'El1G0ZAZqkg',
      title: 'How To Draw Clash Royale Minion',
      thumbnail: 'https://i.ytimg.com/vi/El1G0ZAZqkg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-114',
      youtubeId: 'HdyD2kT692E',
      title: 'How To Draw Shy Guy From Mario!',
      thumbnail: 'https://i.ytimg.com/vi/HdyD2kT692E/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-115',
      youtubeId: 'KNprO-8tx5g',
      title: 'How To Draw Stampy',
      thumbnail: 'https://i.ytimg.com/vi/KNprO-8tx5g/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-116',
      youtubeId: 'cBu6gjZkFXg',
      title: 'How To Draw Red From Angry Birds',
      thumbnail: 'https://i.ytimg.com/vi/cBu6gjZkFXg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-117',
      youtubeId: '4eIMePaqk5A',
      title: 'How To Draw Toon Link',
      thumbnail: 'https://i.ytimg.com/vi/4eIMePaqk5A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-118',
      youtubeId: 'FObW5ynBbVg',
      title: 'How To Draw Princess Peach',
      thumbnail: 'https://i.ytimg.com/vi/FObW5ynBbVg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-119',
      youtubeId: 'ydFoc-taX9c',
      title: 'How To Draw Mega Man',
      thumbnail: 'https://i.ytimg.com/vi/ydFoc-taX9c/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-120',
      youtubeId: 'klso11V6NTk',
      title: 'How To Draw Pac-Man',
      thumbnail: 'https://i.ytimg.com/vi/klso11V6NTk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-121',
      youtubeId: 'hQR_HkQEUkI',
      title: 'How To Draw A Creeper (New)',
      thumbnail: 'https://i.ytimg.com/vi/hQR_HkQEUkI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-122',
      youtubeId: '3yBzZ0kTYcU',
      title: 'How To Draw A Minecraft Wolf (dog)',
      thumbnail: 'https://i.ytimg.com/vi/3yBzZ0kTYcU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-123',
      youtubeId: 'ZpDszIAvtdw',
      title: 'How To Draw A Sunflower (Plants vs. Zombies)',
      thumbnail: 'https://i.ytimg.com/vi/ZpDszIAvtdw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-124',
      youtubeId: 'EssAMxLuNgU',
      title: 'How To Draw Om Nom',
      thumbnail: 'https://i.ytimg.com/vi/EssAMxLuNgU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-125',
      youtubeId: 'T37o30V69YQ',
      title: 'How To Draw Sonic The Hedgehog',
      thumbnail: 'https://i.ytimg.com/vi/T37o30V69YQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-126',
      youtubeId: '46eOue7WMsQ',
      title: 'How To Draw Bowser',
      thumbnail: 'https://i.ytimg.com/vi/46eOue7WMsQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-127',
      youtubeId: '2qONTgGRGIc',
      title: 'How To Draw A Peashooter (Plants vs Zombies)',
      thumbnail: 'https://i.ytimg.com/vi/2qONTgGRGIc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-128',
      youtubeId: 'ovVJuT4FFyk',
      title: 'How To Draw A Zombie (Plants vs Zombies)',
      thumbnail: 'https://i.ytimg.com/vi/ovVJuT4FFyk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-129',
      youtubeId: 'IrQ_BcEAR3A',
      title: 'How To Draw Kirby',
      thumbnail: 'https://i.ytimg.com/vi/IrQ_BcEAR3A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-130',
      youtubeId: 'b4N8fMSDNIk',
      title: 'How To Draw Toad From Mario',
      thumbnail: 'https://i.ytimg.com/vi/b4N8fMSDNIk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-131',
      youtubeId: 'ir9foPjmB2s',
      title: 'How To Draw A Ghast',
      thumbnail: 'https://i.ytimg.com/vi/ir9foPjmB2s/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-132',
      youtubeId: 'Guc9Qkl2rps',
      title: 'How To Draw Enderman',
      thumbnail: 'https://i.ytimg.com/vi/Guc9Qkl2rps/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-133',
      youtubeId: 'UQxAFUcgXEE',
      title: 'How To Draw Yoshi',
      thumbnail: 'https://i.ytimg.com/vi/UQxAFUcgXEE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-134',
      youtubeId: 'Kchg3IK7mFM',
      title: 'How To Draw Luigi',
      thumbnail: 'https://i.ytimg.com/vi/Kchg3IK7mFM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-135',
      youtubeId: 'M8FFRmCwj5I',
      title: 'How To Draw A Pig From Minecraft',
      thumbnail: 'https://i.ytimg.com/vi/M8FFRmCwj5I/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-136',
      youtubeId: 'tWYhAy8K0Eg',
      title: 'How To Draw Mario',
      thumbnail: 'https://i.ytimg.com/vi/tWYhAy8K0Eg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-137',
      youtubeId: 'GjK8Jntgph4',
      title: 'How To Draw A Chicken From Minecraft',
      thumbnail: 'https://i.ytimg.com/vi/GjK8Jntgph4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-138',
      youtubeId: 'UNPJrxxJqdo',
      title: 'How To Draw Splatoon Inkling Squid 🦑',
      thumbnail: 'https://i.ytimg.com/vi/UNPJrxxJqdo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-139',
      youtubeId: 'P9AcwxT6FBE',
      title: 'How To Draw A Chug Jug From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/P9AcwxT6FBE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-140',
      youtubeId: 'GmzJ5-X2r68',
      title: 'How To Draw Brite Bomber From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/GmzJ5-X2r68/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-141',
      youtubeId: 'kiCd6jJm3c0',
      title: 'How To Draw The Fortnite Durr Burger',
      thumbnail: 'https://i.ytimg.com/vi/kiCd6jJm3c0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-142',
      youtubeId: 'GBKZHPvSYlA',
      title: 'How To Draw Pip Squeak Pickaxe From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/GBKZHPvSYlA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-143',
      youtubeId: '4xSwjtY0zq8',
      title: 'How To Draw A Sneaky Snowman Fortnite + Spotlight',
      thumbnail: 'https://i.ytimg.com/vi/4xSwjtY0zq8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-144',
      youtubeId: 'pBGmutQAim8',
      title: 'How To Draw Fortnite Ragnarok Mask',
      thumbnail: 'https://i.ytimg.com/vi/pBGmutQAim8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-145',
      youtubeId: '_udxrl1n2Sk',
      title: 'How To Draw Raven From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/_udxrl1n2Sk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-146',
      youtubeId: '6U-uMIyfptw',
      title: 'How To Draw Fortnite Bitemark Pickaxe - REPLAY DRAW ALONG!',
      thumbnail: 'https://i.ytimg.com/vi/6U-uMIyfptw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-147',
      youtubeId: 'EhiJpi-JCFw',
      title: 'How To Draw Fortnite Marshmello Skin',
      thumbnail: 'https://i.ytimg.com/vi/EhiJpi-JCFw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-148',
      youtubeId: 'dqompIaStZo',
      title: 'How To Draw Tomato Head Fortnite Skin (cartoon)',
      thumbnail: 'https://i.ytimg.com/vi/dqompIaStZo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-149',
      youtubeId: 'gWDMXeHke1E',
      title: 'How To Draw Cuddle Team Leader Fortnite Skin + Challenge Time',
      thumbnail: 'https://i.ytimg.com/vi/gWDMXeHke1E/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-150',
      youtubeId: 'h_485fqykeg',
      title: 'How To Draw Fortnite Slurp Juice Pickaxe',
      thumbnail: 'https://i.ytimg.com/vi/h_485fqykeg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-151',
      youtubeId: 'VfZpuQRQZn0',
      title: 'How To Draw Fortnite Rainbow Smash Pickaxe',
      thumbnail: 'https://i.ytimg.com/vi/VfZpuQRQZn0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-152',
      youtubeId: '8PhFwNjy4V0',
      title: 'How To Draw Fortnite Ice King',
      thumbnail: 'https://i.ytimg.com/vi/8PhFwNjy4V0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-153',
      youtubeId: '6HE3oUYc7EI',
      title: 'How To Draw DJ Yonder From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/6HE3oUYc7EI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-154',
      youtubeId: 'gtE325n5DRA',
      title: 'How To Draw The Skull Trooper From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/gtE325n5DRA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-155',
      youtubeId: 'hRaIW4HNjYw',
      title: 'How To Draw Omega Skin Fortnite Skin (cartoon)',
      thumbnail: 'https://i.ytimg.com/vi/hRaIW4HNjYw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-156',
      youtubeId: '2BCW7_2uYDg',
      title: 'How To Draw The Fortnite Battle Bus',
      thumbnail: 'https://i.ytimg.com/vi/2BCW7_2uYDg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-157',
      youtubeId: 'HKM08PhcpVk',
      title: 'How To Draw Drift From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/HKM08PhcpVk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-158',
      youtubeId: 'KOkpBux31Bs',
      title: 'How To Draw Spike From Brawl Stars',
      thumbnail: 'https://i.ytimg.com/vi/KOkpBux31Bs/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-159',
      youtubeId: 'bTBgTeCQ1B4',
      title: 'How To Draw The Loot Llama From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/bTBgTeCQ1B4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-160',
      youtubeId: 'VsSpgHtF0gA',
      title: 'How To Draw Fishstick From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/VsSpgHtF0gA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-161',
      youtubeId: 'rMTITetwbj4',
      title: 'How To Draw Rox Skin From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/rMTITetwbj4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-162',
      youtubeId: 'aTbXuZ_VcwE',
      title: 'How To Draw Vendetta Skin From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/aTbXuZ_VcwE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-163',
      youtubeId: 'gHNNHEHcK-A',
      title: 'How To Draw Eternal Voyager From Fortnite (Cartoon)',
      thumbnail: 'https://i.ytimg.com/vi/gHNNHEHcK-A/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-164',
      youtubeId: 'PmtQ5Hq0FBU',
      title: 'How To Draw Catalyst From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/PmtQ5Hq0FBU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-165',
      youtubeId: '8hGCTHlhre4',
      title: 'How To Draw X-Lord From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/8hGCTHlhre4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-166',
      youtubeId: 'ij2xlhZ0Plo',
      title: 'How To Draw Rippley From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/ij2xlhZ0Plo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-167',
      youtubeId: 'NaEhsisXYb0',
      title: 'How To Draw Monks From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/NaEhsisXYb0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-168',
      youtubeId: 'aW-IGuxnO24',
      title: 'How To Draw Bull Shark From Fortnite',
      thumbnail: 'https://i.ytimg.com/vi/aW-IGuxnO24/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-169',
      youtubeId: 'E3XYrY2QwW8',
      title: 'How To Draw A Game Boy',
      thumbnail: 'https://i.ytimg.com/vi/E3XYrY2QwW8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-170',
      youtubeId: 'WRkzm0hzo1M',
      title: 'How To Draw A Joystick',
      thumbnail: 'https://i.ytimg.com/vi/WRkzm0hzo1M/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-171',
      youtubeId: 'AQIx4UfYrJI',
      title: 'How To Draw Link From Zelda',
      thumbnail: 'https://i.ytimg.com/vi/AQIx4UfYrJI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-172',
      youtubeId: 'So1FLuARZUc',
      title: 'How To Draw Cappy The Hat From Mario Odyssey',
      thumbnail: 'https://i.ytimg.com/vi/So1FLuARZUc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-173',
      youtubeId: 'UA974Vlf8VA',
      title: 'How To Draw Gorilla Tag',
      thumbnail: 'https://i.ytimg.com/vi/UA974Vlf8VA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-174',
      youtubeId: 'jgVsw3Wv35c',
      title: 'How To Draw The Brawl Stars Logo',
      thumbnail: 'https://i.ytimg.com/vi/jgVsw3Wv35c/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-175',
      youtubeId: '-ViXpUYo3OU',
      title: 'How To Draw A Minecraft Sword',
      thumbnail: 'https://i.ytimg.com/vi/-ViXpUYo3OU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-176',
      youtubeId: 't9t9tv4xulg',
      title: 'How To Draw A Minecraft Creeper Face',
      thumbnail: 'https://i.ytimg.com/vi/t9t9tv4xulg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-177',
      youtubeId: 'Ho0e4Wo81h8',
      title: 'How To Draw A Minecraft Pickaxe',
      thumbnail: 'https://i.ytimg.com/vi/Ho0e4Wo81h8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-178',
      youtubeId: 'mZkXGLqvL-c',
      title: 'How To Draw Minecraft TNT',
      thumbnail: 'https://i.ytimg.com/vi/mZkXGLqvL-c/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-179',
      youtubeId: 'khIMbv66LvI',
      title: 'How To Draw Mario Pixel Art',
      thumbnail: 'https://i.ytimg.com/vi/khIMbv66LvI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-180',
      youtubeId: 'i2583UNNLNY',
      title: 'How To Draw A Game Controller For Kids',
      thumbnail: 'https://i.ytimg.com/vi/i2583UNNLNY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-181',
      youtubeId: 'TeQIEHQHOeY',
      title: 'How To Draw A PS5 Controller',
      thumbnail: 'https://i.ytimg.com/vi/TeQIEHQHOeY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-182',
      youtubeId: '7UBxAtGSsvw',
      title: 'How To Draw The Nintendo Switch 2',
      thumbnail: 'https://i.ytimg.com/vi/7UBxAtGSsvw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-183',
      youtubeId: 'DP7kf_4WZKU',
      title: 'How To Draw Sneaky Sasquatch',
      thumbnail: 'https://i.ytimg.com/vi/DP7kf_4WZKU/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-184',
      youtubeId: '7AB95qBsqew',
      title: 'How To Draw A Koopa Troopa From Mario',
      thumbnail: 'https://i.ytimg.com/vi/7AB95qBsqew/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-185',
      youtubeId: 'HZzu04vcL9c',
      title: 'How To Draw Baby Mario | Happy Mario Day!',
      thumbnail: 'https://i.ytimg.com/vi/HZzu04vcL9c/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-186',
      youtubeId: '2yxnq_Q_bsI',
      title: 'How To Draw Bowser Jr From Mario',
      thumbnail: 'https://i.ytimg.com/vi/2yxnq_Q_bsI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-187',
      youtubeId: 'YBMDNsUPDEw',
      title: 'How To Draw The Wonder Flower From Mario Bros Wonder',
      thumbnail: 'https://i.ytimg.com/vi/YBMDNsUPDEw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-188',
      youtubeId: 'CfwqtvJzLi0',
      title: 'How To Draw An Elephant Fruit From Super Mario Wonder',
      thumbnail: 'https://i.ytimg.com/vi/CfwqtvJzLi0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-189',
      youtubeId: 'GjiD_AbRqVo',
      title: 'How To Draw A Cheep Cheep From Mario',
      thumbnail: 'https://i.ytimg.com/vi/GjiD_AbRqVo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-190',
      youtubeId: 'vSFcn1U4wNI',
      title: 'How To Draw Paper Mario',
      thumbnail: 'https://i.ytimg.com/vi/vSFcn1U4wNI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-191',
      youtubeId: 'q15P6OE0EGk',
      title: 'How To Draw Kamek Magic Koopa From Mario',
      thumbnail: 'https://i.ytimg.com/vi/q15P6OE0EGk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-192',
      youtubeId: 'cyUk0GJHpDc',
      title: 'How To Draw Princess Peach',
      thumbnail: 'https://i.ytimg.com/vi/cyUk0GJHpDc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-193',
      youtubeId: 'iPJeemfinZ8',
      title: 'How To Draw Yoshi From Mario',
      thumbnail: 'https://i.ytimg.com/vi/iPJeemfinZ8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-194',
      youtubeId: 'OoB6DQAauDo',
      title: 'How To Draw A Blooper Squid From Mario',
      thumbnail: 'https://i.ytimg.com/vi/OoB6DQAauDo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-195',
      youtubeId: 'qyM9gTutsFM',
      title: 'How To Draw Bob omb From Mario',
      thumbnail: 'https://i.ytimg.com/vi/qyM9gTutsFM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-196',
      youtubeId: 'aatw7r0VcaE',
      title: 'How To Draw A Koopa Shell From Mario',
      thumbnail: 'https://i.ytimg.com/vi/aatw7r0VcaE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-197',
      youtubeId: 'DrqvYTefUJM',
      title: 'How To Draw Bullet Bill From Mario',
      thumbnail: 'https://i.ytimg.com/vi/DrqvYTefUJM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-198',
      youtubeId: 'QGMz2e3MFxY',
      title: 'How To Draw Bowser',
      thumbnail: 'https://i.ytimg.com/vi/QGMz2e3MFxY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-199',
      youtubeId: 'YASJd66bXFE',
      title: 'How To Draw Paper Luigi From Mario Bros',
      thumbnail: 'https://i.ytimg.com/vi/YASJd66bXFE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-200',
      youtubeId: 'q21S4J4DZmY',
      title: 'How To Draw A Fire Flower From Mario',
      thumbnail: 'https://i.ytimg.com/vi/q21S4J4DZmY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-201',
      youtubeId: 'X0AZ_ZChv48',
      title: 'How To Draw A Dino Piranha Plant From Mario',
      thumbnail: 'https://i.ytimg.com/vi/X0AZ_ZChv48/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-202',
      youtubeId: 'KcuANouCnk8',
      title: 'How To Draw A Goomba From Mario Bros',
      thumbnail: 'https://i.ytimg.com/vi/KcuANouCnk8/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-203',
      youtubeId: 'tIvHQ_ivkPY',
      title: 'How To Draw A Violin',
      thumbnail: 'https://i.ytimg.com/vi/tIvHQ_ivkPY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-204',
      youtubeId: 'Qp3tnvm4a7k',
      title: 'How To Draw A Grand Piano',
      thumbnail: 'https://i.ytimg.com/vi/Qp3tnvm4a7k/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-205',
      youtubeId: '-VerKMhktLg',
      title: 'How To Draw A Drum Set',
      thumbnail: 'https://i.ytimg.com/vi/-VerKMhktLg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-206',
      youtubeId: 'Q9FvUXXVwAU',
      title: 'How To Draw An Electric Guitar',
      thumbnail: 'https://i.ytimg.com/vi/Q9FvUXXVwAU/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-207',
      youtubeId: 'lvP1nDeheUc',
      title: 'How To Draw A Cyber Butterfly',
      thumbnail: 'https://i.ytimg.com/vi/lvP1nDeheUc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-208',
      youtubeId: '0G8_rk53wko',
      title: 'How To Draw A Cyber Lion',
      thumbnail: 'https://i.ytimg.com/vi/0G8_rk53wko/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-209',
      youtubeId: 'zZnOiNVvTfc',
      title: 'How To Draw A Gnome Sitting On A Mushroom',
      thumbnail: 'https://i.ytimg.com/vi/zZnOiNVvTfc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-210',
      youtubeId: 'WMDfEeksr14',
      title: 'How To Draw A Unicorn Popsicle',
      thumbnail: 'https://i.ytimg.com/vi/WMDfEeksr14/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-211',
      youtubeId: 'jVkGOeN-HKI',
      title: 'How To Draw A Cute Axolotl Mermaid',
      thumbnail: 'https://i.ytimg.com/vi/jVkGOeN-HKI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-212',
      youtubeId: 'QzyOIAzQQ90',
      title: 'How To Draw A Watermelon Shark',
      thumbnail: 'https://i.ytimg.com/vi/QzyOIAzQQ90/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-213',
      youtubeId: '9U1zQ_oX5LU',
      title: 'How To Draw A Cute Fall Fairy',
      thumbnail: 'https://i.ytimg.com/vi/9U1zQ_oX5LU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-214',
      youtubeId: 'mlZiIBNXmgw',
      title: 'How To Draw A Mermaid Folding Surprise',
      thumbnail: 'https://i.ytimg.com/vi/mlZiIBNXmgw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-215',
      youtubeId: 'BiBAtvYwjGs',
      title: 'How To Draw A Lepricorn For St. Patrick\'s Day',
      thumbnail: 'https://i.ytimg.com/vi/BiBAtvYwjGs/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-216',
      youtubeId: 'lyYtFNlQR90',
      title: 'How To Draw A Princess Fairy Panda',
      thumbnail: 'https://i.ytimg.com/vi/lyYtFNlQR90/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-217',
      youtubeId: 'CoVpO6Wb4rs',
      title: 'How To Draw A Mom And Baby Unicorn',
      thumbnail: 'https://i.ytimg.com/vi/CoVpO6Wb4rs/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-218',
      youtubeId: 'eFHwTD9eHyw',
      title: 'How To Draw A Mythical Kitten Dragon',
      thumbnail: 'https://i.ytimg.com/vi/eFHwTD9eHyw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-219',
      youtubeId: 'TzifMl12ahk',
      title: 'How To Draw An Ice Dragon - Advanced',
      thumbnail: 'https://i.ytimg.com/vi/TzifMl12ahk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-220',
      youtubeId: '1LyEd-nQj7k',
      title: 'How To Draw A Mermaid Corgi',
      thumbnail: 'https://i.ytimg.com/vi/1LyEd-nQj7k/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-221',
      youtubeId: 'TBH3-tjHNHY',
      title: 'How To Draw A Griffin',
      thumbnail: 'https://i.ytimg.com/vi/TBH3-tjHNHY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-222',
      youtubeId: 'GvAaVrEdsWQ',
      title: 'How To Draw A Pandacorn (Panda Unicorn)',
      thumbnail: 'https://i.ytimg.com/vi/GvAaVrEdsWQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-223',
      youtubeId: '14L8XVjus3U',
      title: 'How To Draw A Cute Phoenix',
      thumbnail: 'https://i.ytimg.com/vi/14L8XVjus3U/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-224',
      youtubeId: '_dxCu3yJEfc',
      title: 'How To Draw A Lioncorn (Lion Unicorn)',
      thumbnail: 'https://i.ytimg.com/vi/_dxCu3yJEfc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-225',
      youtubeId: 'BP7zhrgp710',
      title: 'How To Draw A Dragon Silhouette',
      thumbnail: 'https://i.ytimg.com/vi/BP7zhrgp710/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-226',
      youtubeId: 'KUXOQfh0ZKY',
      title: 'How To Draw An Alicorn (Unicorn & Pegasus)',
      thumbnail: 'https://i.ytimg.com/vi/KUXOQfh0ZKY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-227',
      youtubeId: 'EhySLRE7o5E',
      title: 'How To Draw King Merburger (Merman + Cheeseburger)',
      thumbnail: 'https://i.ytimg.com/vi/EhySLRE7o5E/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-228',
      youtubeId: '3J_jteLhBXA',
      title: 'How To Draw A Mermaid Kitty- Preschool',
      thumbnail: 'https://i.ytimg.com/vi/3J_jteLhBXA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-229',
      youtubeId: 'sjU9tEobw78',
      title: 'How To Draw A Unicorn Ice Cream Cone (Ice Cream-icorn)',
      thumbnail: 'https://i.ytimg.com/vi/sjU9tEobw78/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-230',
      youtubeId: '53s9aZ3KF5s',
      title: 'How To Draw A Dragon (For Super Young Artists)',
      thumbnail: 'https://i.ytimg.com/vi/53s9aZ3KF5s/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-231',
      youtubeId: 'ANcwbdO-QYM',
      title: 'How To Draw Chinese Dragon',
      thumbnail: 'https://i.ytimg.com/vi/ANcwbdO-QYM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-232',
      youtubeId: '5uZao8cqqRo',
      title: 'How To Draw Agent P',
      thumbnail: 'https://i.ytimg.com/vi/5uZao8cqqRo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-233',
      youtubeId: 'B3-PKR2QJSw',
      title: 'How To Draw Perry The Platypus',
      thumbnail: 'https://i.ytimg.com/vi/B3-PKR2QJSw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-234',
      youtubeId: 'vLvalljnJUc',
      title: 'How To Draw The Easter Bunny Cartoon',
      thumbnail: 'https://i.ytimg.com/vi/vLvalljnJUc/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-235',
      youtubeId: 'vLvDSfTySoA',
      title: 'How To Draw A Unicorn (a cute and cuddly one)',
      thumbnail: 'https://i.ytimg.com/vi/vLvDSfTySoA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-236',
      youtubeId: 'ZkBODLrJkMw',
      title: 'How To Draw A Troll',
      thumbnail: 'https://i.ytimg.com/vi/ZkBODLrJkMw/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-237',
      youtubeId: '5yzsPsqF8zA',
      title: 'How To Draw An Alien by Chuckers',
      thumbnail: 'https://i.ytimg.com/vi/5yzsPsqF8zA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-238',
      youtubeId: 'C37fkE5GtMU',
      title: 'How To Draw Elf On A Shelf',
      thumbnail: 'https://i.ytimg.com/vi/C37fkE5GtMU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-239',
      youtubeId: 'iLnO1LEnU6Q',
      title: 'How To Draw The Grinch',
      thumbnail: 'https://i.ytimg.com/vi/iLnO1LEnU6Q/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-240',
      youtubeId: 'TW-dq6m9rfI',
      title: 'How To Draw Hello Kitty',
      thumbnail: 'https://i.ytimg.com/vi/TW-dq6m9rfI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-241',
      youtubeId: '8PWZa9t-sqk',
      title: 'How To Draw A Witch',
      thumbnail: 'https://i.ytimg.com/vi/8PWZa9t-sqk/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-242',
      youtubeId: 'GHvBEm7ku_s',
      title: 'How To Draw The Grim Reaper for Halloween!',
      thumbnail: 'https://i.ytimg.com/vi/GHvBEm7ku_s/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-243',
      youtubeId: 'Y_x7UGFTcO8',
      title: 'How To Draw A Robot Crab',
      thumbnail: 'https://i.ytimg.com/vi/Y_x7UGFTcO8/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-244',
      youtubeId: 'sO4-bPQH0XI',
      title: 'How To Draw An Easter Bunny',
      thumbnail: 'https://i.ytimg.com/vi/sO4-bPQH0XI/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-245',
      youtubeId: 'WftGT_F3U-4',
      title: 'How To Draw A Cupid',
      thumbnail: 'https://i.ytimg.com/vi/WftGT_F3U-4/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-246',
      youtubeId: 'wZHGxCjDXKU',
      title: 'How To Draw Santa',
      thumbnail: 'https://i.ytimg.com/vi/wZHGxCjDXKU/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-247',
      youtubeId: 'kc_iugiP314',
      title: 'How To Draw A Fairy',
      thumbnail: 'https://i.ytimg.com/vi/kc_iugiP314/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-248',
      youtubeId: 'kT3YJbP0pZA',
      title: 'How To Draw A Mummy',
      thumbnail: 'https://i.ytimg.com/vi/kT3YJbP0pZA/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-249',
      youtubeId: 'jmfvmGbiICQ',
      title: 'How To Draw Frankenstein',
      thumbnail: 'https://i.ytimg.com/vi/jmfvmGbiICQ/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-250',
      youtubeId: '1ksIegCk0Vg',
      title: 'How To Draw A Dragon',
      thumbnail: 'https://i.ytimg.com/vi/1ksIegCk0Vg/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-251',
      youtubeId: 'GgENm6Uk55o',
      title: 'How To Draw A Monster',
      thumbnail: 'https://i.ytimg.com/vi/GgENm6Uk55o/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-252',
      youtubeId: 'zVd5R8ooAkM',
      title: 'How To Draw A Korok From Zelda',
      thumbnail: 'https://i.ytimg.com/vi/zVd5R8ooAkM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-253',
      youtubeId: 'Dn41j2pAN9o',
      title: 'How To Draw A Rupee From Zelda',
      thumbnail: 'https://i.ytimg.com/vi/Dn41j2pAN9o/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-254',
      youtubeId: 'LNJqyHm95w0',
      title: 'How To Draw A Cartoon Harry Potter And Hedwig',
      thumbnail: 'https://i.ytimg.com/vi/LNJqyHm95w0/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-255',
      youtubeId: 'fqYdXMtm8cE',
      title: 'How to Draw Harry Potter Easy Chibi',
      thumbnail: 'https://i.ytimg.com/vi/fqYdXMtm8cE/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-256',
      youtubeId: 'Gnj02dDKYFc',
      title: 'How To Draw Harry Potter',
      thumbnail: 'https://i.ytimg.com/vi/Gnj02dDKYFc/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-257',
      youtubeId: 'T90B5oZ2DVM',
      title: 'How to Draw Pokemon | Butterfree | Step-by-Step Tutorial',
      thumbnail: 'https://i.ytimg.com/vi/T90B5oZ2DVM/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-258',
      youtubeId: 'NK1Jt87PZ7w',
      title: 'How to Draw Butterfree | Pokemon',
      thumbnail: 'https://i.ytimg.com/vi/NK1Jt87PZ7w/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-259',
      youtubeId: 'rEdna7P-uPo',
      title: 'How To Draw  Butterfree From Pokemon | Coloring and Drawing For Kids',
      thumbnail: 'https://i.ytimg.com/vi/rEdna7P-uPo/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-260',
      youtubeId: 'TDINek931wY',
      title: 'Pokemon Butterfree | How to Draw | Pokemon Coloring Book | ARTSY KIDS',
      thumbnail: 'https://i.ytimg.com/vi/TDINek931wY/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-261',
      youtubeId: 'zHynB8Ykq5k',
      title: 'How To Draw Butterfree | Pokemon #012 | Easy Step By Step Drawing Tutorial',
      thumbnail: 'https://i.ytimg.com/vi/zHynB8Ykq5k/hqdefault.jpg',
      category: 'drawing'
    }
  ,
    {
      id: 'drawing-262',
      youtubeId: 'SAmoCUCQr84',
      title: '🦋 How to Draw Butterfree EASY!  Step by Step Pokémon Tutorial ✏️',
      thumbnail: 'https://i.ytimg.com/vi/SAmoCUCQr84/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-263',
      youtubeId: 'JqY7qbKwons',
      title: 'How to Draw #012 BUTTERFREE | Narrated Easy Step-by-Step Tutorial | Pokemon Drawing Project',
      thumbnail: 'https://i.ytimg.com/vi/JqY7qbKwons/hqdefault.jpg',
      category: 'drawing'
    },
    {
      id: 'drawing-263',
      youtubeId: 'fgr9KZ64TXc',
      title: 'How to Draw #012 BUTTERFREE | Narrated Easy Step-by-Step Tutorial | Pokemon Drawing Project',
      thumbnail: 'https://i.ytimg.com/vi/JqY7qbKwons/hqdefault.jpg',
      category: 'drawing'
    },

    
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