import cron from 'node-cron';
import reminderService from '../services/reminderService.js';

/**
 * Reminder Job
 * Runs every 15 minutes to check for reminders to send
 */
export const startReminderJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await reminderService.checkAllReminders();
    } catch (error) {
      console.error('❌ Reminder job error:', error);
    }
  });

  console.log('✅ Reminder job scheduled (runs every 15 minutes)');
};

export default startReminderJob;