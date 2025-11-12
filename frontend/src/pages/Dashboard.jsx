import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isBefore, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Music,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Loader2,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'no-show': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
};

const STATUS_ICONS = {
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle,
  'no-show': AlertCircle
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/booking/my-bookings');
      const allBookings = response.data.bookings || [];
      
      setBookings(allBookings);
      
      // Calculate stats
      const now = new Date();
      const upcoming = allBookings.filter(b => 
        b.status === 'confirmed' && new Date(b.date) >= now
      ).length;
      const completed = allBookings.filter(b => b.status === 'completed').length;
      const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
      
      setStats({
        total: allBookings.length,
        upcoming,
        completed,
        cancelled
      });
      
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/booking/${bookingId}/cancel`, {
        reason: 'User requested cancellation'
      });
      
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          b.status === 'confirmed' && new Date(b.date) >= now
        );
      case 'past':
        return bookings.filter(b => 
          b.status === 'completed' || 
          b.status === 'cancelled' || 
          (b.status === 'confirmed' && new Date(b.date) < now)
        );
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your studio bookings and view history
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.upcoming}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completed}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.cancelled}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          </div>
        </motion.div>

        {/* Filter Tabs + New Booking Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Past
              </button>
            </div>

            <Button
              onClick={() => navigate('/booking')}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </div>
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700"
            >
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming bookings"
                  : filter === 'past'
                  ? "You don't have any past bookings"
                  : "You haven't made any bookings yet"}
              </p>
              <Button onClick={() => navigate('/booking')}>
                Book Your First Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            filteredBookings.map((booking, index) => {
              const StatusIcon = STATUS_ICONS[booking.status];
              const isUpcoming = booking.status === 'confirmed' && new Date(booking.date) >= new Date();
              
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Left Side - Booking Info */}
                    <div className="flex-1 space-y-3">
                      {/* Booking ID & Status */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {booking.studio?.name || 'Studio'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            #{booking.bookingId}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{format(new Date(booking.date), 'EEEE, MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{booking.timeSlot?.startTime12h} - {booking.timeSlot?.endTime12h}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Music className="w-4 h-4 text-blue-600" />
                          <span className="capitalize">{booking.sessionType?.replace('-', ' ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">₹{booking.pricing?.totalAmount}</span>
                        </div>
                      </div>

                      {/* Special Requirements */}
                      {booking.sessionDetails?.specialRequirements && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Special Requirements:</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {booking.sessionDetails.specialRequirements}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    {isUpcoming && (
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}