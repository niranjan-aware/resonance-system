import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['confirmation', 'reminder-12h', 'reminder-6h', 'reminder-3h', 'cancellation', 'reschedule'],
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'email', 'sms'],
    required: true
  },
  recipient: {
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending'
  },
  messageId: {
    type: String,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    code: String,
    message: String
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  metadata: {
    templateName: String,
    variables: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ booking: 1, type: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ messageId: 1 }, { unique: true, sparse: true });

// Static method to log notification
notificationSchema.statics.logNotification = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Error logging notification:', error);
    return null;
  }
};

// Static method to update notification status
notificationSchema.statics.updateStatus = async function(messageId, status, metadata = {}) {
  try {
    const update = { status };
    
    if (status === 'sent') {
      update.sentAt = new Date();
    } else if (status === 'delivered') {
      update.deliveredAt = new Date();
    } else if (status === 'read') {
      update.readAt = new Date();
    }
    
    if (metadata.error) {
      update.error = metadata.error;
    }

    return await this.findOneAndUpdate(
      { messageId },
      update,
      { new: true }
    );
  } catch (error) {
    console.error('Error updating notification status:', error);
    return null;
  }
};

export default mongoose.model('Notification', notificationSchema);