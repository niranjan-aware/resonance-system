import mongoose from 'mongoose';

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  features: [{
    type: String,
    trim: true
  }],
  equipment: [{
    name: String,
    brand: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  availability: {
    startTime: {
      type: String,
      required: true,
      default: '08:00'
    },
    endTime: {
      type: String,
      required: true,
      default: '22:00'
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }]
  },
  suitableFor: [{
    type: String,
    enum: ['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

studioSchema.index({ size: 1, isActive: 1 });
studioSchema.index({ 'suitableFor': 1 });

export default mongoose.model('Studio', studioSchema);