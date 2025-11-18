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
} from "@tabler/icons-react";
import { Dumbbell, Music } from "lucide-react";
import Image from "next/image";

// Coach interface
interface Coach {
  id: number;
  name: string;
  specialization: string;
  yearsExperience: number;
  achievements: string[];
  image: string;
}

// Booking interface
interface BookingData {
  coachId: number;
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
    coachId: 0,
    coachName: "",
    date: "",
    time: "",
    sessionType: "personal-training",
    notes: "",
  });

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

  // Coaches data - ito ang isesend ng admin
  const [coaches, setCoaches] = useState<Coach[]>([
    {
      id: 1,
      name: "Alex Rodriguez",
      specialization: "Strength Training",
      yearsExperience: 8,
      achievements: ["Certified Personal Trainer", "2x Regional Powerlifting Champion"],
      image: "/images/coaches/coach1.jpg"
    },
    {
      id: 2,
      name: "Sarah Chen",
      specialization: "Yoga & Pilates",
      yearsExperience: 6,
      achievements: ["RYT 500 Certified", "Senior Yoga Instructor"],
      image: "/images/coaches/coach2.jpg"
    },
    {
      id: 3,
      name: "Mike Johnson",
      specialization: "Boxing & MMA",
      yearsExperience: 10,
      achievements: ["Professional Boxing Coach", "3x National Champion"],
      image: "/images/coaches/coach3.jpg"
    },
    {
      id: 4,
      name: "Maria Santos",
      specialization: "Dance Fitness",
      yearsExperience: 5,
      achievements: ["Zumba Instructor", "Dance Competition Judge"],
      image: "/images/coaches/coach4.jpg"
    },
    {
      id: 5,
      name: "David Kim",
      specialization: "Cardio & Endurance",
      yearsExperience: 7,
      achievements: ["Marathon Trainer", "Sports Nutrition Specialist"],
      image: "/images/coaches/coach5.jpg"
    },
    {
      id: 6,
      name: "Lisa Garcia",
      specialization: "Rehabilitation",
      yearsExperience: 9,
      achievements: ["Physical Therapist", "Injury Prevention Expert"],
      image: "/images/coaches/coach6.jpg"
    }
  ]);

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
      coachId: 0,
      coachName: "",
      date: "",
      time: "",
      sessionType: "personal-training",
      notes: "",
    });
  };

  // Operating Hours
  const operatingHours = [
    { day: "Monday - Friday", time: "7:00 AM - 10:00 PM" },
    { day: "Saturday", time: "7:00 AM - 11:00 PM" },
    { day: "Sunday", time: "7:00 AM - 11:00 PM" },
  ];

  // Function to add coach (for admin use)
  const addCoach = (newCoach: Coach) => {
    setCoaches(prev => [...prev, newCoach]);
  };

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
                <h2 className="text-3xl font-bold flex items-center gap-3 text-yellow-400">
                  <IconStar className="size-8" />
                  Meet Our Expert Coaches
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4 hover:transform hover:scale-105 transition-all duration-300 group">
                      {/* Coach Image */}
                      <div className="relative bg-gray-700 rounded-xl h-48 overflow-hidden">
                        <Image
                          src={coach.image}
                          alt={coach.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
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
                        <h3 className="text-xl font-bold text-yellow-400">{coach.name}</h3>
                        <p className="text-orange-300 font-semibold">{coach.specialization}</p>

                        {/* Years of Experience */}
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <IconAward className="size-4 text-green-400" />
                          <span>{coach.yearsExperience} years experience</span>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-400">Achievements:</p>
                          <ul className="space-y-1">
                            {coach.achievements.map((achievement, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                                <IconCircleCheck className="size-3 text-green-400" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
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
              </div>

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