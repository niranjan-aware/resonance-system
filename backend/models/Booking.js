import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    startTime12h: String,
    endTime12h: String
  },
  sessionType: {
    type: String,
    enum: ['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show'],
    required: true
  },
  sessionDetails: {
    participants: {
      type: Number,
      min: 1,
      max: 50
    },
    musicians: {
      type: Number,
      min: 1,
      max: 20
    },
    specialRequirements: {
      type: String,
      maxlength: 500
    }
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    method: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminder12hSent: { type: Boolean, default: false },
    reminder6hSent: { type: Boolean, default: false },
    reminder3hSent: { type: Boolean, default: false }
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    penaltyAmount: {
      type: Number,
      default: 0
    }
  },
  googleIntegration: {
    calendarEventId: String,
    syncStatus: {
      type: String,
      enum: ['pending', 'synced', 'failed'],
      default: 'pending'
    },
    lastSyncedAt: Date
  }
}, {
  timestamps: true
});

// Generate booking ID before save
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `RES-${timestamp}-${random}`;
  }
  next();
});

// Indexes
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ studio: 1, date: 1, 'timeSlot.startTime': 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);