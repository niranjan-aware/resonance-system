import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import api from '../../services/api';
import Loading from '../common/Loading';

const TimetableCalendar = ({ onSlotSelect, selectedStudio }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Generate 3 consecutive days starting from current date
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      dates.push(addDays(currentDate, i));
    }
    return dates;
  };

  const dates = getDates();

  // Fetch timetable data
  useEffect(() => {
    fetchTimetable();
  }, [currentDate, selectedStudio]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const startDate = format(dates[0], 'yyyy-MM-dd');
      const endDate = format(dates[2], 'yyyy-MM-dd');

      const params = {
        startDate,
        endDate
      };

      if (selectedStudio) {
        params.studioId = selectedStudio;
      }

      const response = await api.get('/booking/timetable', { params });
      setTimetableData(response.data.timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate dates
  const goToPrevious = () => {
    setCurrentDate(prev => addDays(prev, -3));
  };

  const goToNext = () => {
    setCurrentDate(prev => addDays(prev, 3));
  };

  // Check if slot is booked
  const isSlotBooked = (studioId, date, time) => {
    if (!timetableData?.bookings) return false;
    
    return timetableData.bookings.some(
      booking =>
        booking.studioId === studioId &&
        booking.date === format(date, 'yyyy-MM-dd') &&
        booking.startTime === time
    );
  };

  // Get booking for slot
  const getSlotBooking = (studioId, date, time) => {
    if (!timetableData?.bookings) return null;
    
    return timetableData.bookings.find(
      booking =>
        booking.studioId === studioId &&
        booking.date === format(date, 'yyyy-MM-dd') &&
        booking.startTime === time
    );
  };

  // Handle slot click
  const handleSlotClick = (studio, date, time) => {
    const booking = getSlotBooking(studio.id, date, time);
    
    if (booking && !booking.isOwn) {
      return; // Can't select other's bookings
    }

    const slot = {
      studioId: studio.id,
      studioName: studio.name,
      date: format(date, 'yyyy-MM-dd'),
      time: time,
      booking: booking
    };

    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  // Get slot color
  const getSlotColor = (studio, date, time) => {
    const booking = getSlotBooking(studio.id, date, time);
    
    if (booking) {
      return booking.isOwn
        ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer' // User's booking - Blue
        : 'bg-secondary-400 text-white cursor-not-allowed'; // Others' booking - Brown/Gray
    }
    
    return 'bg-success-500 hover:bg-success-600 text-white cursor-pointer'; // Available - Green
  };

  if (loading) {
    return <Loading text="Loading timetable..." />;
  }

  return (
    <div className="card p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          Select Time Slot
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-500 rounded"></div>
          <span>Your Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary-400 rounded"></div>
          <span>Booked by Others</span>
        </div>
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="border border-secondary-300 dark:border-secondary-700 p-2 bg-secondary-100 dark:bg-secondary-800 sticky left-0 z-10">
                Time / Studio
              </th>
              {dates.map((date, idx) => (
                <th
                  key={idx}
                  className="border border-secondary-300 dark:border-secondary-700 p-2 bg-secondary-100 dark:bg-secondary-800 text-center"
                >
                  <div className="font-semibold">{format(date, 'EEE')}</div>
                  <div className="text-sm">{format(date, 'MMM dd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetableData?.studios?.map((studio) => (
              <tr key={studio.id}>
                <td className="border border-secondary-300 dark:border-secondary-700 p-2 font-medium bg-secondary-50 dark:bg-secondary-900 sticky left-0 z-10">
                  {studio.name}
                </td>
                {dates.map((date, dateIdx) => (
                  <td
                    key={dateIdx}
                    className="border border-secondary-300 dark:border-secondary-700 p-1"
                  >
                    <div className="space-y-1">
                      {timetableData?.timeSlots?.map((time, timeIdx) => {
                        const booking = getSlotBooking(studio.id, date, time);
                        const colorClass = getSlotColor(studio, date, time);
                        const isSelected = 
                          selectedSlot?.studioId === studio.id &&
                          selectedSlot?.date === format(date, 'yyyy-MM-dd') &&
                          selectedSlot?.time === time;

                        return (
                          <motion.button
                            key={timeIdx}
                            whileHover={{ scale: booking && !booking.isOwn ? 1 : 1.05 }}
                            whileTap={{ scale: booking && !booking.isOwn ? 1 : 0.95 }}
                            onClick={() => handleSlotClick(studio, date, time)}
                            disabled={booking && !booking.isOwn}
                            className={`w-full px-2 py-1 rounded text-xs font-medium transition-all ${colorClass} ${
                              isSelected ? 'ring-2 ring-accent-500 ring-offset-2' : ''
                            }`}
                          >
                            {time}
                          </motion.button>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableCalendar;