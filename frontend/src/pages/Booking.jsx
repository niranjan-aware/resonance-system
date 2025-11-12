import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { format, addDays } from "date-fns";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Music,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import Button from "../components/common/Button";
import { useAuthStore } from "../store/useAuthStore";
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
  "Studio A - Resonance Sinhgad Road": { size: "Small", price: 600 },
  "Studio B - Resonance Sinhgad Road": { size: "Medium", price: 800 },
  "Studio C - Resonance Sinhgad Road": { size: "Large", price: 1000 },
};

export default function BookingNew() {
  const { user, isAuthenticated, setShowAuthModal } = useAuthStore();

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [timetableData, setTimetableData] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

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
    },
  });

  const watchAll = watch();
  const { sessionType, groupSize, studioId, date, startTime, endTime } = watchAll;

  // Generate 3 consecutive days for calendar
  const getCalendarDates = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
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
  }, [calendarDate]);

  const fetchTimetable = async () => {
    setLoadingCalendar(true);
    try {
      const startDate = format(calendarDates[0], "yyyy-MM-dd");
      const endDate = format(calendarDates[2], "yyyy-MM-dd");

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
      const calendarEnd = addDays(calendarDate, 2);
      
      if (selectedDate < calendarStart || selectedDate > calendarEnd) {
        setCalendarDate(selectedDate);
      }
    }
  }, [date]);

  // Navigate calendar
  const goToPrevious = () => {
    setCalendarDate((prev) => addDays(prev, -3));
  };

  const goToNext = () => {
    setCalendarDate((prev) => addDays(prev, 3));
  };

  // Handle calendar date click
  const handleCalendarDateClick = (clickedDate) => {
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    setValue('date', dateStr);
    
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    toast.success(`Date selected: ${format(clickedDate, 'MMM dd, yyyy')}`);
  };

  // Get calendar slot color
  const getCalendarSlotColor = (studioId, date, time) => {
    if (!timetableData?.bookings) return "bg-green-500 text-white";

    const currentHour = parseInt(time.split(":")[0]);
    const dateStr = format(date, "yyyy-MM-dd");

    const booking = timetableData.bookings.find((b) => {
      if (b.studioId !== studioId || b.date !== dateStr) return false;
      const startHour = parseInt(b.startTime.split(":")[0]);
      const endHour = parseInt(b.endTime.split(":")[0]);
      return currentHour >= startHour && currentHour < endHour;
    });

    if (booking) {
      return booking.isOwn ? "bg-blue-500 text-white" : "bg-gray-400 text-white";
    }

    return "bg-green-500 text-white";
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
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
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
    const subtotal = baseRate * duration;
    const taxes = Math.round(subtotal * 0.18);
    const total = subtotal + taxes;

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
      subtotal,
      taxes,
      totalAmount: total,
      specialRequirements: data.specialRequirements,
    };
  };

  const onReview = (data) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      setShowAuthModal(true);
      return;
    }

    const summary = calculateSummary(data);
    setBookingSummary(summary);
    setShowConfirmation(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onConfirm = async () => {
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
      };

      await api.post("/booking", bookingData);
      toast.success("🎉 Booking confirmed!");
      reset();
      setShowConfirmation(false);
      setRecommendations([]);
      setAvailableStartTimes([]);
      setAvailableEndTimes([]);
      fetchTimetable();

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = format(tomorrow, "yyyy-MM-dd");

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 4);
  const maxDateStr = format(maxDate, "yyyy-MM-dd");

  const selectedSessionType = sessionTypes.find((t) => t.value === sessionType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
              
              {/* CALENDAR */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <span>Studio Availability</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={goToPrevious} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button onClick={goToNext} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
                    <span>Your Booking</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>

                {loadingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                    <table className="w-full border-collapse text-[10px] xs:text-xs sm:text-sm">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 dark:border-gray-600 p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 sticky left-0 z-20 min-w-[80px] sm:min-w-[120px]">
                            <div className="font-semibold text-left">Studio</div>
                          </th>
                          {calendarDates.map((date, idx) => (
                            <th
                              key={idx}
                              onClick={() => handleCalendarDateClick(date)}
                              className="border border-gray-300 dark:border-gray-600 p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 text-center min-w-[100px] sm:min-w-[150px] cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                              title="Click to select this date"
                            >
                              <div className="font-semibold">{format(date, "EEE")}</div>
                              <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{format(date, "MMM dd")}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timetableData?.studios?.map((studio) => (
                          <tr key={studio.id}>
                            <td className="border border-gray-300 dark:border-gray-600 p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 sticky left-0 z-10">
                              <div className="font-medium text-left">{studio.name}</div>
                              <div className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">{STUDIO_INFO[studio.name]?.size}</div>
                            </td>
                            {calendarDates.map((date, dateIdx) => (
                              <td key={dateIdx} className="border border-gray-300 dark:border-gray-600 p-0.5 sm:p-1">
                                <div className="flex flex-col gap-0.5">
                                  {timetableData?.timeSlots?.slice(0, 14).map((time, timeIdx) => {
                                    const colorClass = getCalendarSlotColor(studio.id, date, time);
                                    const hour = parseInt(time.split(":")[0]);
                                    return (
                                      <div
                                        key={timeIdx}
                                        className={`flex items-center justify-center h-5 sm:h-6 rounded text-[9px] sm:text-xs font-medium ${colorClass}`}
                                        title={`${studio.name} - ${formatTime(hour)}`}
                                      >
                                        <span className="hidden sm:inline">{formatTime(hour)}</span>
                                        <span className="sm:hidden">{hour}</span>
                                      </div>
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
                )}
              </motion.div>

              {/* FORM */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">📝 Booking Request Form</h2>

                <form onSubmit={handleSubmit(onReview)} className="space-y-5">
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

                  {/* Date Picker - FIXED VERSION */}
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
      style={{
        colorScheme: 'light',
        WebkitAppearance: 'none',
        MozAppearance: 'textfield'
      }}
      placeholder="Select a date"
      disabled={!studioId}
      onClick={(e) => {
        // Force calendar to open on click
        if (!e.target.showPicker) {
          e.target.focus();
        } else {
          try {
            e.target.showPicker();
          } catch (error) {
            console.log('Picker not supported, using default');
          }
        }
      }}
    />
    <div 
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      aria-hidden="true"
    >
      <Calendar className="w-5 h-5 text-gray-400" />
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
  
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    📅 Click to open calendar picker (bookings from tomorrow onwards)
  </p>
</div>

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
            </motion.div>
          ) : (
            <motion.div key="confirmation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Confirm Your Booking</h2>
                <p className="text-gray-600 dark:text-gray-400">Please review your booking details</p>
              </div>

              {bookingSummary && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-4 space-y-3">
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
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium">₹{bookingSummary.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Taxes (18% GST):</span>
                      <span className="font-medium">₹{bookingSummary.taxes}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
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
                <Button variant="outline" className="flex-1" onClick={() => { setShowConfirmation(false); window.scrollTo({ top: document.querySelector("form")?.offsetTop - 100 || 0, behavior: "smooth" }); }} disabled={isSubmitting}>← Back</Button>
                <Button variant="primary" className="flex-1" onClick={onConfirm} loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Confirm Booking"} ✓</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}