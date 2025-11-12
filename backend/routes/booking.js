import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getTimetable,
  checkAvailability,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
  getAllBookings
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiting.js';
import {
  validateCreateBooking,
  validateCheckAvailability,
  validateReschedule,
  validateMongoId,
  validateTimetable,
  validateUpdateStatus
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/timetable', validateTimetable, getTimetable);
router.post('/check-availability', validateCheckAvailability, checkAvailability);

// Protected routes (require authentication)
router.use(protect);

router.post('/', bookingLimiter, validateCreateBooking, createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', validateMongoId, getBookingById);
router.put('/:id/cancel', validateMongoId, cancelBooking);
router.put('/:id/reschedule', validateMongoId, validateReschedule, rescheduleBooking);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllBookings);
router.put('/:id/status', authorize('admin'), validateMongoId, validateUpdateStatus, updateBookingStatus);

export default router;