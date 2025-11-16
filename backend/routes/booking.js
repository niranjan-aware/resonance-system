import express from 'express';
import {
  createBooking,
  getBookingsByPhone,
  getTimetable,
  checkAvailability,
  cancelBookingByPhone
} from '../controllers/bookingController.js';
import { bookingLimiter } from '../middleware/rateLimiting.js';
import {
  validateCreateBooking,
  validateCheckAvailability,
  validateMongoId,
  validateTimetable
} from '../middleware/validation.js';

const router = express.Router();

// ✅ All routes are now PUBLIC (no authentication required)

// Public routes
router.get('/timetable', validateTimetable, getTimetable);
router.post('/check-availability', validateCheckAvailability, checkAvailability);

// Booking creation (requires phone number)
router.post('/', bookingLimiter, validateCreateBooking, createBooking);

// Get bookings by phone number
router.post('/by-phone', getBookingsByPhone);

// Cancel booking by phone + booking ID
router.put('/:id/cancel-by-phone', validateMongoId, cancelBookingByPhone);

export default router;