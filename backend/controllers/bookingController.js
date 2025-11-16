import Booking from "../models/Booking.js";
import Studio from "../models/Studio.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";

import { format, addDays, startOfDay, endOfDay } from "date-fns";

// @desc    Create new booking (NO AUTH REQUIRED - uses phone)
// @route   POST /api/booking
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const {
      studioId,
      date,
      startTime,
      endTime,
      sessionType,
      sessionDetails,
      phone,  // ✅ Required
      name    // ✅ Optional
    } = req.body;

    // ✅ Validate phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    // ✅ Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new guest user
      user = await User.create({
        phone,
        name: name || 'Guest',
        role: 'user'
      });
      console.log('✅ Created new user:', user._id);
    } else if (name && user.name === 'Guest') {
      // Update name if provided and current name is 'Guest'
      user.name = name;
      await user.save();
      console.log('✅ Updated user name:', user.name);
    }

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

    // ✅ Calculate pricing based on duration
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const durationInHours = endHour - startHour;

    // Studio-specific pricing
    const STUDIO_PRICING = {
      'Studio A - Resonance Sinhgad Road': 600,
      'Studio B - Resonance Sinhgad Road': 800,
      'Studio C - Resonance Sinhgad Road': 1000
    };

    const pricePerHour = STUDIO_PRICING[studio.name] || studio.pricing?.basePrice || 600;
    const baseAmount = pricePerHour * durationInHours;
    const taxes = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + taxes;

    console.log(`💰 Booking Pricing:
      Studio: ${studio.name}
      Duration: ${durationInHours} hours (${startTime} - ${endTime})
      Rate: ₹${pricePerHour}/hour
      Base Amount: ₹${baseAmount}
      GST (18%): ₹${taxes}
      Total: ₹${totalAmount}
    `);

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
      user: user._id,
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

    // Send notifications (WhatsApp + Google)
    try {
      await notificationService.handleNewBooking(booking);
      console.log('✅ Notifications sent successfully');
    } catch (notifError) {
      console.error('⚠️  Notification error (booking still created):', notifError);
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

// @desc    Get bookings by phone number
// @route   POST /api/booking/by-phone
// @access  Public
export const getBookingsByPhone = async (req, res) => {
  try {
    const { phone, filter } = req.body; // ✅ Added optional filter parameter

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
        message: 'No bookings found for this phone number'
      });
    }

    // ✅ Build query - show ALL bookings by default
    const query = { user: user._id };
    
    // ✅ Optional filter: 'upcoming', 'past', or 'all' (default)
    if (filter === 'upcoming') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      query.date = { $gte: now };
      query.status = { $ne: 'cancelled' };
    } else if (filter === 'past') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      query.date = { $lt: now };
    }
    // If filter is 'all' or not provided, no date filter is applied

    // Get bookings for this user
    const bookings = await Booking.find(query)
      .populate("studio", "name size")
      .sort({ date: -1, "timeSlot.startTime": 1 }); // ✅ Newest first

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      userName: user.name
    });
  } catch (error) {
    console.error('Get bookings by phone error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings'
    });
  }
};

// @desc    Cancel booking by phone + booking ID
// @route   PUT /api/booking/:id/cancel-by-phone
// @access  Public
export const cancelBookingByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const booking = await Booking.findById(req.params.id).populate("studio user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Verify phone matches booking owner
    if (booking.user.phone !== phone) {
      return res.status(403).json({
        success: false,
        message: "Phone number does not match booking owner",
      });
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Calculate time until booking
    const now = new Date();
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.timeSlot.startTime.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    // Determine penalty
    let penaltyAmount = 0;
    if (hoursUntilBooking < 24 && hoursUntilBooking >= 0) {
      penaltyAmount = 100;
    }

    // Update booking
    booking.status = "cancelled";
    booking.cancellation = {
      reason: req.body.reason || "User cancelled",
      cancelledAt: new Date(),
      penaltyAmount,
    };

    await booking.save();

    // Send cancellation notifications
    try {
      await notificationService.handleCancellation(booking);
      console.log("✅ Cancellation notifications sent");
    } catch (notifError) {
      console.error("⚠️  Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      booking,
      message:
        penaltyAmount > 0
          ? `Booking cancelled. Penalty: ₹${penaltyAmount} (payable at next booking)`
          : "Booking cancelled successfully",
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking'
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
      .populate('user', '_id name')
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
        isOwn: false // Not applicable for public view
      }))
    };

    res.status(200).json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Timetable error:', error);
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
        $lte: endOfDay(bookingDate),
      },
      "timeSlot.startTime": startTime,
      status: { $ne: "cancelled" },
    });

    res.status(200).json({
      success: true,
      available: !existingBooking,
      message: existingBooking ? "Slot is already booked" : "Slot is available",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};