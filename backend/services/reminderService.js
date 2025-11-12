import Booking from '../models/Booking.js';
import notificationService from './notificationService.js';
import { addHours, isBefore, isAfter, differenceInHours } from 'date-fns';

class ReminderService {
  /**
   * Check and send 12-hour reminders
   */
  async check12HourReminders() {
    try {
      console.log('🔔 Checking 12-hour reminders...');

      const now = new Date();
      const targetTime = addHours(now, 12);
      const windowStart = addHours(now, 11.75); // 11h 45m
      const windowEnd = addHours(now, 12.25);   // 12h 15m

      const bookings = await Booking.find({
        status: 'confirmed',
        'notifications.reminder12hSent': false,
        date: {
          $gte: windowStart,
          $lte: windowEnd
        }
      })
      .populate('user', 'name phone')
      .populate('studio', 'name');

      console.log(`Found ${bookings.length} bookings for 12h reminders`);

      for (const booking of bookings) {
        // Check if the exact time with start time is within window
        const [hours, minutes] = booking.timeSlot.startTime.split(':');
        const bookingDateTime = new Date(booking.date);
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const hoursUntil = differenceInHours(bookingDateTime, now);

        if (hoursUntil >= 11.5 && hoursUntil <= 12.5) {
          await notificationService.sendReminder(booking, '12h');
        }
      }

      return { success: true, count: bookings.length };
    } catch (error) {
      console.error('12h reminder check error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and send 6-hour reminders
   */
  async check6HourReminders() {
    try {
      console.log('🔔 Checking 6-hour reminders...');

      const now = new Date();
      const windowStart = addHours(now, 5.75); // 5h 45m
      const windowEnd = addHours(now, 6.25);   // 6h 15m

      const bookings = await Booking.find({
        status: 'confirmed',
        'notifications.reminder6hSent': false,
        date: {
          $gte: windowStart,
          $lte: windowEnd
        }
      })
      .populate('user', 'name phone')
      .populate('studio', 'name');

      console.log(`Found ${bookings.length} bookings for 6h reminders`);

      for (const booking of bookings) {
        const [hours, minutes] = booking.timeSlot.startTime.split(':');
        const bookingDateTime = new Date(booking.date);
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const hoursUntil = differenceInHours(bookingDateTime, now);

        if (hoursUntil >= 5.5 && hoursUntil <= 6.5) {
          await notificationService.sendReminder(booking, '6h');
        }
      }

      return { success: true, count: bookings.length };
    } catch (error) {
      console.error('6h reminder check error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and send 3-hour reminders
   */
  async check3HourReminders() {
    try {
      console.log('🔔 Checking 3-hour reminders...');

      const now = new Date();
      const windowStart = addHours(now, 2.75); // 2h 45m
      const windowEnd = addHours(now, 3.25);   // 3h 15m

      const bookings = await Booking.find({
        status: 'confirmed',
        'notifications.reminder3hSent': false,
        date: {
          $gte: windowStart,
          $lte: windowEnd
        }
      })
      .populate('user', 'name phone')
      .populate('studio', 'name');

      console.log(`Found ${bookings.length} bookings for 3h reminders`);

      for (const booking of bookings) {
        const [hours, minutes] = booking.timeSlot.startTime.split(':');
        const bookingDateTime = new Date(booking.date);
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const hoursUntil = differenceInHours(bookingDateTime, now);

        if (hoursUntil >= 2.5 && hoursUntil <= 3.5) {
          await notificationService.sendReminder(booking, '3h');
        }
      }

      return { success: true, count: bookings.length };
    } catch (error) {
      console.error('3h reminder check error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run all reminder checks
   */
  async checkAllReminders() {
    console.log('\n🔔 === REMINDER CHECK STARTED ===');
    console.log(`Time: ${new Date().toISOString()}`);

    const results = await Promise.allSettled([
      this.check12HourReminders(),
      this.check6HourReminders(),
      this.check3HourReminders()
    ]);

    console.log('🔔 === REMINDER CHECK COMPLETED ===\n');

    return {
      reminder12h: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      reminder6h: results[1].status === 'fulfilled' ? results[1].value : { success: false },
      reminder3h: results[2].status === 'fulfilled' ? results[2].value : { success: false }
    };
  }
}

export default new ReminderService();