/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (HH:MM AM/PM)
 */
export const to12Hour = (time24) => {
  if (!time24 || typeof time24 !== 'string') {
    throw new Error('Invalid time format');
  }

  const [hours, minutes] = time24.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format');
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12 - Time in 12-hour format (HH:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 */
export const to24Hour = (time12) => {
  if (!time12 || typeof time12 !== 'string') {
    throw new Error('Invalid time format');
  }

  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  
  if (!match) {
    throw new Error('Invalid 12-hour time format. Expected format: HH:MM AM/PM');
  }

  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time values');
  }

  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Get time display for both formats
 * @param {string} time24 - Time in 24-hour format
 * @returns {Object} Object with both formats
 */
export const getTimeFormats = (time24) => {
  return {
    time24h: time24,
    time12h: to12Hour(time24)
  };
};

/**
 * Generate time slots between start and end time
 * @param {string} startTime - Start time in 24-hour format (HH:MM)
 * @param {string} endTime - End time in 24-hour format (HH:MM)
 * @param {number} intervalMinutes - Interval in minutes (default: 60)
 * @returns {Array} Array of time slots
 */
export const generateTimeSlots = (startTime = '08:00', endTime = '22:00', intervalMinutes = 60) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const time24 = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push({
      value: time24,
      label: to12Hour(time24),
      time24h: time24,
      time12h: to12Hour(time24)
    });

    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

/**
 * Check if time is within range
 * @param {string} time - Time to check (24-hour format)
 * @param {string} startTime - Start time (24-hour format)
 * @param {string} endTime - End time (24-hour format)
 * @returns {boolean}
 */
export const isTimeInRange = (time, startTime, endTime) => {
  const [hour, min] = time.split(':').map(Number);
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const timeMinutes = hour * 60 + min;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

export default {
  to12Hour,
  to24Hour,
  getTimeFormats,
  generateTimeSlots,
  isTimeInRange
};