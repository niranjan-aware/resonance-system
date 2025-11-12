/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (HH:MM AM/PM)
 */
export const to12Hour = (time24) => {
  if (!time24 || typeof time24 !== 'string') {
    return time24;
  }

  try {
    const [hours, minutes] = time24.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time24;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return time24;
  }
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12 - Time in 12-hour format (HH:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 */
export const to24Hour = (time12) => {
  if (!time12 || typeof time12 !== 'string') {
    return time12;
  }

  try {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    
    if (!match) {
      return time12;
    }

    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return time12;
  }
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'long') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    short: { month: 'short', day: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };

  return dateObj.toLocaleDateString('en-IN', options[format] || options.long);
};

/**
 * Get time slots between start and end
 * @param {string} startTime - Start time (24h format)
 * @param {string} endTime - End time (24h format)
 * @param {number} intervalMinutes - Interval in minutes
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
 * Check if time is in the past
 * @param {Date|string} date - Date to check
 * @param {string} time - Time in 24h format
 * @returns {boolean}
 */
export const isPastTime = (date, time) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const [hours, minutes] = time.split(':').map(Number);
  
  dateObj.setHours(hours, minutes, 0, 0);
  
  return dateObj < new Date();
};

export default {
  to12Hour,
  to24Hour,
  formatDate,
  generateTimeSlots,
  isPastTime
};