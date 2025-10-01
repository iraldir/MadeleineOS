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