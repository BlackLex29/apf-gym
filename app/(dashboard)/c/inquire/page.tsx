"use client";
import React, { useState, useEffect } from "react";
import { ClientSidebar } from "@/components/ClientSideBar";
import Chatbot from "@/components/Chatbot";
import {
  IconMessageCircle,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCircleCheck,
  IconDownload,
  IconClock,
} from "@tabler/icons-react";
import { Dumbbell, Music } from "lucide-react";
import Image from "next/image";

export default function InquirePage() {
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Auto-fill inquiry message
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      message: `Hi! I'd like to inquire about your gym and studio facilities. Please send me more information about your services and membership options.`,
    }));
  }, []);

  const showSuccess = (msg: string) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Inquiry sent! We'll contact you shortly.");
    setFormData({ ...formData, name: "", email: "", phone: "" });
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
          <span className="font-medium">Inquiry sent! We'll contact you shortly.</span>
        </div>
      )}

      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <ClientSidebar />
        
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
                        src="/main.jpg" // Palitan mo ng actual image path
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
                        src="/cardio.jpg" // Palitan mo ng actual image path
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
                        src="/weight.jpg" // Palitan mo ng actual image path
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
                        src="/images/studio/yoga-studio.jpg" // Palitan mo ng actual image path
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
                        src="/Zumba.jpg" // Palitan mo ng actual image path
                        alt=" Zumba Studio"
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
                        src="/Taaekwondo.jpg" // Palitan mo ng actual image path
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
                  { icon: IconMapPin, label: "Visit", value: "Quezon City, Philippines", color: "text-green-400" },
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