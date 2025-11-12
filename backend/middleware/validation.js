import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
export const validateLogin = [
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validate
];

// Booking validation rules
export const validateCreateBooking = [
  body('studioId')
    .isMongoId()
    .withMessage('Invalid studio ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Cannot book for past dates');
      }
      
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 4);
      
      if (bookingDate > maxDate) {
        throw new Error('Cannot book more than 4 months in advance');
      }
      
      return true;
    }),
  body('startTime')
    .matches(/^([0-1][0-9]|2[0-1]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (use HH:MM)')
    .custom((value) => {
      const [hours] = value.split(':').map(Number);
      if (hours < 8 || hours >= 22) {
        throw new Error('Start time must be between 08:00 and 22:00');
      }
      return true;
    }),
  body('endTime')
    .matches(/^([0-1][0-9]|2[0-2]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (use HH:MM)')
    .custom((value, { req }) => {
      const [startHours, startMins] = req.body.startTime.split(':').map(Number);
      const [endHours, endMins] = value.split(':').map(Number);
      
      const startMinutes = startHours * 60 + startMins;
      const endMinutes = endHours * 60 + endMins;
      
      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time');
      }
      
      if (endHours > 22) {
        throw new Error('End time cannot exceed 22:00');
      }
      
      return true;
    }),
  body('sessionType')
    .isIn(['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show'])
    .withMessage('Invalid session type'),
  body('sessionDetails.participants')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Participants must be between 1 and 50'),
  body('sessionDetails.musicians')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Musicians must be between 1 and 20'),
  body('sessionDetails.specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requirements cannot exceed 500 characters'),
  validate
];

export const validateCheckAvailability = [
  body('studioId')
    .isMongoId()
    .withMessage('Invalid studio ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .matches(/^([0-1][0-9]|2[0-1]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),
  validate
];

export const validateReschedule = [
  body('newDate')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('newStartTime')
    .matches(/^([0-1][0-9]|2[0-1]):[0-5][0-9]$/)
    .withMessage('Invalid start time format'),
  body('newEndTime')
    .matches(/^([0-1][0-9]|2[0-2]):[0-5][0-9]$/)
    .withMessage('Invalid end time format'),
  validate
];

export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

export const validateTimetable = [
  query('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('studioId')
    .optional()
    .isMongoId()
    .withMessage('Invalid studio ID'),
  validate
];

export const validateUpdateStatus = [
  body('status')
    .isIn(['confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid status'),
  validate
];