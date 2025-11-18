"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Calendar, TrendingUp, Bell, Dumbbell, Clock, DollarSign,
  Activity, Music, Sparkles, RefreshCw, AlertCircle, Shield, LogIn
} from 'lucide-react';

// Define types
interface Stat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down';
}

interface Appointment {
  id: string;
  clientName: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  coach?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
}

interface DashboardData {
  stats: Stat[];
  appointments: Appointment[];
  revenue: number;
}

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [user] = useState({ email: 'admin@gymschedpro.com' });
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [
      {
        title: 'Total Appointments',
        value: '24',
        change: '+12%',
        icon: Calendar,
        color: 'bg-blue-500',
        trend: 'up'
      },
      {
        title: 'Confirmed',
        value: '18',
        change: '+8%',
        icon: Users,
        color: 'bg-green-500',
        trend: 'up'
      },
      {
        title: 'Pending',
        value: '6',
        change: '-3%',
        icon: Clock,
        color: 'bg-yellow-500',
        trend: 'down'
      },
      {
        title: 'Completed',
        value: '156',
        change: '+23%',
        icon: Shield,
        color: 'bg-emerald-500',
        trend: 'up'
      },
      {
        title: 'Total Revenue',
        value: '₱45,200',
        change: '+15%',
        icon: DollarSign,
        color: 'bg-purple-500',
        trend: 'up'
      },
      {
        title: 'Gym Sessions',
        value: '18',
        change: '+10%',
        icon: Dumbbell,
        color: 'bg-orange-500',
        trend: 'up'
      },
      {
        title: 'Studio Classes',
        value: '6',
        change: '+5%',
        icon: Music,
        color: 'bg-pink-500',
        trend: 'up'
      }
    ],
    appointments: [
      {
        id: '1',
        clientName: 'John Doe',
        serviceType: 'gym',
        serviceName: 'Personal Training',
        date: '2025-11-18',
        time: '10:00 AM',
        coach: 'Coach Mike',
        status: 'confirmed',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        createdAt: new Date()
      },
      {
        id: '2',
        clientName: 'Jane Smith',
        serviceType: 'studio',
        serviceName: 'Zumba Class',
        date: '2025-11-18',
        time: '2:00 PM',
        status: 'pending',
        paymentMethod: 'online',
        paymentStatus: 'pending',
        createdAt: new Date()
      }
    ],
    revenue: 45200
  });

  // Main Dashboard Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header - Centered content */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Welcome, {user.email}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button className="relative p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid - Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.slice(0, 4).map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 transform duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1 text-center">{stat.title}</h3>
                <p className="text-3xl font-bold text-center">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Stats Row - Centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardData.stats.slice(4).map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 transform duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1 text-center">{stat.title}</h3>
                <p className="text-3xl font-bold text-center">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Appointments & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Appointments</h2>
              <div className="flex gap-2">
                <span className="text-sm text-gray-400">{dashboardData.appointments.length} total</span>
                <button className="text-sm bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded transition-colors">
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${appointment.serviceType === 'gym' ? 'bg-orange-500' : 'bg-pink-500'
                      }`}>
                      {appointment.serviceType === 'gym' ? <Dumbbell className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.clientName}</p>
                      <p className="text-sm text-gray-400">{appointment.serviceName}</p>
                      {appointment.coach && (
                        <p className="text-xs text-blue-400">Coach: {appointment.coach}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        appointment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                      }`}>
                      {appointment.status}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">{appointment.date}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Centered */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                <Calendar className="w-5 h-5 inline mr-2" />
                Manage Bookings
              </button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                <Users className="w-5 h-5 inline mr-2" />
                Manage Users
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                <TrendingUp className="w-5 h-5 inline mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard