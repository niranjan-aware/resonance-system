import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';

import { format, addDays, startOfDay, endOfDay } from 'date-fns';

// @desc    Create new booking
// @route   POST /api/booking
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      studioId,
      date,
      startTime,
      endTime,
      sessionType,
      sessionDetails
    } = req.body;

    // Validate studio exists
    const studio = await Studio.findById(studioId);
    if (!studio || !studio.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found or inactive'
      });
    }

    // Check if slot is available
    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      studio: studioId,
      date: {
        $gte: startOfDay(bookingDate),
        $lte: endOfDay(bookingDate)
      },
      'timeSlot.startTime': startTime,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate pricing
    const baseAmount = studio.pricing.basePrice;
    const taxes = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + taxes;

    // Convert to 12-hour format
    const to12Hour = (time24) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      studio: studioId,
      date: bookingDate,
      timeSlot: {
        startTime,
        endTime,
        startTime12h: to12Hour(startTime),
        endTime12h: to12Hour(endTime)
      },
      sessionType,
      sessionDetails,
      pricing: {
        baseAmount,
        taxes,
        totalAmount
      },
      status: 'confirmed'
    });

    // Populate references
    await booking.populate([
      { path: 'user', select: 'name phone email' },
      { path: 'studio', select: 'name size' }
    ]);

    // 🔥 NEW: Send notifications (WhatsApp + Google)
    try {
      await notificationService.handleNewBooking(booking);
      console.log('✅ Notifications sent successfully');
    } catch (notifError) {
      console.error('⚠️  Notification error (booking still created):', notifError);
      // Don't fail the booking if notifications fail
    }

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully! You will receive a WhatsApp confirmation shortly.'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/booking/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('studio', 'name size')
      .sort({ date: -1, 'timeSlot.startTime': 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/booking/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('studio');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get timetable for multiple dates
// @route   GET /api/booking/timetable
// @access  Public
export const getTimetable = async (req, res) => {
  try {
    const { startDate, endDate, studioId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = {
      date: { $gte: startOfDay(start), $lte: endOfDay(end) },
      status: { $ne: 'cancelled' }
    };

    if (studioId) {
      query.studio = studioId;
    }

    const bookings = await Booking.find(query)
      .populate('studio', 'name')
      .populate('user', 'name')
      .select('studio date timeSlot status user');

    // Get all studios
    const studios = await Studio.find({ isActive: true }).select('name size');

    // Generate time slots (8 AM to 10 PM)
    const timeSlots = [];
    for (let hour = 8; hour < 22; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Format response
    const timetable = {
      startDate,
      endDate,
      studios: studios.map(s => ({
        id: s._id,
        name: s.name,
        size: s.size
      })),
      timeSlots,
      bookings: bookings.map(b => ({
        id: b._id,
        studioId: b.studio._id,
        studioName: b.studio.name,
        date: format(new Date(b.date), 'yyyy-MM-dd'),
        startTime: b.timeSlot.startTime,
        endTime: b.timeSlot.endTime,
        startTime12h: b.timeSlot.startTime12h,
        endTime12h: b.timeSlot.endTime12h,
        status: b.status,
        isOwn: req.user ? b.user._id.toString() === req.user._id.toString() : false
      }))
    };

    res.status(200).json({
      success: true,
      timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check slot availability
// @route   POST /api/booking/check-availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { studioId, date, startTime } = req.body;

    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      studio: studioId,
      date: {
        $gte: startOfDay(bookingDate),
        $lte: endOfDay(bookingDate)
      },
      'timeSlot.startTime': startTime,
      status: { $ne: 'cancelled' }
    });

    res.status(200).json({
      success: true,
      available: !existingBooking,
      message: existingBooking ? 'Slot is already booked' : 'Slot is available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/booking/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('studio user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate time until booking
    const now = new Date();
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.timeSlot.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    // Determine penalty
    let penaltyAmount = 0;
    if (hoursUntilBooking < 24 && hoursUntilBooking >= 0) {
      penaltyAmount = 100;
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      reason: req.body.reason || 'User cancelled',
      cancelledAt: new Date(),
      penaltyAmount
    };

    await booking.save();

    // 🔥 NEW: Send cancellation notifications
    try {
      await notificationService.handleCancellation(booking);
      console.log('✅ Cancellation notifications sent');
    } catch (notifError) {
      console.error('⚠️  Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      booking,
      message: penaltyAmount > 0 
        ? `Booking cancelled. Penalty: ₹${penaltyAmount} (payable at next booking)`
        : 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reschedule booking
// @route   PUT /api/booking/:id/reschedule
// @access  Private
export const rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newStartTime, newEndTime } = req.body;

    const booking = await Booking.findById(req.params.id).populate('studio user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this booking'
      });
    }

    // Check new slot availability
    const bookingDate = new Date(newDate);
    const existingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      studio: booking.studio._id,
      date: {
        $gte: startOfDay(bookingDate),
        $lte: endOfDay(bookingDate)
      },
      'timeSlot.startTime': newStartTime,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'New time slot is already booked'
      });
    }

    // Convert to 12-hour format
    const to12Hour = (time24) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Update booking
    booking.date = bookingDate;
    booking.timeSlot = {
      startTime: newStartTime,
      endTime: newEndTime,
      startTime12h: to12Hour(newStartTime),
      endTime12h: to12Hour(newEndTime)
    };

    await booking.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking rescheduled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status (admin only)
// @route   PUT /api/booking/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;

    if (status === 'no-show') {
      booking.cancellation = {
        reason: 'No-show',
        cancelledAt: new Date(),
        penaltyAmount: 200
      };
    }

    await booking.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/booking/admin/all
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, studioId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (studioId) query.studio = studioId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name phone')
      .populate('studio', 'name')
      .sort({ date: -1, 'timeSlot.startTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};