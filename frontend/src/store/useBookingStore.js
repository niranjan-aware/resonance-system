import { create } from 'zustand';
import bookingService from '../services/booking';
import toast from 'react-hot-toast';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  timetable: null,
  isLoading: false,
  error: null,

  // Fetch user's bookings
  fetchMyBookings: async (upcoming = false) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.getMyBookings(upcoming);
      set({ 
        bookings: data.bookings, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch bookings', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to fetch bookings');
      throw error;
    }
  },

  // Fetch timetable
  fetchTimetable: async (startDate, endDate, studioId = null) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.getTimetable(startDate, endDate, studioId);
      set({ 
        timetable: data.timetable, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch timetable', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to fetch timetable');
      throw error;
    }
  },

  // Check availability
  checkAvailability: async (studioId, date, startTime) => {
    try {
      const data = await bookingService.checkAvailability(studioId, date, startTime);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to check availability');
      throw error;
    }
  },

  // Create booking
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.createBooking(bookingData);
      
      // Add to bookings list
      set((state) => ({
        bookings: [data.booking, ...state.bookings],
        currentBooking: data.booking,
        isLoading: false
      }));
      
      toast.success(data.message || 'Booking created successfully!');
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to create booking', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to create booking');
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.getBookingById(id);
      set({ 
        currentBooking: data.booking, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch booking', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to fetch booking');
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (id, reason = '') => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.cancelBooking(id, reason);
      
      // Update in list
      set((state) => ({
        bookings: state.bookings.map(b => 
          b._id === id ? data.booking : b
        ),
        currentBooking: data.booking,
        isLoading: false
      }));
      
      toast.success(data.message || 'Booking cancelled successfully');
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to cancel booking', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to cancel booking');
      throw error;
    }
  },

  // Reschedule booking
  rescheduleBooking: async (id, newDate, newStartTime, newEndTime) => {
    set({ isLoading: true, error: null });
    try {
      const data = await bookingService.rescheduleBooking(id, newDate, newStartTime, newEndTime);
      
      // Update in list
      set((state) => ({
        bookings: state.bookings.map(b => 
          b._id === id ? data.booking : b
        ),
        currentBooking: data.booking,
        isLoading: false
      }));
      
      toast.success(data.message || 'Booking rescheduled successfully');
      return data;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to reschedule booking', 
        isLoading: false 
      });
      toast.error(error.message || 'Failed to reschedule booking');
      throw error;
    }
  },

  // Clear current booking
  clearCurrentBooking: () => {
    set({ currentBooking: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));