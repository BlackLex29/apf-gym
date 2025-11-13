"use client";
import React from "react";
import { ClientSidebar } from "@/components/ClientSideBar";
import Chatbot from "@/components/Chatbot";
import { Dumbbell, Music } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <ClientSidebar />
        
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6 pt-16 lg:pt-6">
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-gray-400 text-lg">Choose an option from the sidebar to get started.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-8 border border-pink-700/50 backdrop-blur-sm shadow-xl">
                  <Music className="size-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Studio Classes</h3>
                  <p className="text-sm text-gray-300 mt-2">Book Zumba, Boxing, Dance</p>
                </div>
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-8 border border-orange-700/50 backdrop-blur-sm shadow-xl">
                  <Dumbbell className="size-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Gym Access</h3>
                  <p className="text-sm text-gray-300 mt-2">5 AM - 10 PM Daily</p>
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