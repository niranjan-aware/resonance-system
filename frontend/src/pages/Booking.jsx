import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { format, addDays } from "date-fns";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  User,
  Search,
  Trash2,
  XCircle
} from "lucide-react";

import Button from "../components/common/Button";
import api from "../services/api";

const sessionTypes = [
  { value: "karaoke", label: "Karaoke", icon: "🎤", groups: ["1-5", "6-10", "11-15"] },
  { value: "live-musicians", label: "Live Musicians", icon: "🎸", groups: ["1-3", "4-6", "7-10"] },
  { value: "band", label: "Band Rehearsal", icon: "🥁", groups: ["2-5", "6-8"] },
  { value: "audio-recording", label: "Audio Recording", icon: "🎙️", groups: ["1-2", "3-5"] },
  { value: "video-recording", label: "Video Recording", icon: "🎥", groups: ["1-5", "6-10"] },
  { value: "fb-live", label: "Live Streaming", icon: "📹", groups: ["1-5", "6-10"] },
  { value: "show", label: "Show/Event", icon: "🎭", groups: ["10-20", "21-50"] },
];

const STUDIO_INFO = {
  "Studio A - Resonance Sinhgad Road": { size: "Small", price: 600, color: "bg-blue-500" },
  "Studio B - Resonance Sinhgad Road": { size: "Medium", price: 800, color: "bg-amber-700" },
  "Studio C - Resonance Sinhgad Road": { size: "Large", price: 1000, color: "bg-green-500" },
};

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
};

export default function BookingNew() {
  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [timetableData, setTimetableData] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [studios, setStudios] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Bookings state
  const [myBookingsPhone, setMyBookingsPhone] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sessionType: "",
      groupSize: "",
      studioId: "",
      date: "",
      startTime: "",
      endTime: "",
      specialRequirements: "",
      phone: "",
      name: ""
    },
  });

  const watchAll = watch();
  const { sessionType, groupSize, studioId, date, startTime, endTime } = watchAll;

  // Check screen size for responsive calendar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate dates for calendar (1 for mobile, 3 for desktop)
  const getCalendarDates = () => {
    const dates = [];
    const count = isMobile ? 1 : 3;
    for (let i = 0; i < count; i++) {
      dates.push(addDays(calendarDate, i));
    }
    return dates;
  };

  const calendarDates = getCalendarDates();

  // Fetch studios on mount
  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      const response = await api.get("/studio");
      setStudios(response.data.studios || []);
    } catch (error) {
      console.error("Failed to fetch studios:", error);
      toast.error("Failed to load studios");
    }
  };

  // Fetch calendar timetable
  useEffect(() => {
    fetchTimetable();
  }, [calendarDate, isMobile]);

  const fetchTimetable = async () => {
    setLoadingCalendar(true);
    try {
      const startDate = format(calendarDates[0], "yyyy-MM-dd");
      const endDate = format(calendarDates[calendarDates.length - 1], "yyyy-MM-dd");

      const response = await api.get("/booking/timetable", {
        params: { startDate, endDate },
      });

      setTimetableData(response.data.timetable);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Sync calendar view with selected form date
  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      const calendarStart = calendarDate;
      const calendarEnd = addDays(calendarDate, isMobile ? 0 : 2);
      
      if (selectedDate < calendarStart || selectedDate > calendarEnd) {
        setCalendarDate(selectedDate);
      }
    }
  }, [date, calendarDate, isMobile]);

  // Navigate calendar
  const goToPrevious = () => {
    const daysToMove = isMobile ? 1 : 3;
    setCalendarDate((prev) => addDays(prev, -daysToMove));
  };

  const goToNext = () => {
    const daysToMove = isMobile ? 1 : 3;
    setCalendarDate((prev) => addDays(prev, daysToMove));
  };

  // Get calendar slot color based on studio and booking
  const getCalendarSlotColor = (studioId, studioName, date, time) => {
    if (!timetableData?.bookings) {
      return "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600";
    }

    const currentHour = parseInt(time.split(":")[0]);
    const dateStr = format(date, "yyyy-MM-dd");

    const booking = timetableData.bookings.find((b) => {
      if (b.studioId !== studioId || b.date !== dateStr) return false;
      const startHour = parseInt(b.startTime.split(":")[0]);
      const endHour = parseInt(b.endTime.split(":")[0]);
      return currentHour >= startHour && currentHour < endHour;
    });

    if (booking) {
      return `${STUDIO_INFO[studioName]?.color || 'bg-gray-500'} text-white`;
    }

    return "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600";
  };

  // Studio recommendations
  useEffect(() => {
    if (sessionType && groupSize && studios.length > 0) {
      const groupNum = parseInt(groupSize.split("-")[1] || groupSize.split("-")[0]);

      const suitable = studios
        .filter((studio) => studio.capacity >= groupNum)
        .map((studio) => ({
          ...studio,
          price: STUDIO_INFO[studio.name]?.price || studio.pricing?.basePrice || 0,
        }))
        .sort((a, b) => a.price - b.price);

      setRecommendations(suitable);

      if (suitable.length > 0 && !studioId) {
        setValue("studioId", suitable[0]._id);
      }
    }
  }, [sessionType, groupSize, studios, studioId, setValue]);

  // Fetch availability when date changes
  useEffect(() => {
    if (date && studioId) {
      fetchAvailability(studioId, date);
    }
  }, [date, studioId]);

  const fetchAvailability = async (studio, selectedDate) => {
    setCheckingAvailability(true);
    try {
      const response = await api.get("/booking/timetable", {
        params: { startDate: selectedDate, endDate: selectedDate, studioId: studio },
      });

      const bookings = response.data.timetable?.bookings || [];
      const booked = bookings.map((b) => ({
        start: parseInt(b.startTime.split(":")[0]),
        end: parseInt(b.endTime.split(":")[0]),
      }));

      setBookedSlots(booked);

      const available = [];
      for (let hour = 8; hour < 22; hour++) {
        const isBooked = booked.some((slot) => hour >= slot.start && hour < slot.end);
        if (!isBooked) {
          available.push({
            value: `${hour.toString().padStart(2, "0")}:00`,
            label: formatTime(hour),
            hour,
          });
        }
      }

      setAvailableStartTimes(available);
      setValue("startTime", "");
      setValue("endTime", "");
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      toast.error("Failed to check availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Generate end times
  useEffect(() => {
    if (startTime && bookedSlots.length >= 0) {
      const startHour = parseInt(startTime.split(":")[0]);
      const endTimes = [];

      let nextBookedHour = 22;
      for (const booking of bookedSlots) {
        if (booking.start > startHour && booking.start < nextBookedHour) {
          nextBookedHour = booking.start;
        }
      }

      for (let hour = startHour + 1; hour <= nextBookedHour && hour <= 22; hour++) {
        endTimes.push({
          value: `${hour.toString().padStart(2, "0")}:00`,
          label: formatTime(hour),
          hour,
        });
      }

      setAvailableEndTimes(endTimes);

      if (endTimes.length > 0 && !endTime) {
        setValue("endTime", endTimes[0].value);
      }
    }
  }, [startTime, bookedSlots, endTime, setValue]);

  const formatTime = (hour) => {
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 N";
    return `${hour - 12} PM`;
  };

  // Format time range for display  
  const formatTimeRange = (start, end) => {
    const startHour = start < 12 ? start : (start === 12 ? 12 : start - 12);
    const endHour = end < 12 ? end : (end === 12 ? 12 : end - 12);
    const startPeriod = start < 12 ? 'AM' : 'PM';
    const endPeriod = end < 12 ? 'AM' : 'PM';
    
    if (startPeriod === endPeriod) {
      return `${startHour}-${endHour} ${endPeriod}`;
    }
    return `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
  };

  // Get available time ranges
  const getAvailableRanges = () => {
    if (availableStartTimes.length === 0) {
      return [];
    }

    const ranges = [];
    let currentRange = {
      start: availableStartTimes[0].hour,
      end: availableStartTimes[0].hour + 1
    };

    for (let i = 1; i < availableStartTimes.length; i++) {
      const currentHour = availableStartTimes[i].hour;
      
      if (currentHour === currentRange.end) {
        currentRange.end = currentHour + 1;
      } else {
        ranges.push({ ...currentRange });
        currentRange = {
          start: currentHour,
          end: currentHour + 1
        };
      }
    }

    ranges.push(currentRange);
    
    return ranges;
  };

  // Calculate summary
  const calculateSummary = (data) => {
    const studio = studios.find((s) => s._id === data.studioId);
    if (!studio) return null;

    const startHour = parseInt(data.startTime.split(":")[0]);
    const endHour = parseInt(data.endTime.split(":")[0]);
    const duration = endHour - startHour;

    const studioInfo = STUDIO_INFO[studio.name] || {};
    const baseRate = studioInfo.price || studio.pricing?.basePrice || 0;
    const totalAmount = baseRate * duration;

    return {
      studio: studio.name,
      studioSize: studioInfo.size,
      date: format(new Date(data.date), "EEEE, MMMM dd, yyyy"),
      startTime: formatTime(startHour),
      endTime: formatTime(endHour),
      duration,
      sessionType: sessionTypes.find((t) => t.value === data.sessionType)?.label,
      sessionIcon: sessionTypes.find((t) => t.value === data.sessionType)?.icon,
      groupSize: data.groupSize,
      ratePerHour: baseRate,
      totalAmount,
      specialRequirements: data.specialRequirements,
      phone: data.phone,
      name: data.name
    };
  };

  const onReview = (data) => {
    // Additional validation for times
    if (!data.startTime || !data.endTime) {
      toast.error("Please select both start time and end time");
      return;
    }

    const summary = calculateSummary(data);
    if (!summary) {
      toast.error("Unable to calculate booking summary");
      return;
    }

    setBookingSummary(summary);
    setShowConfirmation(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onConfirm = async () => {
    // Validate required fields before submission
    if (!watchAll.startTime || !watchAll.endTime) {
      toast.error("Please select both start time and end time");
      setShowConfirmation(false);
      return;
    }

    if (!watchAll.studioId || !watchAll.date || !watchAll.sessionType || !watchAll.phone) {
      toast.error("Please fill in all required fields");
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        studioId: watchAll.studioId,
        date: format(new Date(watchAll.date), "yyyy-MM-dd"),
        startTime: watchAll.startTime,
        endTime: watchAll.endTime,
        sessionType: watchAll.sessionType,
        sessionDetails: {
          participants: parseInt(watchAll.groupSize.split("-")[1] || watchAll.groupSize.split("-")[0]),
          specialRequirements: watchAll.specialRequirements || "",
        },
        phone: watchAll.phone,
        name: watchAll.name || null
      };

      await api.post("/booking", bookingData);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      toast.success("🎉 Booking confirmed!");
      
      reset();
      setShowConfirmation(false);
      setRecommendations([]);
      setAvailableStartTimes([]);
      setAvailableEndTimes([]);
      fetchTimetable();

      if (watchAll.phone) {
        setMyBookingsPhone(watchAll.phone);
        setTimeout(() => fetchMyBookings(watchAll.phone), 1000);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch bookings by phone
  const fetchMyBookings = async (phone) => {
    if (!phone || phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingMyBookings(true);
    try {
      const response = await api.post("/booking/by-phone", { phone });
      setMyBookings(response.data.bookings || []);
      setShowMyBookings(true);
      
      if (response.data.count === 0) {
        toast.info("No bookings found for this phone number");
      } else {
        toast.success(`Found ${response.data.count} booking(s)`);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Failed to fetch bookings");
      setMyBookings([]);
    } finally {
      setLoadingMyBookings(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await api.put(`/booking/${bookingId}/cancel-by-phone`, {
        phone: myBookingsPhone
      });
      
      toast.success("Booking cancelled successfully");
      fetchMyBookings(myBookingsPhone);
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = format(tomorrow, "yyyy-MM-dd");

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 4);
  const maxDateStr = format(maxDate, "yyyy-MM-dd");

  const selectedSessionType = sessionTypes.find((t) => t.value === sessionType);

  // Generate time slots from 8 AM to 10 PM with ranges
  const timeSlots = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push({
      time24: `${hour.toString().padStart(2, "0")}:00`,
      hour: hour,
      label: formatTimeRange(hour, hour + 1)
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 mt-5">
            🎵 Resonance - Sinhgad Road
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Book Your Perfect Studio Session</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            📍 45, Shivprasad Housing Society, Panmala, Dattawadi, Pune - 411 030
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">⏰ Open: 8:00 AM - 10:00 PM (Every Day)</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div key="booking-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* CALENDAR LAYOUT */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${isMobile ? 'p-3' : 'p-4 md:p-6'} border border-gray-200 dark:border-gray-700`}>
                
                {/* Header with Date Picker */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h2 className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-bold flex items-center gap-2`}>
                    <span>Studio Availability</span>
                  </h2>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Date Picker */}
                    <div className="relative flex-1 sm:flex-initial">
                      <input
                        type="date"
                        value={format(calendarDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          if (e.target.value) {
                            setCalendarDate(new Date(e.target.value));
                          }
                        }}
                        min={format(new Date(), "yyyy-MM-dd")}
                        max={maxDateStr}
                        className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto`}
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={goToPrevious} 
                        className={`${isMobile ? 'p-1' : 'p-2'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        title={isMobile ? "Previous day" : "Previous 3 days"}
                      >
                        <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      </button>
                      <button 
                        onClick={goToNext} 
                        className={`${isMobile ? 'p-1' : 'p-2'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        title={isMobile ? "Next day" : "Next 3 days"}
                      >
                        <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'} mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-blue-500 rounded`}></div>
                    <span>Studio A</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-amber-700 rounded`}></div>
                    <span>Studio B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-green-500 rounded`}></div>
                    <span>Studio C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-white border border-gray-300 rounded`}></div>
                    <span>Available</span>
                  </div>
                </div>

                {loadingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        {/* Date Row */}
                        <tr>
                          <th 
                            className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" 
                            style={{ 
                              width: isMobile ? '28%' : '100px',
                              padding: isMobile ? '8px 4px' : '8px',
                              fontSize: isMobile ? '11px' : '14px'
                            }}
                          >
                            <div className="font-bold">TIME</div>
                          </th>
                          {calendarDates.map((date, idx) => (
                            <th
                              key={idx}
                              colSpan={3}
                              className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-center"
                              style={{ 
                                padding: isMobile ? '8px 4px' : '8px',
                                fontSize: isMobile ? '13px' : '14px'
                              }}
                            >
                              <div className="font-bold">{format(date, "dd")}</div>
                              <div style={{ fontSize: isMobile ? '10px' : '12px' }} className="text-gray-600 dark:text-gray-400">{format(date, "MMM")}</div>
                            </th>
                          ))}
                        </tr>

                        {/* Studio Row */}
                        <tr>
                          <th 
                            className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                            style={{ 
                              padding: isMobile ? '8px 4px' : '8px',
                              fontSize: isMobile ? '11px' : '14px'
                            }}
                          >
                            <div className="font-bold">STUDIO</div>
                          </th>
                          {calendarDates.map((date, dateIdx) => (
                            <Fragment key={dateIdx}>
                              <th 
                                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                style={{ 
                                  width: isMobile ? '24%' : '80px',
                                  padding: isMobile ? '8px 4px' : '8px',
                                  fontSize: isMobile ? '12px' : '14px'
                                }}
                              >
                                <div className="font-bold">A</div>
                              </th>
                              <th 
                                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                style={{ 
                                  width: isMobile ? '24%' : '80px',
                                  padding: isMobile ? '8px 4px' : '8px',
                                  fontSize: isMobile ? '12px' : '14px'
                                }}
                              >
                                <div className="font-bold">B</div>
                              </th>
                              <th 
                                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                style={{ 
                                  width: isMobile ? '24%' : '80px',
                                  padding: isMobile ? '8px 4px' : '8px',
                                  fontSize: isMobile ? '12px' : '14px'
                                }}
                              >
                                <div className="font-bold">C</div>
                              </th>
                            </Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((timeSlot, timeIdx) => {
                          return (
                            <tr key={timeIdx}>
                              {/* Time Column with Range */}
                              <td 
                                className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-medium"
                                style={{ 
                                  padding: isMobile ? '10px 4px' : '8px',
                                  fontSize: isMobile ? '11px' : '12px'
                                }}
                              >
                                <div className="flex items-center justify-center">
                                  <span className="whitespace-nowrap">{timeSlot.label}</span>
                                </div>
                              </td>

                              {/* Studio Columns for each date */}
                              {calendarDates.map((calDate, dateIdx) => (
                                <Fragment key={dateIdx}>
                                  {timetableData?.studios?.map((studio, studioIdx) => {
                                    const colorClass = getCalendarSlotColor(studio.id, studio.name, calDate, timeSlot.time24);
                                    return (
                                      <td
                                        key={`${dateIdx}-${studioIdx}`}
                                        className={`border border-gray-300 dark:border-gray-600 ${colorClass}`}
                                        style={{ 
                                          padding: 0,
                                          height: isMobile ? '40px' : '32px'
                                        }}
                                      >
                                        <div style={{ height: '100%', width: '100%' }}></div>
                                      </td>
                                    );
                                  })}
                                </Fragment>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* FORM */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">📝 Booking Request Form</h2>

                <form onSubmit={handleSubmit(onReview)} className="space-y-5">
                  
                  {/* Phone Number - REQUIRED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number (10 numbers only) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit phone number"
                        }
                      })}
                      placeholder="9876543210"
                      autoComplete="tel"
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Name - OPTIONAL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="John Doe"
                      autoComplete="name"
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Type <span className="text-red-500">*</span>
                    </label>
                    <select {...register("sessionType", { required: "Please select session type" })} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Choose session type</option>
                      {sessionTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                      ))}
                    </select>
                    {errors.sessionType && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.sessionType.message}
                      </p>
                    )}
                  </div>

                  {/* Group Size */}
                  {sessionType && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Group Size <span className="text-red-500">*</span>
                      </label>
                      <select {...register("groupSize", { required: "Please select group size" })} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Choose group size</option>
                        {selectedSessionType?.groups.map((size) => (
                          <option key={size} value={size}>{size} participants</option>
                        ))}
                      </select>
                      {errors.groupSize && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.groupSize.message}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                        <Info className="w-4 h-4" />
                        Recommended for you:
                      </div>
                      <div className="space-y-2">
                        {recommendations.map((studio) => (
                          <div key={studio._id} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-yellow-900 dark:text-yellow-200">
                              {studio.name} ({STUDIO_INFO[studio.name]?.size})
                            </span>
                            <span className="font-semibold text-yellow-800 dark:text-yellow-300">₹{studio.price}/hr</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Studio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Studio <span className="text-red-500">*</span>
                    </label>
                    <select {...register("studioId", { required: "Please select a studio" })} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!sessionType || !groupSize}>
                      <option value="">{!sessionType ? "Choose session type first" : !groupSize ? "Choose group size first" : "Choose a studio"}</option>
                      {recommendations.length > 0
                        ? recommendations.map((studio) => (
                            <option key={studio._id} value={studio._id}>{studio.name} - ₹{studio.price}/hr ({STUDIO_INFO[studio.name]?.size})</option>
                          ))
                        : studios.map((studio) => (
                            <option key={studio._id} value={studio._id}>{studio.name} - ₹{STUDIO_INFO[studio.name]?.price || 0}/hr</option>
                          ))}
                    </select>
                    {errors.studioId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.studioId.message}
                      </p>
                    )}
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative">
                      <input
                        type="date"
                        {...register("date", {
                          required: "Please select a date",
                          validate: {
                            notPast: (value) => {
                              if (!value) return true;
                              const selected = new Date(value);
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              tomorrow.setHours(0, 0, 0, 0);
                              selected.setHours(0, 0, 0, 0);
                              return selected >= tomorrow || "Bookings start from tomorrow";
                            },
                            notTooFar: (value) => {
                              if (!value) return true;
                              const selected = new Date(value);
                              const maxDate = new Date();
                              maxDate.setMonth(maxDate.getMonth() + 4);
                              return selected <= maxDate || "Cannot book more than 4 months ahead";
                            }
                          }
                        })}
                        min={minDate}
                        max={maxDateStr}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setValue("date", selectedDate);
                          
                          if (selectedDate) {
                            const dateObj = new Date(selectedDate);
                            setCalendarDate(dateObj);
                          }
                        }}
                        className="w-full px-4 py-2.5 pr-10 text-base bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                        disabled={!studioId}
                      />
                      <div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      >
                      </div>
                    </div>

                    {!studioId && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Please select a studio first
                      </p>
                    )}
                    
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.date.message}
                      </p>
                    )}
                    
                    {date && !errors.date && (
                      <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {format(new Date(date), "EEEE, MMMM dd, yyyy")}
                      </p>
                    )}
                  </div>

                  {/* Availability Display */}
                  {checkingAvailability && date && studioId && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking availability...</span>
                    </div>
                  )}

                  {!checkingAvailability && date && studioId && (
                    <div className="space-y-3">
                      {/* Booked Slots */}
                      {bookedSlots.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium mb-1">Already Booked Time Slots:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {bookedSlots.map((slot, idx) => (
                                  <li key={idx}>{formatTimeRange(slot.start, slot.end)}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Available Time Ranges */}
                      {availableStartTimes.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium mb-1">Available Time Ranges:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {getAvailableRanges().map((range, idx) => (
                                  <li key={idx}>{formatTimeRange(range.start, range.end)}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Available Slots */}
                      {availableStartTimes.length === 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
                            <AlertCircle className="w-4 h-4" />
                            <p className="font-medium">No available time slots for this date. Please choose another date.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <select {...register("startTime", { required: "Please select start time" })} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!date || !studioId || checkingAvailability || availableStartTimes.length === 0}>
                      <option value="">{!date ? "Select date first" : !studioId ? "Select studio first" : checkingAvailability ? "Checking..." : availableStartTimes.length === 0 ? "No slots available" : "Choose start time"}</option>
                      {availableStartTimes.map((slot) => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                    {errors.startTime && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <select {...register("endTime", { required: "Please select end time" })} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!startTime}>
                      <option value="">{!startTime ? "Select start time first" : availableEndTimes.length === 0 ? "No end times available" : "Choose end time"}</option>
                      {availableEndTimes.map((slot) => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                    {errors.endTime && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.endTime.message}
                      </p>
                    )}
                    {startTime && endTime && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Duration: {parseInt(endTime.split(":")[0]) - parseInt(startTime.split(":")[0])} hour(s)
                      </p>
                    )}
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Requirements (Optional)</label>
                    <textarea {...register("specialRequirements")} rows={3} className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Any special equipment or arrangements needed..." />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={checkingAvailability || availableStartTimes.length === 0}>
                    Review Booking
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </motion.div>

              {/* MY BOOKINGS SECTION */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold text-center text-purple-600 dark:text-purple-400 mb-6">
                  🔍 View My Bookings
                </h2>

                <div className="flex gap-3 mb-6">
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={myBookingsPhone}
                      onChange={(e) => setMyBookingsPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter your phone number (10 digits)"
                      autoComplete="tel"
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          fetchMyBookings(myBookingsPhone);
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => fetchMyBookings(myBookingsPhone)}
                    disabled={loadingMyBookings || myBookingsPhone.length !== 10}
                    loading={loadingMyBookings}
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>

                {showMyBookings && (
                  <div className="space-y-4">
                    {myBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No upcoming bookings found for this phone number</p>
                      </div>
                    ) : (
                      myBookings.map((booking) => {
                        return (
                          <div
                            key={booking._id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{booking.studio?.name}</h3>
                                <p className="text-xs text-gray-500 font-mono">#{booking.bookingId}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>{booking.timeSlot?.startTime12h} - {booking.timeSlot?.endTime12h}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold">₹{booking.pricing?.totalAmount}</span>
                              
                              {booking.status === 'confirmed' && (
                                <Button
                                  variant="error"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </motion.div>

            </motion.div>
          ) : (
            <motion.div key="confirmation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Confirm Your Booking</h2>
                <p className="text-gray-600 dark:text-gray-400">Please review your booking details</p>
              </div>

              {bookingSummary && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-4 space-y-3">
                    
                    <div className="flex justify-between items-start border-b pb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                        📱 {bookingSummary.phone}
                        {bookingSummary.name && <><br/>👤 {bookingSummary.name}</>}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Studio:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{bookingSummary.studio} <br /><span className="text-xs text-gray-500">({bookingSummary.studioSize})</span></span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{bookingSummary.date}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{bookingSummary.startTime} - {bookingSummary.endTime}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{bookingSummary.duration} hour(s)</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Session:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{bookingSummary.sessionIcon} {bookingSummary.sessionType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Participants:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{bookingSummary.groupSize}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Rate per hour:</span>
                      <span className="font-medium">₹{bookingSummary.ratePerHour}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">{bookingSummary.duration} hour(s)</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2 mt-3">
                      <span>Total Amount:</span>
                      <span className="text-blue-600 dark:text-blue-400">₹{bookingSummary.totalAmount}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">💡 <strong>No advance payment required.</strong> Pay ₹{bookingSummary.totalAmount} at the studio after your session.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => { 
                    setShowConfirmation(false); 
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }} 
                  disabled={isSubmitting}
                >
                  ← Back
                </Button>
                <Button variant="primary" className="flex-1" onClick={onConfirm} loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Confirm Booking"} ✓</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}