import cron from 'node-cron';
import Booking from '../models/Booking.js';
import googleIntegrationService from '../services/googleIntegration.js';
import { subDays } from 'date-fns';

/**
 * Cleanup Job
 * Runs daily at 2 AM to delete bookings older than 30 days
 */
export const startCleanupJob = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('\n🗑️  === CLEANUP JOB STARTED ===');
      console.log(`Time: ${new Date().toISOString()}`);

      // Find bookings older than 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const oldBookings = await Booking.find({
        date: { $lt: thirtyDaysAgo }
      }).populate('studio', 'name');

      console.log(`Found ${oldBookings.length} bookings to delete`);

      if (oldBookings.length === 0) {
        console.log('No old bookings to delete');
        console.log('🗑️  === CLEANUP JOB COMPLETED ===\n');
        return;
      }

      let calendarDeleted = 0;
      let calendarErrors = 0;

      // Delete from Google Calendar
      for (const booking of oldBookings) {
        if (booking.googleIntegration?.calendarEventId) {
          try {
            await googleIntegrationService.deleteCalendarEvent(
              booking.studio._id,
              booking.googleIntegration.calendarEventId
            );
            calendarDeleted++;
          } catch (error) {
            console.error(`Error deleting calendar event for ${booking.bookingId}:`, error.message);
            calendarErrors++;
          }
        }
      }

      // Delete from MongoDB
      const deleteResult = await Booking.deleteMany({
        date: { $lt: thirtyDaysAgo }
      });

      console.log(`✅ Deleted ${deleteResult.deletedCount} bookings from database`);
      console.log(`✅ Deleted ${calendarDeleted} calendar events`);
      if (calendarErrors > 0) {
        console.log(`⚠️  ${calendarErrors} calendar deletion errors`);
      }
      console.log('ℹ️  Note: Entries remain in Google Sheets for records');
      console.log('🗑️  === CLEANUP JOB COMPLETED ===\n');

    } catch (error) {
      console.error('❌ Cleanup job error:', error);
    }
  });

  console.log('✅ Cleanup job scheduled (runs daily at 2:00 AM)');
};

export default startCleanupJob;