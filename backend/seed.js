import 'dotenv/config';
import mongoose from 'mongoose';
import Studio from './models/Studio.js';

const studios = [
  {
    name: 'Studio A - Resonance Sinhgad Road',
    size: 'large',
    capacity: 30,
    description: 'Our largest and most spacious studio, perfect for big live rehearsals and large groups of Karaoke rehearsal. It comfortably accommodates up to 10-12 musicians and singers for live rehearsals.',
    features: [
      'Yamaha Silver Star Drum kit (with cymbals)',
      'Two Electric Guitars',
      'One Keyboard',
      'Two Guitar Amps',
      'One Bass Amp',
      'Huge 65" TV screen for karaoke',
      'Professional sound system',
      'Climate controlled'
    ],
    equipment: [
      { name: 'Yamaha Silver Star Drum Kit', brand: 'Yamaha', isAvailable: true },
      { name: 'Electric Guitar 1', brand: 'Various', isAvailable: true },
      { name: 'Electric Guitar 2', brand: 'Various', isAvailable: true },
      { name: 'Keyboard', brand: 'Yamaha', isAvailable: true },
      { name: 'Guitar Amp 1', brand: 'Various', isAvailable: true },
      { name: 'Guitar Amp 2', brand: 'Various', isAvailable: true },
      { name: 'Bass Amp', brand: 'Ampeg', isAvailable: true }
    ],
    images: [
      { url: '/images/studio-a-1.jpg', caption: 'Main View', isPrimary: true },
      { url: '/images/studio-a-2.jpg', caption: 'Equipment Setup', isPrimary: false }
    ],
    pricing: {
      basePrice: 600
    },
    availability: {
      startTime: '08:00',
      endTime: '22:00',
      workingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    suitableFor: ['karaoke', 'live-musicians', 'band'],
    isActive: true
  },
  {
    name: 'Studio B - Resonance Sinhgad Road',
    size: 'medium',
    capacity: 12,
    description: 'A versatile, moderately sized studio that adapts to your needs. It is primarily recommended for karaoke rehearsal groups of up to 10-12 participants, but it is also suitable for live rehearsals with up to 4-5 musicians.',
    features: [
      '46" TV screen for karaoke',
      'Professional sound system',
      'Climate controlled',
      'Comfortable seating area',
      'Ambient lighting'
    ],
    equipment: [
      { name: 'Professional Microphones', brand: 'Shure', isAvailable: true },
      { name: 'Mixing Console', brand: 'Behringer', isAvailable: true }
    ],
    images: [
      { url: '/images/studio-b-1.jpg', caption: 'Main View', isPrimary: true }
    ],
    pricing: {
      basePrice: 400
    },
    availability: {
      startTime: '08:00',
      endTime: '22:00',
      workingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    suitableFor: ['karaoke', 'live-musicians'],
    isActive: true
  },
  {
    name: 'Studio C - Resonance Sinhgad Road',
    size: 'small',
    capacity: 5,
    description: 'Primarily designed for audio/video recording and podcast production. Also ideal for up to 2 musicians in a live rehearsal setup or karaoke rehearsal groups of up to 4-5 participants.',
    features: [
      'Professional recording equipment',
      'Video recording setup',
      'Podcast production ready',
      'Intimate recording space',
      'Chroma key (Green Screen) setup',
      'Professional monitors'
    ],
    equipment: [
      { name: 'Professional Microphones', brand: 'Audio-Technica', isAvailable: true },
      { name: 'Recording Interface', brand: 'Focusrite', isAvailable: true },
      { name: '4K Camera', brand: 'iPhone/iPad', isAvailable: true }
    ],
    images: [
      { url: '/images/studio-c-1.jpg', caption: 'Recording Setup', isPrimary: true }
    ],
    pricing: {
      basePrice: 350
    },
    availability: {
      startTime: '08:00',
      endTime: '22:00',
      workingDays: [0, 1, 2, 3, 4, 5, 6]
    },
    suitableFor: ['karaoke', 'live-musicians', 'audio-recording', 'video-recording'],
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing studios
    await Studio.deleteMany({});
    console.log('🗑️  Cleared existing studios');

    // Insert new studios
    const createdStudios = await Studio.insertMany(studios);
    console.log(`✅ Created ${createdStudios.length} studios`);

    console.log('\n📊 Studio IDs for Google Calendar mapping:');
    createdStudios.forEach(studio => {
      console.log(`${studio.name}: ${studio._id}`);
    });

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();