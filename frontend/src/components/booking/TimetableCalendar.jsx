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
      
      console.log('📅 Timetable loaded:', response.data.timetable);
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

  // Handle date picker change
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setCurrentDate(selectedDate);
  };

  // Get booking that covers this time slot
  const getSlotBooking = (studioId, date, time) => {
    if (!timetableData?.bookings) return null;
    
    const currentHour = parseInt(time.split(':')[0]);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const booking = timetableData.bookings.find(b => {
      if (b.studioId !== studioId || b.date !== dateStr) {
        return false;
      }
      
      const startHour = parseInt(b.startTime.split(':')[0]);
      const endHour = parseInt(b.endTime.split(':')[0]);
      
      return currentHour >= startHour && currentHour < endHour;
    });
    
    return booking;
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
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  // ✅ Get studio colors (matching your image)
  const getStudioColor = (studioName) => {
    if (studioName.includes('Studio A')) return '#3B82F6'; // Blue
    if (studioName.includes('Studio B')) return '#92400E'; // Brown
    if (studioName.includes('Studio C')) return '#10B981'; // Green
    return '#6B7280'; // Gray default
  };

  // Get slot color based on booking
  const getSlotColor = (studio, date, time) => {
    const booking = getSlotBooking(studio.id, date, time);
    
    if (booking) {
      const studioColor = getStudioColor(studio.name);
      return {
        backgroundColor: studioColor,
        color: 'white',
        cursor: booking.isOwn ? 'pointer' : 'not-allowed',
        opacity: booking.isOwn ? 1 : 0.7
      };
    }
    
    return {
      backgroundColor: 'transparent',
      color: 'currentColor',
      cursor: 'default'
    };
  };

  // Generate time slots (8 AM - 10 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const isPM = hour >= 12;
      const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const timeLabel = `${hour12} ${isPM ? 'PM' : 'AM'}`;
      
      slots.push({
        time24,
        label: timeLabel,
        hour
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Min date for picker (today)
  const minDate = format(new Date(), 'yyyy-MM-dd');
  
  // Max date (4 months from now)
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 4);
  const maxDate = format(maxDateObj, 'yyyy-MM-dd');

  if (loading) {
    return <Loading text="Loading timetable..." />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      {/* Header with Date Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Studio Availability Calendar
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={format(currentDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              min={minDate}
              max={maxDate}
              className="px-4 py-2 pr-10 text-sm bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              style={{
                colorScheme: 'light',
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Previous 3 days"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Next 3 days"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
          <span>Studio A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#92400E' }}></div>
          <span>Studio B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span>Studio C</span>
        </div>
      </div>

      {/* Timetable - Matching Image Layout */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full border-collapse text-sm" style={{ minWidth: '700px' }}>
          <thead>
            {/* Date Row */}
            <tr>
              <th 
                colSpan="1" 
                className="border-2 border-gray-900 dark:border-gray-300 p-2 bg-gray-100 dark:bg-gray-700 font-bold text-left"
              >
                DATE
              </th>
              {dates.map((date, idx) => (
                <th
                  key={idx}
                  colSpan={timetableData?.studios?.length || 3}
                  className="border-2 border-gray-900 dark:border-gray-300 p-2 bg-gray-100 dark:bg-gray-700 text-center font-bold"
                >
                  {format(date, 'd')}
                </th>
              ))}
            </tr>

            {/* Time/Studio Row */}
            <tr>
              <th className="border-2 border-gray-900 dark:border-gray-300 p-2 bg-gray-100 dark:bg-gray-700 font-bold text-left">
                TIME/STUDIO
              </th>
              {dates.map((date, dateIdx) => (
                timetableData?.studios?.map((studio, studioIdx) => (
                  <th
                    key={`${dateIdx}-${studioIdx}`}
                    className="border-2 border-gray-900 dark:border-gray-300 p-2 bg-gray-100 dark:bg-gray-700 text-center font-bold"
                  >
                    {studio.name.includes('Studio A') ? 'A' : 
                     studio.name.includes('Studio B') ? 'B' : 
                     studio.name.includes('Studio C') ? 'C' : 
                     studio.name.charAt(studio.name.length - 1)}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, timeIdx) => (
              <tr key={timeIdx}>
                {/* Time Column */}
                <td className="border-2 border-gray-900 dark:border-gray-300 p-2 font-bold bg-gray-50 dark:bg-gray-800 whitespace-nowrap">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg">{timeSlot.hour === 12 ? '12' : timeSlot.hour > 12 ? timeSlot.hour - 12 : timeSlot.hour}</span>
                    <span className="text-xs">{timeSlot.hour >= 12 ? 'PM' : 'AM'}</span>
                  </div>
                </td>

                {/* Studio Cells for Each Date */}
                {dates.map((date, dateIdx) => (
                  timetableData?.studios?.map((studio, studioIdx) => {
                    const booking = getSlotBooking(studio.id, date, timeSlot.time24);
                    const slotStyle = getSlotColor(studio, date, timeSlot.time24);
                    const isSelected = 
                      selectedSlot?.studioId === studio.id &&
                      selectedSlot?.date === format(date, 'yyyy-MM-dd') &&
                      selectedSlot?.time === timeSlot.time24;

                    return (
                      <td
                        key={`${dateIdx}-${studioIdx}`}
                        className="border-2 border-gray-900 dark:border-gray-300 p-0 relative"
                        style={{
                          backgroundColor: slotStyle.backgroundColor,
                          cursor: slotStyle.cursor,
                          opacity: slotStyle.opacity
                        }}
                        onClick={() => handleSlotClick(studio, date, timeSlot.time24)}
                      >
                        <div 
                          className={`w-full h-12 sm:h-14 flex items-center justify-center transition-all ${
                            isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''
                          } ${
                            !booking ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                          }`}
                          style={{
                            color: slotStyle.color
                          }}
                        >
                          {/* Show indicator if booked */}
                          {booking && (
                            <div className="text-white font-bold text-xs sm:text-sm">
                              {booking.isOwn ? '★' : '●'}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-sm">
            <strong>Selected:</strong> {selectedSlot.studioName} on {format(new Date(selectedSlot.date), 'MMMM dd, yyyy')} at {selectedSlot.time}
            {selectedSlot.booking && <span className="ml-2 text-blue-600">(Your Booking)</span>}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TimetableCalendar;