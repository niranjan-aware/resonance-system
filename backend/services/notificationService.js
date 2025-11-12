import whatsappService from './whatsappService.js';
import googleIntegrationService from './googleIntegration.js';

class NotificationService {
  /**
   * Handle all notifications for a new booking
   */
  async handleNewBooking(booking) {
    try {
      console.log(`📬 Sending notifications for booking: ${booking.bookingId}`);

      // 1. Send WhatsApp confirmation
      const whatsappResult = await whatsappService.sendBookingConfirmation(booking);
      if (whatsappResult.success) {
        console.log('✅ WhatsApp confirmation sent');
        
        // Update booking notification status
        booking.notifications.confirmationSent = true;
        await booking.save();
      } else {
        console.error('❌ WhatsApp confirmation failed:', whatsappResult.error);
      }

      // 2. Add to Google Calendar
      try {
        const calendarEvent = await googleIntegrationService.addToCalendar(booking);
        if (calendarEvent) {
          console.log('✅ Added to Google Calendar');
          
          // Update booking with calendar event ID
          booking.googleIntegration.calendarEventId = calendarEvent.id;
          booking.googleIntegration.syncStatus = 'synced';
          booking.googleIntegration.lastSyncedAt = new Date();
          await booking.save();
        }
      } catch (error) {
        console.error('❌ Google Calendar sync failed:', error.message);
        booking.googleIntegration.syncStatus = 'failed';
        await booking.save();
      }

      // 3. Add to Google Sheets
      try {
        await googleIntegrationService.addToSheet(booking);
        console.log('✅ Added to Google Sheets');
      } catch (error) {
        console.error('❌ Google Sheets sync failed:', error.message);
      }

      return {
        success: true,
        whatsapp: whatsappResult.success,
        calendar: !!booking.googleIntegration.calendarEventId,
        sheets: true
      };
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle booking cancellation notifications
   */
  async handleCancellation(booking) {
    try {
      console.log(`📬 Sending cancellation notifications for: ${booking.bookingId}`);

      // 1. Send WhatsApp cancellation
      const whatsappResult = await whatsappService.sendCancellation(booking);
      if (whatsappResult.success) {
        console.log('✅ WhatsApp cancellation sent');
      }

      // 2. Remove from Google Calendar
      if (booking.googleIntegration?.calendarEventId) {
        try {
          await googleIntegrationService.deleteCalendarEvent(
            booking.studio._id,
            booking.googleIntegration.calendarEventId
          );
          console.log('✅ Removed from Google Calendar');
        } catch (error) {
          console.error('❌ Calendar deletion failed:', error.message);
        }
      }

      // 3. Update Google Sheets
      try {
        await googleIntegrationService.updateSheetRow(booking);
        console.log('✅ Updated Google Sheets');
      } catch (error) {
        console.error('❌ Sheets update failed:', error.message);
      }

      return {
        success: true,
        whatsapp: whatsappResult.success
      };
    } catch (error) {
      console.error('Cancellation notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle booking reschedule notifications
   */
  async handleReschedule(booking, oldDate, oldTime) {
    try {
      console.log(`📬 Sending reschedule notifications for: ${booking.bookingId}`);

      // 1. Send WhatsApp reschedule notification
      const whatsappResult = await whatsappService.sendReschedule(booking, oldDate, oldTime);
      if (whatsappResult.success) {
        console.log('✅ WhatsApp reschedule sent');
      }

      // 2. Update Google Calendar
      if (booking.googleIntegration?.calendarEventId) {
        try {
          await googleIntegrationService.updateCalendarEvent(
            booking,
            booking.googleIntegration.calendarEventId
          );
          console.log('✅ Updated Google Calendar');
          
          booking.googleIntegration.lastSyncedAt = new Date();
          await booking.save();
        } catch (error) {
          console.error('❌ Calendar update failed:', error.message);
        }
      }

      // 3. Update Google Sheets
      try {
        await googleIntegrationService.updateSheetRow(booking);
        console.log('✅ Updated Google Sheets');
      } catch (error) {
        console.error('❌ Sheets update failed:', error.message);
      }

      return {
        success: true,
        whatsapp: whatsappResult.success
      };
    } catch (error) {
      console.error('Reschedule notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminder(booking, reminderType) {
    try {
      console.log(`📬 Sending ${reminderType} reminder for: ${booking.bookingId}`);

      const whatsappResult = await whatsappService.sendReminder(booking, reminderType);
      
      if (whatsappResult.success) {
        console.log(`✅ ${reminderType} reminder sent`);
        
        // Update booking notification status
        const fieldMap = {
          '12h': 'reminder12hSent',
          '6h': 'reminder6hSent',
          '3h': 'reminder3hSent'
        };
        
        booking.notifications[fieldMap[reminderType]] = true;
        await booking.save();
      }

      return whatsappResult;
    } catch (error) {
      console.error('Send reminder error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new NotificationService();