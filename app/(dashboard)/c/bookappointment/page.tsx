"use client";
import React, { useState, useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconCheck,
  IconX,
  IconCreditCard,
  IconCash,
} from "@tabler/icons-react";
import { Dumbbell, Music, Calendar as CalendarIcon, QrCode } from "lucide-react";
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
  hasCoachSelection?: boolean;
}

interface Coach {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  status: "active" | "inactive";
}

interface AppointmentData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  coach?: string;
  coachSpecialty?: string;
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
  coach?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
}

export default function BookAppointmentPage() {
  const [selectedService, setSelectedService] = useState<"gym" | "studio" | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash");
  const [gcashPaymentConfirmed, setGcashPaymentConfirmed] = useState(false);

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
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

  // Load coaches from Firestore
  useEffect(() => {
    loadCoaches();
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

  // Load coaches from Firestore
  const loadCoaches = async () => {
    try {
      setCoachesLoading(true);
      const coachesRef = collection(db, "coaches");
      const q = query(
        coachesRef,
        where("status", "==", "active") // Only load active coaches
      );
      const querySnapshot = await getDocs(q);

      const coachesData: Coach[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        coachesData.push({
          id: doc.id,
          name: data.name,
          specialty: data.specialty,
          experience: data.experience,
          status: data.status
        } as Coach);
      });

      setCoaches(coachesData);
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setCoachesLoading(false);
    }
  };

  // Available time slots
  const timeSlots = [
    "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
  ];

  // Gym services
  const gymServices: Service[] = [
    {
      id: 1,
      name: "Personal Training",
      duration: "10 days",
      price: "₱3500",
      description: "One-on-one training session with certified trainer",
      instructor: "Choose your coach",
      hasCoachSelection: true
    },
    {
      id: 2,
      name: "Weight Training",
      duration: "1 day",
      price: "₱300",
      description: "Access to weight training area and equipment",
      instructor: "Self-guided"
    }
  ];

  // Studio services
  const studioServices: Service[] = [
    {
      id: 1,
      name: "Zumba Class",
      duration: "1 hour",
      price: "₱350",
      description: "High-energy dance fitness class",
      instructor: "Zumba Instructor"
    },
    {
      id: 2,
      name: "Yoga Session",
      duration: "1.5 hours",
      price: "₱400",
      description: "Beginner-friendly yoga and meditation",
      instructor: "Yoga Instructor"
    },
    {
      id: 3,
      name: "Boxing Training",
      duration: "1 hour",
      price: "₱450",
      description: "Boxing fundamentals and bag work",
      instructor: "Boxing Coach"
    },
    {
      id: 4,
      name: "Pilates Class",
      duration: "1 hour",
      price: "₱380",
      description: "Core strengthening and flexibility",
      instructor: "Pilates Instructor"
    }
  ];

  // Get filtered coaches based on service type
  const getFilteredCoaches = (serviceType: "gym" | "studio" | null) => {
    if (!serviceType) return [];

    if (serviceType === "gym") {
      return coaches.filter(coach => coach.specialty === "gym");
    } else if (serviceType === "studio") {
      return coaches.filter(coach =>
        ["karate", "boxing", "zumba"].includes(coach.specialty)
      );
    }
    return [];
  };

  // Get service price
  const getServicePrice = () => {
    const service = (selectedService === "gym" ? gymServices : studioServices)
      .find(s => s.name === bookingDetails.notes);
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

  const handleServiceSelect = (service: "gym" | "studio") => {
    setSelectedService(service);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedCoach(null);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setBookedSlots([]);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      alert("Please sign in to book an appointment.");
      return;
    }

    // Validate required fields
    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate service selection
    if (!bookingDetails.notes) {
      alert("Please select a service.");
      return;
    }

    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    // Validate coach selection for Personal Training
    if (selectedService === "gym" &&
      bookingDetails.notes === "Personal Training" &&
      !selectedCoach) {
      alert("Please select a coach for Personal Training.");
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

      const selectedServiceData = (selectedService === "gym" ? gymServices : studioServices)
        .find(service => service.name === bookingDetails.notes);

      const appointmentData: AppointmentData = {
        clientName: bookingDetails.name,
        clientEmail: bookingDetails.email,
        clientPhone: bookingDetails.phone,
        serviceType: selectedService!,
        serviceName: bookingDetails.notes,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
        notes: bookingDetails.notes,
        createdAt: new Date(),
        userId: user.uid
      };

      // Add coach information if selected
      if (selectedCoach) {
        appointmentData.coach = selectedCoach.name;
        appointmentData.coachSpecialty = selectedCoach.specialty;
      }

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
        setSelectedService(null);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedCoach(null);
        setPaymentMethod("cash");
        setGcashPaymentConfirmed(false);
        setBookingDetails({
          name: "",
          email: "",
          phone: "",
          notes: "",
        });

        setTimeout(() => {
          setBookingSuccess(false);
        }, 5000);
      } else {
        alert("Failed to book appointment. Please try again.");
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
    return (selectedService === "gym" ? gymServices : studioServices)
      .find(service => service.name === bookingDetails.notes);
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

  // Get specialty label for display
  const getSpecialtyLabel = (specialty: string) => {
    const specialtyLabels: { [key: string]: string } = {
      "gym": "Gym Training",
      "karate": "Karate",
      "boxing": "Boxing",
      "zumba": "Zumba"
    };
    return specialtyLabels[specialty] || specialty;
  };


  return (
    <>
      {/* Success Message */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <IconCheck className="size-5" />
          <span className="font-medium">Appointment booked successfully!</span>
        </div>
      )}

      {/* Not Signed In Warning */}
      {!user && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <IconX className="size-5" />
          <span className="font-medium">Please sign in to book an appointment.</span>
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
                  Book Appointment
                </h1>
                <p className="text-gray-400 text-lg">
                  Schedule your gym session or studio class
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
                      {showAppointments ? 'Hide' : 'Show'} My Appointments ({userAppointments.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Service Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`bg-gray-800/50 rounded-2xl p-8 border-2 transition-all cursor-pointer text-center ${selectedService === "gym"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-700 hover:border-orange-500/50"
                    }`}
                  onClick={() => handleServiceSelect("gym")}
                >
                  <Dumbbell className="size-16 mx-auto mb-4 text-orange-400" />
                  <h2 className="text-2xl font-bold mb-2">Gym Services</h2>
                  <p className="text-gray-400">Personal Training & Weight Training</p>
                </div>

                <div
                  className={`bg-gray-800/50 rounded-2xl p-8 border-2 transition-all cursor-pointer text-center ${selectedService === "studio"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-700 hover:border-orange-500/50"
                    }`}
                  onClick={() => handleServiceSelect("studio")}
                >
                  <Music className="size-16 mx-auto mb-4 text-orange-400" />
                  <h2 className="text-2xl font-bold mb-2">Studio Classes</h2>
                  <p className="text-gray-400">Zumba, Yoga, Boxing & Pilates</p>
                </div>
              </div>

              {/* User Appointments Section */}
              {user && showAppointments && userAppointments.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                    <IconCalendar className="size-5 text-orange-400" />
                    My Appointments
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
                              <span className="capitalize">{appointment.serviceType}</span>
                              <span>{formatDate(appointment.date)}</span>
                              <span>{appointment.time}</span>
                              {appointment.coach && (
                                <span>Coach: {appointment.coach}</span>
                              )}
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
                  <p className="text-gray-400">You don't have any appointments yet.</p>
                </div>
              )}

              {/* Service Selection and Booking Form */}
              {selectedService && user && (
                <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-8">
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <IconCalendar className="size-6 text-orange-400" />
                    Select {selectedService === "gym" ? "Gym Service" : "Studio Class"}
                  </h2>

                  {/* Service Options */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(selectedService === "gym" ? gymServices : studioServices).map((service) => (
                      <div
                        key={service.id}
                        className={`bg-gray-700/50 rounded-xl p-4 border transition-colors cursor-pointer text-center ${bookingDetails.notes === service.name
                          ? "border-orange-500"
                          : "border-gray-600 hover:border-orange-500/50"
                          }`}
                        onClick={() => setBookingDetails(prev => ({ ...prev, notes: service.name }))}
                      >
                        <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{service.description}</p>
                        <div className="flex justify-center items-center gap-4 text-sm">
                          <span className="text-orange-400 font-semibold">{service.price}</span>
                          <span className="text-gray-400">{service.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedService === "gym" ? "Trainer" : "Instructor"}: {service.instructor}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coach Selection - Only show for Personal Training */}
                  {selectedService === "gym" && getSelectedServiceData()?.hasCoachSelection && bookingDetails.notes && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        <IconUser className="size-5 text-orange-400" />
                        Choose Your Coach
                      </h3>
                      {coachesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                          <p className="text-gray-400 mt-2">Loading coaches...</p>
                        </div>
                      ) : getFilteredCoaches(selectedService).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getFilteredCoaches(selectedService).map((coach) => (
                            <div
                              key={coach.id}
                              className={`bg-gray-700/50 rounded-xl p-4 border transition-colors cursor-pointer text-center ${selectedCoach?.id === coach.id
                                ? "border-green-500"
                                : "border-gray-600 hover:border-green-500/50"
                                }`}
                              onClick={() => handleCoachSelect(coach)}
                            >
                              <h4 className="font-bold text-lg mb-1">{coach.name}</h4>
                              <p className="text-sm text-gray-400 mb-1">
                                Specialty: {getSpecialtyLabel(coach.specialty)}
                              </p>
                              <p className="text-xs text-gray-500">Experience: {coach.experience}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-yellow-400">
                          <p>No active gym coaches available at the moment.</p>
                          <p className="text-sm text-gray-400 mt-1">Please check back later or contact the gym.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                      <IconCalendar className="size-5 text-orange-400" />
                      Select Date
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {getNext7Days().map((day) => (
                        <button
                          key={day.value}
                          onClick={() => handleDateSelect(day.value)}
                          className={`p-3 rounded-lg border transition-all text-center ${selectedDate === day.value
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-gray-700/50 border-gray-600 hover:border-orange-500/50"
                            }`}
                        >
                          <div className="text-sm font-medium">{day.display.split(' ')[0]}</div>
                          <div className="text-lg font-bold">{day.display.split(' ')[2]}</div>
                          <div className="text-xs opacity-75">{day.display.split(' ')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                        <IconClock className="size-5 text-orange-400" />
                        Select Time
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = isTimeSlotBooked(time);
                          return (
                            <button
                              key={time}
                              onClick={() => !isBooked && handleTimeSelect(time)}
                              disabled={isBooked}
                              className={`p-3 rounded-lg border transition-all text-center ${selectedTime === time
                                ? "bg-orange-500 border-orange-500 text-white"
                                : isBooked
                                  ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700/50 border-gray-600 hover:border-orange-500/50"
                                }`}
                            >
                              {time}
                              {isBooked && (
                                <div className="text-xs text-red-400 mt-1">Booked</div>
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
                        <IconUser className="size-5 text-orange-400" />
                        Your Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          required
                          value={bookingDetails.name}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                          className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          required
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                          className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          required
                          value={bookingDetails.phone}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                          className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          placeholder="Service/Class Preference"
                          value={bookingDetails.notes}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                          className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-4 rounded-lg font-bold text-lg transition-all"
                      >
                        Confirm Booking
                      </button>
                    </form>
                  )}

                  {/* Booking Summary */}
                  {(selectedService || selectedDate || selectedTime) && (
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold mb-4 text-center">Booking Summary</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-center">
                        <div>
                          <p className="text-gray-400">Service Type</p>
                          <p className="font-semibold">
                            {selectedService ? selectedService.charAt(0).toUpperCase() + selectedService.slice(1) : "Not selected"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="font-semibold">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : "Not selected"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Time</p>
                          <p className="font-semibold">{selectedTime || "Not selected"}</p>
                        </div>
                      </div>
                      {selectedCoach && (
                        <div className="mt-4 pt-4 border-t border-gray-600 text-center">
                          <p className="text-gray-400">Selected Coach</p>
                          <p className="font-semibold">{selectedCoach.name} - {getSpecialtyLabel(selectedCoach.specialty)}</p>
                        </div>
                      )}
                      {bookingDetails.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-600 text-center">
                          <p className="text-gray-400">Price</p>
                          <p className="font-semibold text-orange-400 text-lg">{getServicePrice()}</p>
                        </div>
                      )}
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
                Are you sure you want to book this appointment?
              </p>

              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-gray-400">Service:</span> {selectedService}</p>
                <p><span className="text-gray-400">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><span className="text-gray-400">Time:</span> {selectedTime}</p>
                <p><span className="text-gray-400">Name:</span> {bookingDetails.name}</p>
                <p><span className="text-gray-400">Price:</span> <span className="text-orange-400 font-semibold">{getServicePrice()}</span></p>
                {selectedCoach && (
                  <p><span className="text-gray-400">Coach:</span> {selectedCoach.name} ({getSpecialtyLabel(selectedCoach.specialty)})</p>
                )}
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
                      <p className="text-sm text-gray-400">Pay at the gym counter</p>
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
                    Amount: <span className="text-orange-400 font-semibold">{getServicePrice()}</span>
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
                        I've Paid
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