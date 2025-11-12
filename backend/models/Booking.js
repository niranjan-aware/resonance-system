import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    index: true
    // ✅ NO required: true - we auto-generate it
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

// Indexes for efficient queries
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ studio: 1, date: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });

// ✅ Auto-generate bookingId before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    // Generate format: RES-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0');
    
    // Get count of bookings created today
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.bookingId = `RES-${dateStr}-${sequence}`;
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);