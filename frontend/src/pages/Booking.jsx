import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import TimetableCalendar from '../components/booking/TimetableCalendar';
import BookingForm from '../components/booking/BookingForm';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Booking = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();
  const { createBooking, isLoading } = useBookingStore();
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to make a booking');
      setShowAuthModal(true);
    }
  }, [isAuthenticated, setShowAuthModal]);

  // Handle slot selection from timetable
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle booking form submission
  const handleBookingSubmit = async (formData) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      setShowAuthModal(true);
      return;
    }

    try {
      const bookingData = {
        studioId: formData.studioId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        sessionType: formData.sessionType,
        sessionDetails: {
          participants: formData.participants || undefined,
          musicians: formData.musicians || undefined,
          specialRequirements: formData.specialRequirements || undefined
        }
      };

      const result = await createBooking(bookingData);
      
      // Show success
      setCreatedBooking(result.booking);
      setBookingSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  // Reset and create another booking
  const handleBookAnother = () => {
    setBookingSuccess(false);
    setCreatedBooking(null);
    setSelectedSlot(null);
    setSelectedStudio(null);
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <section className="bg-gradient-primary text-white py-20">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Book Your Studio
              </h1>
              <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
                Login to start booking your perfect studio session
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-md mx-auto card p-8 text-center">
              <Calendar className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                Please login or create an account to book a studio session
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setShowAuthModal(true)}
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess && createdBooking) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <section className="bg-gradient-primary text-white py-20">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-success-400" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Booking Confirmed! 🎉
              </h1>
              <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
                Your studio session has been successfully booked
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 space-y-6"
              >
                <div className="text-center pb-6 border-b border-secondary-200 dark:border-secondary-700">
                  <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Booking ID: <span className="font-mono font-semibold text-primary-600">{createdBooking.bookingId}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-secondary-200 dark:border-secondary-700">
                    <span className="text-secondary-600 dark:text-secondary-400">Studio</span>
                    <span className="font-semibold">{createdBooking.studio?.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-secondary-200 dark:border-secondary-700">
                    <span className="text-secondary-600 dark:text-secondary-400">Date</span>
                    <span className="font-semibold">
                      {new Date(createdBooking.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-secondary-200 dark:border-secondary-700">
                    <span className="text-secondary-600 dark:text-secondary-400">Time</span>
                    <span className="font-semibold">
                      {createdBooking.timeSlot?.startTime12h} - {createdBooking.timeSlot?.endTime12h}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-secondary-200 dark:border-secondary-700">
                    <span className="text-secondary-600 dark:text-secondary-400">Session Type</span>
                    <span className="font-semibold capitalize">{createdBooking.sessionType?.replace('-', ' ')}</span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-secondary-600 dark:text-secondary-400">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{createdBooking.pricing?.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                  <p className="text-sm text-success-800 dark:text-success-200 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>WhatsApp Confirmation Sent!</strong><br />
                      Check your WhatsApp for booking details and reminders.
                    </span>
                  </p>
                </div>

                <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    <strong>Payment:</strong> No advance payment required. Pay ₹{createdBooking.pricing?.totalAmount} at the studio after your session.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBookAnother}
                  >
                    Book Another Session
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    View My Bookings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main booking interface
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Book Your Studio
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Select your time slot and confirm your booking
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="py-8 bg-secondary-50 dark:bg-secondary-900">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              !selectedSlot ? 'bg-primary-600 text-white' : 'bg-white dark:bg-secondary-800 text-secondary-600'
            }`}>
              <span className="w-6 h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-sm font-medium">Select Slot</span>
            </div>
            <div className="w-8 h-0.5 bg-secondary-300 dark:bg-secondary-700"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              selectedSlot ? 'bg-primary-600 text-white' : 'bg-white dark:bg-secondary-800 text-secondary-400'
            }`}>
              <span className="w-6 h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-sm font-medium">Fill Details</span>
            </div>
            <div className="w-8 h-0.5 bg-secondary-300 dark:bg-secondary-700"></div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-secondary-800 text-secondary-400">
              <span className="w-6 h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timetable - Left/Top */}
            <div className="lg:col-span-2">
              <TimetableCalendar 
                onSlotSelect={handleSlotSelect}
                selectedStudio={selectedStudio}
              />
            </div>

            {/* Booking Form - Right/Bottom */}
            <div className="lg:col-span-1">
              <BookingForm
                selectedSlot={selectedSlot}
                onSubmit={handleBookingSubmit}
                isSubmitting={isLoading}
              />
            </div>
          </div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="card p-6 bg-secondary-50 dark:bg-secondary-800">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-1">🟢 Green slots are available</p>
                </div>
                <div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-1">🔵 Blue slots are your bookings</p>
                </div>
                <div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-1">⚫ Gray slots are booked by others</p>
                </div>
              </div>
              <p className="text-xs text-secondary-500 mt-4">
                💡 No advance payment required. You'll pay at the studio after your session.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Booking;