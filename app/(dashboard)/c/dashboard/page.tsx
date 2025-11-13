"use client";
import React from "react";
import { ClientSidebar } from "@/components/ClientSideBar";
import Chatbot from "@/components/Chatbot";
import { Dumbbell, Music, Clock, Users, Shield, AlertCircle, Calendar, Heart } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <ClientSidebar />
        
        <div className="flex-1 lg:ml-64 p-6 pt-16 lg:pt-6">
          <div className="w-full max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center space-y-6 mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-gray-400 text-lg">Choose an option from the sidebar to get started.</p>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Studio Classes Card */}
              <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-8 border border-pink-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
                <div className="bg-pink-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                  <Music className="size-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Studio Classes</h3>
                <p className="text-sm text-gray-300">Book Zumba, Yoga, Boxing & Dance Classes</p>
                <div className="mt-4 text-xs text-pink-400 font-medium">
                  Variety of Group Classes
                </div>
              </div>

              {/* Gym Access Card */}
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-8 border border-orange-700/50 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
                <div className="bg-orange-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <Dumbbell className="size-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Gym Access</h3>
                <p className="text-sm text-gray-300">5 AM - 10 PM Daily Access</p>
                <div className="mt-4 text-xs text-orange-400 font-medium">
                  Full Equipment Access
                </div>
              </div>
            </div>

            {/* Gym & Studio Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Gym Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
                <div className="flex items-center mb-6">
                  <Dumbbell className="size-8 text-orange-500 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Gym Facilities</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="size-5 text-orange-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Operating Hours</h4>
                      <p className="text-sm text-gray-300">Monday - Sunday: 5:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="size-5 text-orange-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Available Equipment</h4>
                      <p className="text-sm text-gray-300">Cardio machines, Free weights, Strength training equipment, Functional training area</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="size-5 text-orange-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Amenities</h4>
                      <p className="text-sm text-gray-300">Locker rooms, Showers, Towel service, Water station</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
                <div className="flex items-center mb-6">
                  <Music className="size-8 text-pink-500 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Studio Classes</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="size-5 text-pink-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Class Schedule</h4>
                      <p className="text-sm text-gray-300">Multiple sessions daily - Check booking system for available slots</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="size-5 text-pink-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Available Classes</h4>
                      <p className="text-sm text-gray-300">Zumba, Yoga, Pilates, Boxing, Dance Fitness, HIIT, Spin</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Heart className="size-5 text-pink-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Class Duration</h4>
                      <p className="text-sm text-gray-300">45-60 minutes per session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules and Regulations */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <AlertCircle className="size-8 text-yellow-500 mr-3" />
                <h3 className="text-2xl font-bold text-white">Rules & Regulations</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-lg border-b border-gray-700 pb-2">General Rules</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Always put safety first and use equipment as intended
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Proper athletic attire required at all times
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Wipe down equipment after use with provided towels
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Return weights and equipment to their proper storage
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      No food in workout areas - Water bottles only
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-lg border-b border-gray-700 pb-2">Safety & Etiquette</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Consult with staff if you're new to equipment
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Respect personal space and limit workout time on busy equipment
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Report any equipment malfunctions immediately
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Studio classes require 2-hour advance booking
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Cancel bookings at least 1 hour in advance
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="size-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">
                    <strong>Important:</strong> Violation of rules may result in suspension of membership privileges. 
                    Please be respectful of other members and staff at all times.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Quick Start Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-400 font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Choose Service</h4>
                    <p className="text-gray-300">Select between Gym Access or Studio Classes</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-400 font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Book Session</h4>
                    <p className="text-gray-300">Pick your preferred date and time slot</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-400 font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Confirm & Enjoy</h4>
                    <p className="text-gray-300">Get confirmation and enjoy your workout!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </>
  );
}