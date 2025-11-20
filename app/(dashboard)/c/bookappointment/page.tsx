"use client";
import React, { useState, useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconCreditCard,
  IconCash,
} from "@tabler/icons-react";
import { Music, Calendar as CalendarIcon, QrCode } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

// Define types for services
interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  description: string;
  instructor: string;
}

interface AppointmentData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending";
  paymentMethod: "cash" | "gcash";
  paymentStatus: "pending" | "paid";
  notes?: string;
  createdAt: Date;
  userId: string;
}

interface UserAppointment {
  id: string;
  clientName: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
}

export default function BookStudioPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash");
  const [gcashPaymentConfirmed, setGcashPaymentConfirmed] = useState(false);

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    selectedService: "",
  });

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is authenticated:', user.email);
        setUser(user);
        setBookingDetails(prev => ({
          ...prev,
          email: user.email || "",
          name: user.displayName || ""
        }));
        // Load user appointments when user is authenticated
        loadUserAppointments(user.uid);
      } else {
        console.log('User is not authenticated');
        setUser(null);
        setUserAppointments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user appointments from Firestore
  const loadUserAppointments = async (userId: string) => {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserAppointment[];

      setUserAppointments(appointments);
    } catch (error) {
      console.error("Error loading user appointments:", error);
    }
  };

  // Studio services only - 2 hours each for ₱300
  const studioServices: Service[] = [
    {
      id: 1,
      name: "Modeling Class",
      duration: "2 hours",
      price: "₱300",
      description: "Professional modeling techniques and runway training",
      instructor: "Professional Model Coach"
    },
    {
      id: 2,
      name: "Zumba Class",
      duration: "2 hours",
      price: "₱300",
      description: "High-energy dance fitness party with Latin rhythms",
      instructor: "Certified Zumba Instructor"
    },
    {
      id: 3,
      name: "Dance Class",
      duration: "2 hours",
      price: "₱300",
      description: "Learn various dance styles from hip-hop to contemporary",
      instructor: "Professional Dance Instructor"
    }
  ];

  // Available time slots - adjusted for 2-hour sessions
  const timeSlots = [
    "6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", 
    "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"
  ];

  // Get service price
  const getServicePrice = () => {
    const service = studioServices.find(s => s.name === bookingDetails.selectedService);
    return service ? service.price : "₱0";
  };

  // Load booked slots from Firestore
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (selectedDate) {
        try {
          const appointmentsRef = collection(db, "appointments");
          const q = query(
            appointmentsRef,
            where("date", "==", selectedDate),
            where("status", "in", ["pending", "confirmed"])
          );
          const querySnapshot = await getDocs(q);

          const slots = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return `${selectedDate}_${data.time}`;
          });

          setBookedSlots(slots);
        } catch (error) {
          console.error("Error loading booked slots:", error);
        }
      }
    };

    loadBookedSlots();
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setBookedSlots([]);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      alert("Please sign in to book a studio class.");
      return;
    }

    // Validate required fields
    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate service selection
    if (!bookingDetails.selectedService) {
      alert("Please select a studio class.");
      return;
    }

    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    setShowConfirmation(true);
  };

  const handlePaymentSelection = () => {
    setShowConfirmation(false);
    setShowPayment(true);
  };

  const saveAppointmentToFirestore = async (): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const selectedServiceData = studioServices.find(service => service.name === bookingDetails.selectedService);

      const appointmentData: AppointmentData = {
        clientName: bookingDetails.name,
        clientEmail: bookingDetails.email,
        clientPhone: bookingDetails.phone,
        serviceType: "studio",
        serviceName: bookingDetails.selectedService,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
        notes: selectedServiceData?.description || "",
        createdAt: new Date(),
        userId: user.uid
      };

      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, appointmentData);

      return true;
    } catch (error: any) {
      console.error("Error saving appointment:", error);

      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check if you are logged in.');
      } else {
        alert('Failed to save appointment: ' + error.message);
      }

      return false;
    }
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);

    try {
      const success = await saveAppointmentToFirestore();

      if (success) {
        setBookingSuccess(true);

        // Reload user appointments after successful booking
        if (user) {
          await loadUserAppointments(user.uid);
        }

        // Reset form
        setSelectedDate("");
        setSelectedTime("");
        setPaymentMethod("cash");
        setGcashPaymentConfirmed(false);
        setBookingDetails(prev => ({
          ...prev,
          selectedService: ""
        }));

        setTimeout(() => {
          setBookingSuccess(false);
        }, 5000);
      } else {
        alert("Failed to book class. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setShowPayment(false);
    }
  };

  const handleGcashPayment = () => {
    // Simulate GCash payment process
    setGcashPaymentConfirmed(true);
    setTimeout(() => {
      confirmBooking();
    }, 2000);
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const formattedDate = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      days.push({ value: formattedDate, display: displayDate });
    }

    return days;
  };

  const getSelectedServiceData = () => {
    return studioServices.find(service => service.name === bookingDetails.selectedService);
  };

  const isTimeSlotBooked = (time: string) => {
    return bookedSlots.includes(`${selectedDate}_${time}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Success Message */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <IconCheck className="size-5" />
          <span className="font-medium">Studio class booked successfully!</span>
        </div>
      )}

      {/* Not Signed In Warning */}
      {!user && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <IconX className="size-5" />
          <span className="font-medium">Please sign in to book a studio class.</span>
        </div>
      )}

      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="flex-1 lg:ml-64 flex flex-col p-6 pt-16 lg:pt-6">
          <div className="w-full max-w-6xl mx-auto flex-1">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              {/* Header */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                  <CalendarIcon className="size-10 text-orange-400" />
                  Book Studio Class
                </h1>
                <p className="text-gray-400 text-lg">
                  Schedule your favorite 2-hour studio classes - Modeling, Zumba, and Dance for only ₱300
                </p>
                {user && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-green-400">
                      Signed in as: {user.email}
                    </p>
                    <button
                      onClick={() => setShowAppointments(!showAppointments)}
                      className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1"
                    >
                      {showAppointments ? 'Hide' : 'Show'} My Bookings ({userAppointments.length})
                    </button>
                  </div>
                )}
              </div>

              {/* User Appointments Section */}
              {user && showAppointments && userAppointments.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                    <IconCalendar className="size-5 text-orange-400" />
                    My Studio Bookings
                  </h3>
                  <div className="space-y-3">
                    {userAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between text-center md:text-left">
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg">{appointment.serviceName}</h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-300">
                              <span>{formatDate(appointment.date)}</span>
                              <span>{appointment.time}</span>
                              <span className="text-orange-400 font-semibold">₱300</span>
                              <span className={`px-2 py-1 rounded text-xs ${appointment.paymentMethod === 'gcash'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {appointment.paymentMethod === 'gcash' ? 'GCash' : 'Cash'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : appointment.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                                }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user && showAppointments && userAppointments.length === 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
                  <p className="text-gray-400">You don&apos;t have any studio bookings yet.</p>
                </div>
              )}

              {/* Studio Class Selection and Booking Form */}
              {user && (
                <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-8">
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Music className="size-6 text-orange-400" />
                    Select Studio Class - ₱300 for 2 Hours
                  </h2>

                  {/* Studio Class Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {studioServices.map((service) => (
                      <div
                        key={service.id}
                        className={`bg-gray-700/50 rounded-xl p-6 border-2 transition-all cursor-pointer text-center hover:transform hover:scale-105 ${bookingDetails.selectedService === service.name
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-600 hover:border-orange-500/50"
                          }`}
                        onClick={() => setBookingDetails(prev => ({ ...prev, selectedService: service.name }))}
                      >
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Music className="size-8 text-white" />
                          </div>
                          <h3 className="font-bold text-xl mb-2">{service.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{service.description}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Duration:</span>
                            <span className="font-semibold">{service.duration}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-orange-400 font-bold text-lg">{service.price}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Instructor:</span>
                            <span className="text-blue-400">{service.instructor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Date Selection */}
                  {bookingDetails.selectedService && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        <IconCalendar className="size-5 text-orange-400" />
                        Select Date
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {getNext7Days().map((day) => (
                          <button
                            key={day.value}
                            onClick={() => handleDateSelect(day.value)}
                            className={`p-4 rounded-xl border-2 transition-all text-center hover:transform hover:scale-105 ${selectedDate === day.value
                              ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                              : "bg-gray-700/50 border-gray-600 hover:border-orange-500/50"
                              }`}
                          >
                            <div className="text-sm font-medium mb-1">{day.display.split(' ')[0]}</div>
                            <div className="text-2xl font-bold mb-1">{day.display.split(' ')[2]}</div>
                            <div className="text-xs opacity-75">{day.display.split(' ')[1]}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        <IconClock className="size-5 text-orange-400" />
                        Select Time (2-hour sessions)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {timeSlots.map((time) => {
                          const isBooked = isTimeSlotBooked(time);
                          return (
                            <button
                              key={time}
                              onClick={() => !isBooked && handleTimeSelect(time)}
                              disabled={isBooked}
                              className={`p-4 rounded-xl border-2 transition-all text-center hover:transform hover:scale-105 ${selectedTime === time
                                ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                                : isBooked
                                  ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700/50 border-gray-600 hover:border-orange-500/50"
                                }`}
                            >
                              <div className="text-lg font-bold">{time}</div>
                              <div className="text-sm text-gray-300 mt-1">2 hours</div>
                              {isBooked && (
                                <div className="text-xs text-red-400 mt-2 font-medium">Fully Booked</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Booking Form */}
                  {selectedTime && (
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        Your Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Full Name *"
                            required
                            value={bookingDetails.name}
                            onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Email *"
                            required
                            value={bookingDetails.email}
                            onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Phone Number *"
                            required
                            value={bookingDetails.phone}
                            onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg px-4 py-3 text-center">
                          <div className="text-orange-400 font-bold text-xl">{getServicePrice()}</div>
                          <div className="text-sm text-gray-300">{bookingDetails.selectedService}</div>
                          <div className="text-xs text-gray-400">2 hours session</div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        Book Now for ₱300
                      </button>
                    </form>
                  )}

                  {/* Booking Summary */}
                  {(bookingDetails.selectedService || selectedDate || selectedTime) && (
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600">
                      <h3 className="text-xl font-bold mb-4 text-center">Booking Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-sm mb-1">Class</p>
                          <p className="font-semibold text-lg">{bookingDetails.selectedService || "Not selected"}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-sm mb-1">Date</p>
                          <p className="font-semibold text-lg">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            }) : "Not selected"}
                          </p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-sm mb-1">Time</p>
                          <p className="font-semibold text-lg">{selectedTime || "Not selected"}</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30">
                          <p className="text-gray-400 text-sm mb-1">Total Price</p>
                          <p className="font-bold text-orange-400 text-xl">{getServicePrice()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <IconCheck className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Confirm Booking</h3>
              <p className="text-gray-400">
                Are you sure you want to book this studio class?
              </p>

              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-gray-400">Class:</span> {bookingDetails.selectedService}</p>
                <p><span className="text-gray-400">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><span className="text-gray-400">Time:</span> {selectedTime}</p>
                <p><span className="text-gray-400">Duration:</span> 2 hours</p>
                <p><span className="text-gray-400">Name:</span> {bookingDetails.name}</p>
                <p><span className="text-gray-400">Total:</span> <span className="text-orange-400 font-semibold text-lg">{getServicePrice()}</span></p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <IconX className="size-5" />
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSelection}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <IconCreditCard className="size-5" />
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Select Payment Method</h2>

              <div className="space-y-4">
                {/* Cash Payment Option */}
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-blue-500/50"
                    }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "cash" ? "bg-blue-500" : "bg-gray-700"
                      }`}>
                      <IconCash className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Pay with Cash</h3>
                      <p className="text-sm text-gray-400">Pay at the studio counter</p>
                    </div>
                  </div>
                </div>

                {/* GCash Payment Option */}
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "gcash"
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-green-500/50"
                    }`}
                  onClick={() => setPaymentMethod("gcash")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "gcash" ? "bg-green-500" : "bg-gray-700"
                      }`}>
                      <IconCreditCard className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Pay with GCash</h3>
                      <p className="text-sm text-gray-400">Instant online payment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GCash QR Code */}
              {paymentMethod === "gcash" && (
                <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                  <h3 className="font-semibold mb-4">Scan to Pay with GCash</h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img
                      src="/Apf-qr.jpg"
                      alt="GCash QR Code"
                      className="w-48 h-48 mx-auto object-contain"
                      onError={(e) => {
                        console.log("QR code image failed to load");
                        // You can set a fallback image or hide the QR code section
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Amount: <span className="text-orange-400 font-semibold text-lg">{getServicePrice()}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan the QR code using your GCash app to complete payment
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setShowConfirmation(true);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                {paymentMethod === "cash" ? (
                  <button
                    onClick={confirmBooking}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      "Booking..."
                    ) : (
                      <>
                        <IconCheck className="size-5" />
                        Book Now
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleGcashPayment}
                    disabled={isSubmitting || gcashPaymentConfirmed}
                    className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gcashPaymentConfirmed ? (
                      "Processing..."
                    ) : isSubmitting ? (
                      "Booking..."
                    ) : (
                      <>
                        <QrCode className="size-5" />
                        I&apos;ve Paid
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </>
  );
}