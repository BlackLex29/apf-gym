"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, TrendingUp, Bell, Dumbbell, Clock, DollarSign,
  Activity, Music, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

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

interface GymMember {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'Active' | 'Expiring Soon';
  checkin: string;
  createdAt: Date;
}

interface StudioClass {
  name: string;
  attendees: number;
  percentage: number;
  icon: string;
}

interface MembershipStat {
  plan: string;
  count: number;
  color: string;
}

interface DashboardData {
  stats: Stat[];
  appointments: Appointment[];
  gymMembers: GymMember[];
  studioClasses: StudioClass[];
  membershipStats: MembershipStat[];
  revenue: number;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    appointments: [],
    gymMembers: [],
    studioClasses: [],
    membershipStats: [],
    revenue: 0
  });

  // Helper function to calculate stats dynamically
  const calculateStats = (data: DashboardData): Stat[] => {
    const totalAppointments = data.appointments.length;
    const confirmedAppointments = data.appointments.filter(apt => apt.status === 'confirmed').length;
    const pendingAppointments = data.appointments.filter(apt => apt.status === 'pending').length;
    const gymAppointments = data.appointments.filter(apt => apt.serviceType === 'gym').length;
    const studioAppointments = data.appointments.filter(apt => apt.serviceType === 'studio').length;
    const totalMembers = data.gymMembers.length;
    const activeMembers = data.gymMembers.filter(m => m.status === 'Active').length;

    return [
      {
        title: 'Total Appointments',
        value: totalAppointments.toString(),
        change: '+0%',
        icon: Calendar,
        color: 'bg-blue-500',
        trend: 'up'
      },
      {
        title: 'Confirmed Appointments',
        value: confirmedAppointments.toString(),
        change: '+0%',
        icon: Users,
        color: 'bg-green-500',
        trend: 'up'
      },
      {
        title: 'Pending Appointments',
        value: pendingAppointments.toString(),
        change: '+0%',
        icon: Clock,
        color: 'bg-yellow-500',
        trend: pendingAppointments > 0 ? 'up' : 'down'
      },
      {
        title: 'Total Revenue',
        value: `₱${data.revenue.toLocaleString()}`,
        change: '+0%',
        icon: DollarSign,
        color: 'bg-purple-500',
        trend: 'up'
      },
      {
        title: 'Gym Sessions',
        value: gymAppointments.toString(),
        change: '+0%',
        icon: Dumbbell,
        color: 'bg-orange-500',
        trend: 'up'
      },
      {
        title: 'Studio Classes',
        value: studioAppointments.toString(),
        change: '+0%',
        icon: Music,
        color: 'bg-pink-500',
        trend: 'up'
      },
      {
        title: 'Total Members',
        value: totalMembers.toString(),
        change: '+0%',
        icon: Users,
        color: 'bg-cyan-500',
        trend: 'up'
      },
      {
        title: 'Active Members',
        value: activeMembers.toString(),
        change: '+0%',
        icon: Activity,
        color: 'bg-emerald-500',
        trend: 'up'
      }
    ];
  };

  // Calculate revenue based on appointments
  const calculateRevenue = (appointments: Appointment[]): number => {
    const priceMap: { [key: string]: number } = {
      'Personal Training': 3500,
      'Weight Training': 300,
      'Zumba Class': 350,
      'Yoga Session': 400,
      'Boxing Training': 450,
      'Pilates Class': 380
    };

    return appointments
      .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
      .reduce((total, apt) => {
        const price = priceMap[apt.serviceName] || 0;
        return total + price;
      }, 0);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching dashboard data...');

      // Fetch appointments from Firestore
      const appointmentsRef = collection(db, "appointments");
      const appointmentsQuery = query(appointmentsRef, orderBy("createdAt", "desc"));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      
      const appointmentsData: Appointment[] = [];
      appointmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Appointment data:', data);
        
        appointmentsData.push({
          id: doc.id,
          clientName: data.clientName || "Unknown Client",
          serviceType: data.serviceType || "unknown",
          serviceName: data.serviceName || "Unknown Service",
          date: data.date || "Unknown Date",
          time: data.time || "Unknown Time",
          coach: data.coach,
          status: data.status || "pending",
          paymentMethod: data.paymentMethod || "cash",
          paymentStatus: data.paymentStatus || "pending",
          createdAt: data.createdAt?.toDate() || new Date()
        } as Appointment);
      });

      console.log('Fetched appointments:', appointmentsData.length);

      // Try to fetch users, but if it fails, use mock data
      let membersData: GymMember[] = [];
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          membersData.push({
            id: doc.id,
            name: data.displayName || data.email || "Unknown User",
            email: data.email || "No email",
            plan: "Monthly",
            status: "Active",
            checkin: "Today",
            createdAt: data.createdAt?.toDate() || new Date()
          } as GymMember);
        });
      } catch (userError) {
        console.log('Users collection not available, using mock data');
        // Use mock members data if users collection doesn't exist
        membersData = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            plan: 'Monthly',
            status: 'Active',
            checkin: 'Today',
            createdAt: new Date()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            plan: 'Monthly',
            status: 'Active',
            checkin: 'Today',
            createdAt: new Date()
          }
        ];
      }

      // Calculate studio class attendance based on appointments
      const studioClassesData: StudioClass[] = [
        { 
          name: 'Zumba', 
          attendees: appointmentsData.filter(apt => 
            apt.serviceType === 'studio' && apt.serviceName === 'Zumba Class' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          percentage: 0, 
          icon: '💃' 
        },
        { 
          name: 'Boxing', 
          attendees: appointmentsData.filter(apt => 
            apt.serviceType === 'studio' && apt.serviceName === 'Boxing Training' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          percentage: 0, 
          icon: '🥊' 
        },
        { 
          name: 'Yoga', 
          attendees: appointmentsData.filter(apt => 
            apt.serviceType === 'studio' && apt.serviceName === 'Yoga Session' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          percentage: 0, 
          icon: '🧘' 
        },
        { 
          name: 'Pilates', 
          attendees: appointmentsData.filter(apt => 
            apt.serviceType === 'studio' && apt.serviceName === 'Pilates Class' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          percentage: 0, 
          icon: '💪' 
        },
      ];

      // Calculate percentages
      const totalStudioAttendees = studioClassesData.reduce((sum, cls) => sum + cls.attendees, 0);
      studioClassesData.forEach(cls => {
        cls.percentage = totalStudioAttendees > 0 ? Math.round((cls.attendees / totalStudioAttendees) * 100) : 0;
      });

      // Calculate membership stats based on appointments
      const membershipStatsData: MembershipStat[] = [
        { 
          plan: 'Personal Training', 
          count: appointmentsData.filter(apt => 
            apt.serviceType === 'gym' && apt.serviceName === 'Personal Training' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          color: 'from-blue-500 to-cyan-500' 
        },
        { 
          plan: 'Weight Training', 
          count: appointmentsData.filter(apt => 
            apt.serviceType === 'gym' && apt.serviceName === 'Weight Training' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          color: 'from-orange-500 to-red-500' 
        },
        { 
          plan: 'Studio Classes', 
          count: appointmentsData.filter(apt => 
            apt.serviceType === 'studio' && 
            (apt.status === 'confirmed' || apt.status === 'completed')
          ).length, 
          color: 'from-purple-500 to-pink-500' 
        },
      ];

      // Calculate revenue
      const revenue = calculateRevenue(appointmentsData);

      const finalData: DashboardData = {
        stats: [],
        appointments: appointmentsData,
        gymMembers: membersData,
        studioClasses: studioClassesData,
        membershipStats: membershipStatsData,
        revenue: revenue
      };

      finalData.stats = calculateStats(finalData);
      setDashboardData(finalData);
      setLoading(false);
      
      console.log('Dashboard data loaded successfully');
      console.log('Total appointments:', appointmentsData.length);
      console.log('Total members:', membersData.length);
      console.log('Total revenue:', revenue);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Fallback to mock data if Firestore fails
  const loadMockData = () => {
    console.log('Loading mock data...');
    const mockData: DashboardData = {
      stats: [
        {
          title: 'Total Appointments',
          value: '0',
          change: '+0%',
          icon: Calendar,
          color: 'bg-blue-500',
          trend: 'up'
        },
        {
          title: 'Confirmed Appointments',
          value: '0',
          change: '+0%',
          icon: Users,
          color: 'bg-green-500',
          trend: 'up'
        },
        {
          title: 'Pending Appointments',
          value: '0',
          change: '+0%',
          icon: Clock,
          color: 'bg-yellow-500',
          trend: 'down'
        },
        {
          title: 'Total Revenue',
          value: '₱0',
          change: '+0%',
          icon: DollarSign,
          color: 'bg-purple-500',
          trend: 'up'
        }
      ],
      appointments: [],
      gymMembers: [
        {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          plan: 'Monthly',
          status: 'Active',
          checkin: 'Today',
          createdAt: new Date()
        }
      ],
      studioClasses: [
        { name: 'Zumba', attendees: 0, percentage: 0, icon: '💃' },
        { name: 'Boxing', attendees: 0, percentage: 0, icon: '🥊' },
        { name: 'Yoga', attendees: 0, percentage: 0, icon: '🧘' },
        { name: 'Pilates', attendees: 0, percentage: 0, icon: '💪' },
      ],
      membershipStats: [
        { plan: 'Personal Training', count: 0, color: 'from-blue-500 to-cyan-500' },
        { plan: 'Weight Training', count: 0, color: 'from-orange-500 to-red-500' },
        { plan: 'Studio Classes', count: 0, color: 'from-purple-500 to-pink-500' },
      ],
      revenue: 0
    };
    
    setDashboardData(mockData);
    setError(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-400 mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={loadMockData}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
            >
              Use Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Studio & Gym Management</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={fetchDashboardData} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors" title="Refresh data">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
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
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Appointments</h2>
              <span className="text-sm text-gray-400">{dashboardData.appointments.length} total</span>
            </div>
            <div className="space-y-4">
              {dashboardData.appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      appointment.serviceType === 'gym' ? 'bg-orange-500' : 'bg-pink-500'
                    }`}>
                      {appointment.serviceType === 'gym' ? <Dumbbell className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.clientName}</p>
                      <p className="text-sm text-gray-400">{appointment.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      appointment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {appointment.status}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">{appointment.date}</p>
                  </div>
                </div>
              ))}
              {dashboardData.appointments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Classes */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Popular Classes</h2>
            <div className="space-y-4">
              {dashboardData.studioClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{classItem.icon}</span>
                    <div>
                      <p className="font-semibold">{classItem.name}</p>
                      <p className="text-sm text-gray-400">{classItem.attendees} attendees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{classItem.percentage}%</span>
                    <div className="w-20 h-2 bg-gray-600 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        style={{ width: `${classItem.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-6">Service Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.membershipStats.map((stat, index) => (
              <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white`}>
                <h3 className="text-lg font-bold mb-2">{stat.plan}</h3>
                <p className="text-3xl font-bold">{stat.count}</p>
                <p className="text-sm opacity-80">bookings</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}