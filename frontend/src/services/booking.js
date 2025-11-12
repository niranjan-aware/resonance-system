import api from './api';

const bookingService = {
  // Get timetable
  getTimetable: async (startDate, endDate, studioId = null) => {
    try {
      const params = { startDate, endDate };
      if (studioId) params.studioId = studioId;
      
      const response = await api.get('/booking/timetable', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check slot availability
  checkAvailability: async (studioId, date, startTime) => {
    try {
      const response = await api.post('/booking/check-availability', {
        studioId,
        date,
        startTime
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/booking', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's bookings
  getMyBookings: async (upcoming = false) => {
    try {
      const params = {};
      if (upcoming) params.upcoming = 'true';
      
      const response = await api.get('/booking/my-bookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/booking/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel booking
  cancelBooking: async (id, reason = '') => {
    try {
      const response = await api.put(`/booking/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reschedule booking
  rescheduleBooking: async (id, newDate, newStartTime, newEndTime) => {
    try {
      const response = await api.put(`/booking/${id}/reschedule`, {
        newDate,
        newStartTime,
        newEndTime
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default bookingService;