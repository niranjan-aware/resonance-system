import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, X, Edit, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import api from '../../services/api';

const BookingActions = ({ booking, onUpdate }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async () => {
    if (booking.status === 'cancelled') {
      toast.error('Booking is already cancelled');
      return;
    }

    setCancelling(true);
    try {
      const response = await api.put(`/booking/${booking._id}/cancel`, {
        reason: cancelReason || 'User requested cancellation'
      });

      toast.success(response.data.message);
      setShowCancelModal(false);
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const calculatePenalty = () => {
    const now = new Date();
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.timeSlot.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilBooking < 0) {
      return { penalty: 200, message: 'No-show penalty applies' };
    } else if (hoursUntilBooking < 24) {
      return { penalty: 100, message: 'Late cancellation fee applies' };
    } else {
      return { penalty: 0, message: 'Free cancellation' };
    }
  };

  const penaltyInfo = calculatePenalty();

  return (
    <div className="space-y-3">
      {/* Cancel Button */}
      {booking.status === 'confirmed' && (
        <Button
          variant="error"
          className="w-full"
          onClick={() => setShowCancelModal(true)}
        >
          <X className="w-4 h-4" />
          Cancel Booking
        </Button>
      )}

      {/* Reschedule Button */}
      {booking.status === 'confirmed' && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowRescheduleModal(true)}
        >
          <Edit className="w-4 h-4" />
          Reschedule Booking
        </Button>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !cancelling && setShowCancelModal(false)}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className={`rounded-lg p-4 ${
            penaltyInfo.penalty > 0 
              ? 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800'
              : 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                penaltyInfo.penalty > 0 ? 'text-warning-600' : 'text-success-600'
              }`} />
              <div>
                <p className="font-semibold text-sm mb-1">{penaltyInfo.message}</p>
                {penaltyInfo.penalty > 0 && (
                  <p className="text-sm">
                    A penalty of ₹{penaltyInfo.penalty} will be charged at your next booking.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Booking ID:</span>
              <span className="font-medium">{booking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Studio:</span>
              <span className="font-medium">{booking.studio.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Date & Time:</span>
              <span className="font-medium">
                {new Date(booking.date).toLocaleDateString('en-IN')} at {booking.timeSlot.startTime12h}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let us know why you're cancelling..."
              rows="3"
              className="input-field resize-none"
              disabled={cancelling}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="error"
              className="flex-1"
              onClick={handleCancel}
              disabled={cancelling}
              loading={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Booking"
        size="md"
      >
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <p className="text-lg mb-4">Reschedule feature coming soon!</p>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6">
            For now, please cancel this booking and create a new one with your preferred time.
          </p>
          <Button onClick={() => setShowRescheduleModal(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingActions;