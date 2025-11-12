import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Users, FileText, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { studiosList } from '../../data/studios';

const BookingForm = ({ selectedSlot, onSubmit, isSubmitting }) => {
  const [selectedStudio, setSelectedStudio] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      sessionType: 'karaoke',
      participants: 1,
      musicians: 1,
      specialRequirements: ''
    }
  });

  const sessionType = watch('sessionType');

  // Pre-fill form when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      setValue('studioId', selectedSlot.studioId);
      setValue('date', selectedSlot.date);
      setValue('startTime', selectedSlot.time);
      
      // Auto-calculate end time (1 hour later)
      const [hours, minutes] = selectedSlot.time.split(':');
      const endHour = parseInt(hours) + 1;
      setValue('endTime', `${endHour.toString().padStart(2, '0')}:${minutes}`);

      const studio = studiosList.find(s => s.id === selectedSlot.studioId);
      setSelectedStudio(studio);
    }
  }, [selectedSlot, setValue]);

  const sessionTypes = [
    { value: 'karaoke', label: 'Karaoke', icon: '🎤' },
    { value: 'live-musicians', label: 'Live Musicians', icon: '🎸' },
    { value: 'band', label: 'Band Rehearsal', icon: '🥁' },
    { value: 'audio-recording', label: 'Audio Recording', icon: '🎙️' },
    { value: 'video-recording', label: 'Video Recording', icon: '🎥' },
    { value: 'fb-live', label: 'Facebook Live', icon: '📹' },
    { value: 'show', label: 'Show/Event', icon: '🎭' }
  ];

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!selectedSlot) {
    return (
      <div className="card p-8 text-center">
        <Calendar className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
        <p className="text-lg text-secondary-600 dark:text-secondary-400">
          Please select a time slot from the calendar above
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-2xl font-bold mb-6">Booking Details</h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Selected Slot Info */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {selectedStudio?.name} - {new Date(selectedSlot.date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {selectedSlot.time} (1 hour session)
            </span>
          </div>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Session Type <span className="text-error-600">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sessionTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  sessionType === type.value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400'
                }`}
              >
                <input
                  type="radio"
                  value={type.value}
                  {...register('sessionType', { required: 'Please select a session type' })}
                  className="sr-only"
                />
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
          {errors.sessionType && (
            <p className="text-sm text-error-600 mt-1">{errors.sessionType.message}</p>
          )}
        </div>

        {/* Participants/Musicians */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(sessionType === 'karaoke' || sessionType === 'show') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Number of Participants <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                {...register('participants', {
                  required: 'Please enter number of participants',
                  min: { value: 1, message: 'At least 1 participant required' },
                  max: { value: 50, message: 'Maximum 50 participants allowed' }
                })}
                className="input-field"
              />
              {errors.participants && (
                <p className="text-sm text-error-600 mt-1">{errors.participants.message}</p>
              )}
            </div>
          )}

          {(sessionType === 'live-musicians' || sessionType === 'band') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Number of Musicians <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                {...register('musicians', {
                  required: 'Please enter number of musicians',
                  min: { value: 1, message: 'At least 1 musician required' },
                  max: { value: 20, message: 'Maximum 20 musicians allowed' }
                })}
                className="input-field"
              />
              {errors.musicians && (
                <p className="text-sm text-error-600 mt-1">{errors.musicians.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Special Requirements */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Special Requirements (Optional)
          </label>
          <textarea
            rows="4"
            maxLength="500"
            placeholder="Any special equipment, arrangements, or requirements..."
            {...register('specialRequirements', {
              maxLength: { value: 500, message: 'Maximum 500 characters allowed' }
            })}
            className="input-field resize-none"
          />
          {errors.specialRequirements && (
            <p className="text-sm text-error-600 mt-1">{errors.specialRequirements.message}</p>
          )}
        </div>

        {/* Hidden fields */}
        <input type="hidden" {...register('studioId')} />
        <input type="hidden" {...register('date')} />
        <input type="hidden" {...register('startTime')} />
        <input type="hidden" {...register('endTime')} />

        {/* Pricing Info */}
        {selectedStudio && (
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Pricing Information</h4>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Base Rate: ₹{selectedStudio.pricing.basePrice}/hour
            </p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              (+ 18% GST will be added)
            </p>
            <p className="text-xs text-secondary-500 mt-2">
              💡 No advance payment required - pay at studio after your session
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
        </Button>

        {/* Terms */}
        <p className="text-xs text-secondary-500 text-center">
          By confirming, you agree to our{' '}
          <a href="/guidelines" className="text-primary-600 hover:underline">
            guidelines
          </a>{' '}
          and{' '}
          <a href="/guidelines" className="text-primary-600 hover:underline">
            cancellation policy
          </a>
        </p>
      </form>
    </motion.div>
  );
};

export default BookingForm;