export const rateCardData = {
  studioA: {
    name: 'Studio A',
    rates: [
      { service: 'Karaoke (1-5 participants)', price: 400 },
      { service: 'Karaoke (6-10 participants)', price: 400 },
      { service: 'Karaoke (11-20 participants)', price: 400 },
      { service: 'Karaoke (21-30 participants)', price: 500 },
      { service: 'Live (up to 2 musicians)', price: 600 },
      { service: 'Live (up to 4 musicians)', price: 600 },
      { service: 'Live (5 musicians)', price: 600 },
      { service: 'Live (6-8 musicians)', price: 600 },
      { service: 'Live (8-12 musicians)', price: 800 },
      { service: 'Only Drum Practice', price: 350 },
      { service: 'Band with only Drums', price: 400 },
      { service: 'Band with Drums & Amps', price: 500 },
      { service: 'Band Full (Drums, Amps, Guitars, Keyboard)', price: 600 }
    ]
  },
  studioB: {
    name: 'Studio B',
    rates: [
      { service: 'Karaoke (1-5 participants)', price: 300 },
      { service: 'Karaoke (6-12 participants)', price: 300 },
      { service: 'Live (up to 2 musicians)', price: 400 },
      { service: 'Live (up to 4 musicians)', price: 400 },
      { service: 'Live (5 musicians)', price: 500 }
    ]
  },
  studioC: {
    name: 'Studio C',
    rates: [
      { service: 'Karaoke (1-5 participants)', price: 250 },
      { service: 'Live (up to 2 musicians)', price: 350 }
    ]
  },
  specialPackages: [
    {
      name: '10 Hours Package - Karaoke',
      description: '3+3+4 hours split (Especially for Organisers)',
      studioA: 3500,
      studioB: 2500,
      studioC: 2000
    },
    {
      name: '10 Hours Package - Live',
      description: '3+3+4 hours split (Especially for Organisers)',
      studioA: 5000,
      studioB: 4000,
      studioC: 3000
    }
  ],
  otherServices: [
    {
      service: 'Audio Recording',
      price: 700,
      description: 'Per song - includes recording, editing, mixing & mastering'
    },
    {
      service: 'Video Recording',
      price: 800,
      description: 'True 4K Quality (iPhone/iPad) - includes recording, editing, mixing & mastering'
    },
    {
      service: 'Chroma Key Recording',
      price: 1200,
      description: 'Green Screen - includes recording, editing, mixing & mastering'
    },
    {
      service: 'SD Card Recording',
      price: 100,
      description: 'Per hour - Raw data only (unedited), transferred to your pen drive'
    }
  ]
};