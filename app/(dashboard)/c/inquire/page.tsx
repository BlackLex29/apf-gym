"use client";
import React, { useState, useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import {
  IconMessageCircle,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCircleCheck,
  IconDownload,
  IconClock,
  IconStar,
  IconAward,
  IconCalendar,
  IconX,
  IconUsers,
} from "@tabler/icons-react";
import { Dumbbell, Music } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Coach interface matching the Coach Management system
interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: "gym" | "karate" | "boxing" | "zumba";
  experience: string;
  status: "active" | "inactive";
  dateCreated: string;
  authUid: string;
}

// Booking interface
interface BookingData {
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  sessionType: string;
  notes: string;
}

export default function InquirePage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [bookingData, setBookingData] = useState<BookingData>({
    coachId: "",
    coachName: "",
    date: "",
    time: "",
    sessionType: "personal-training",
    notes: "",
  });

  // Fetch real coaches from Firestore
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  // Available time slots
  const timeSlots = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
  ];

  // Session types
  const sessionTypes = [
    { value: "personal-training", label: "Personal Training" },
    { value: "group-session", label: "Group Session" },
    { value: "consultation", label: "Consultation" },
    { value: "rehabilitation", label: "Rehabilitation" },
    { value: "specialized-training", label: "Specialized Training" },
  ];

  // Specialty mapping with colors and labels
  const specialties = [
    { value: "gym", label: "Gym Training", color: "text-orange-400", bgColor: "bg-orange-500/20" },
    { value: "karate", label: "Karate", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    { value: "boxing", label: "Boxing", color: "text-red-400", bgColor: "bg-red-500/20" },
    { value: "zumba", label: "Zumba", color: "text-pink-400", bgColor: "bg-pink-500/20" }
  ];

  // Fetch coaches from Firestore (same as Coach Management)
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesRef = collection(db, "users");
        const q = query(coachesRef, where("role", "==", "coach"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const coachesData: Coach[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            coachesData.push({
              id: doc.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              specialty: data.specialty,
              experience: data.experience,
              status: data.status,
              dateCreated: data.createdAt,
              authUid: data.authUid
            });
          });
          // Only set active coaches for the inquire page
          const activeCoaches = coachesData.filter(coach => coach.status === "active");
          setCoaches(activeCoaches);
          setLoadingCoaches(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching coaches:', error);
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, []);

  // Auto-fill inquiry message
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      message: `Hi! I'd like to inquire about your gym and studio facilities. Please send me more information about your services and membership options.`,
    }));
  }, []);

  const showSuccess = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Inquiry sent! We'll contact you shortly.");
    setFormData({ ...formData, name: "", email: "", phone: "" });
  };

  // Booking functions
  const openBookingModal = (coach: Coach) => {
    setSelectedCoach(coach);
    setBookingData({
      coachId: coach.id,
      coachName: coach.name,
      date: "",
      time: "",
      sessionType: "personal-training",
      notes: "",
    });
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCoach(null);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dito pwedeng mag-add ng API call para i-save ang booking
    showSuccess(`Booking request sent to ${selectedCoach?.name}! We'll confirm your schedule shortly.`);
    closeBookingModal();

    // Reset booking form
    setBookingData({
      coachId: "",
      coachName: "",
      date: "",
      time: "",
      sessionType: "personal-training",
      notes: "",
    });
  };

  // Helper functions for specialty display
  const getSpecialtyColor = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.color || "text-gray-400";
  };

  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };

  const getSpecialtyBgColor = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.bgColor || "bg-gray-500/20";
  };

  // Operating Hours
  const operatingHours = [
    { day: "Monday - Friday", time: "7:00 AM - 10:00 PM" },
    { day: "Saturday", time: "7:00 AM - 11:00 PM" },
    { day: "Sunday", time: "7:00 AM - 11:00 PM" },
  ];

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <IconCircleCheck className="size-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-400">
                Book with {selectedCoach.name}
              </h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IconX className="size-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300">Specialty: <span className="font-semibold text-orange-400">{getSpecialtyLabel(selectedCoach.specialty)}</span></p>
              <p className="text-sm text-gray-300">Experience: <span className="font-semibold text-green-400">{selectedCoach.experience}</span></p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Time
                </label>
                <select
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Type
                </label>
                <select
                  required
                  value={bookingData.sessionType}
                  onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Any specific goals or requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <IconCalendar className="size-5" />
                Book Session
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6 pt-16 lg:pt-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
              <h1 className="text-4xl font-bold text-center flex items-center justify-center gap-3">
                <IconMessageCircle className="size-10 text-pink-400" />
                View Our Facilities
              </h1>

              {/* Operating Hours */}
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2 mb-6">
                  <IconClock className="size-6 text-orange-400" />
                  Operating Hours
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {operatingHours.map((schedule, index) => (
                    <div key={index} className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <p className="font-semibold text-orange-400">{schedule.day}</p>
                      <p className="text-lg font-bold">{schedule.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coaches Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold flex items-center gap-3 text-yellow-400">
                    <IconUsers className="size-8" />
                    Meet Our Expert Coaches
                  </h2>
                  <div className="text-sm text-gray-400">
                    {coaches.length} Active Coach{coaches.length !== 1 ? 'es' : ''}
                  </div>
                </div>

                {loadingCoaches ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading coaches...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coaches.map((coach) => (
                        <div key={coach.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4 hover:transform hover:scale-105 transition-all duration-300 group">
                          {/* Coach Image - Using gradient placeholder */}
                          <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                            <div className={`w-full h-full ${getSpecialtyBgColor(coach.specialty)} flex items-center justify-center`}>
                              <IconUsers className="size-16 text-white opacity-80" />
                            </div>
                            {/* Book Button Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <button
                                onClick={() => openBookingModal(coach)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform translate-y-4 group-hover:translate-y-0"
                              >
                                <IconCalendar className="size-5" />
                                Book Session
                              </button>
                            </div>
                          </div>

                          {/* Coach Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-xl font-bold text-yellow-400">{coach.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecialtyColor(coach.specialty)} ${getSpecialtyBgColor(coach.specialty)}`}>
                                {getSpecialtyLabel(coach.specialty)}
                              </span>
                            </div>

                            {/* Experience */}
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <IconAward className="size-4 text-green-400" />
                              <span>{coach.experience}</span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-1 text-xs text-gray-400">
                              <p className="flex items-center gap-2 truncate">
                                <IconMail className="size-3" />
                                {coach.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <IconPhone className="size-3" />
                                {coach.phone}
                              </p>
                            </div>

                            {/* Book Button - Mobile */}
                            <button
                              onClick={() => openBookingModal(coach)}
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-2 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 lg:hidden"
                            >
                              <IconCalendar className="size-4" />
                              Book Session
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {coaches.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <IconUsers className="size-12 mx-auto mb-4 opacity-50" />
                        <p>No active coaches available at the moment.</p>
                        <p className="text-sm">Please check back later or contact us for more information.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* The rest of your existing code for facilities remains the same */}
              {/* Gym Facilities */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Dumbbell className="size-8 text-orange-400" />
                  Gym Facilities
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Gym Image 1 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/main.jpg"
                        alt="Main Gym Area"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Main Gym Area</p>
                  </div>

                  {/* Gym Image 2 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/cardio.jpg"
                        alt="Cardio Equipment"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Cardio Equipment</p>
                  </div>

                  {/* Gym Image 3 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/weight.jpg"
                        alt="Weight Training Area"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Weight Training Area</p>
                  </div>
                </div>
              </div>

              {/* Studio Facilities */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Music className="size-8 text-pink-400" />
                  Studio Facilities
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Studio Image 1 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/images/studio/yoga-studio.jpg"
                        alt="Yoga Studio"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Yoga & Pilates Studio</p>
                  </div>

                  {/* Studio Image 2 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/Zumba.jpg"
                        alt="Zumba Studio"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Dance Studio</p>
                  </div>

                  {/* Studio Image 3 */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                      <Image
                        src="/Taaekwondo.jpg"
                        alt="Boxing Studio"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Boxing & Studio</p>
                  </div>
                </div>
              </div>

              {/* Additional Facilities */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-blue-400">
                  <IconCircleCheck className="size-8" />
                  Other Amenities
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Locker Room */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-32 overflow-hidden">
                      <Image
                        src="/images/amenities/locker-room.jpg"
                        alt="Locker Room"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Locker Rooms</p>
                  </div>

                  {/* Shower Area */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-32 overflow-hidden">
                      <Image
                        src="/images/amenities/shower-area.jpg"
                        alt="Shower Area"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Shower Facilities</p>
                  </div>

                  {/* Reception */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-32 overflow-hidden">
                      <Image
                        src="/images/amenities/reception.jpg"
                        alt="Reception Area"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Reception Area</p>
                  </div>

                  {/* Lounge */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                    <div className="relative bg-gray-700 rounded-xl h-32 overflow-hidden">
                      <Image
                        src="/images/amenities/lounge.jpg"
                        alt="Members Lounge"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300 text-center">Members Lounge</p>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-6">
                <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <IconMessageCircle className="size-6" />
                  Interested? Send us an Inquiry
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 md:col-span-2"
                  />
                </div>
                <textarea
                  placeholder="Tell us what you're interested in..."
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <IconDownload className="size-5" />
                  Send Inquiry
                </button>
              </form>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {[
                  { icon: IconPhone, label: "Call", value: "+63 912 345 6789", color: "text-orange-400" },
                  { icon: IconMail, label: "Email", value: "info@gymschedpro.com", color: "text-pink-400" },
                  { icon: IconMapPin, label: "Visit", value: "Tanauan City", color: "text-green-400" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <item.icon className={`size-8 mx-auto mb-3 ${item.color}`} />
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className="font-bold text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </>
  );
}