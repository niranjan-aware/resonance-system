export const studiosData = {
  studioA: {
    id: 'studio-a',
    name: 'Studio A',
    size: 'large',
    capacity: {
      live: '10-12 musicians',
      karaoke: 'Up to 30 participants'
    },
    description: 'Our largest and most spacious studio, perfect for big live rehearsals and large groups of Karaoke rehearsal.',
    features: [
      'Yamaha Silver Star Drum kit (with cymbals)',
      'Two Electric Guitars',
      'One Keyboard',
      'Two Guitar Amps',
      'One Bass Amp',
      'Huge 65" TV screen for karaoke'
    ],
    pricing: {
      karaoke_1_5: 400,
      karaoke_6_10: 400,
      karaoke_11_20: 400,
      karaoke_21_30: 500,
      live_2: 600,
      live_4: 600,
      live_5: 600,
      live_6_8: 600,
      live_8_12: 800,
      drum_only: 350,
      band_drums: 400,
      band_drums_amps: 500,
      band_full: 600
    },
    images: [
      '/images/studio-a-1.jpg',
      '/images/studio-a-2.jpg',
      '/images/studio-a-3.jpg'
    ],
    suitableFor: ['karaoke', 'live-musicians', 'band']
  },
  studioB: {
    id: 'studio-b',
    name: 'Studio B',
    size: 'medium',
    capacity: {
      live: '4-5 musicians',
      karaoke: 'Up to 12 participants'
    },
    description: 'A versatile, moderately sized studio that adapts to your needs. Primarily recommended for karaoke rehearsal groups.',
    features: [
      '46" TV screen for karaoke',
      'Professional sound system',
      'Climate controlled',
      'Comfortable seating area'
    ],
    pricing: {
      karaoke_1_5: 300,
      karaoke_6_12: 300,
      live_2: 400,
      live_4_5: 400,
      live_5: 500
    },
    images: [
      '/images/studio-b-1.jpg',
      '/images/studio-b-2.jpg'
    ],
    suitableFor: ['karaoke', 'live-musicians']
  },
  studioC: {
    id: 'studio-c',
    name: 'Studio C',
    size: 'small',
    capacity: {
      live: 'Up to 2 musicians',
      karaoke: 'Up to 5 participants'
    },
    description: 'Primarily designed for audio/video recording and podcast production. Also ideal for small rehearsals.',
    features: [
      'Professional recording equipment',
      'Video recording setup',
      'Podcast production ready',
      'Intimate recording space'
    ],
    pricing: {
      karaoke_1_5: 250,
      live_2: 350,
      audio_recording: 700,
      video_recording: 800,
      chroma_key: 1200
    },
    images: [
      '/images/studio-c-1.jpg',
      '/images/studio-c-2.jpg'
    ],
    suitableFor: ['karaoke', 'live-musicians', 'audio-recording', 'video-recording']
  }
};

export const studiosList = Object.values(studiosData);