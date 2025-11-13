"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Calendar, TrendingUp, Bell, Dumbbell, Clock, DollarSign,
  Activity, Music, Sparkles, RefreshCw, AlertCircle, Shield, LogIn
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    appointments: [],
    revenue: 0
  });
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasData, setHasData] = useState(false);
  const router = useRouter();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setAuthLoading(false);
      
      if (user) {
        console.log('User authenticated:', user.email);
        await fetchDashboardData();
      } else {
        console.log('No user, stopping loading');
        setLoading(false);
        setError('Please sign in to access the dashboard');
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper function to calculate stats dynamically
  const calculateStats = useCallback((data: DashboardData): Stat[] => {
    const totalAppointments = data.appointments.length;
    const confirmedAppointments = data.appointments.filter(apt => apt.status === 'confirmed').length;
    const pendingAppointments = data.appointments.filter(apt => apt.status === 'pending').length;
    const gymAppointments = data.appointments.filter(apt => apt.serviceType === 'gym').length;
    const studioAppointments = data.appointments.filter(apt => apt.serviceType === 'studio').length;
    const completedAppointments = data.appointments.filter(apt => apt.status === 'completed').length;

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
        title: 'Confirmed',
        value: confirmedAppointments.toString(),
        change: '+0%',
        icon: Users,
        color: 'bg-green-500',
        trend: 'up'
      },
      {
        title: 'Pending',
        value: pendingAppointments.toString(),
        change: '+0%',
        icon: Clock,
        color: 'bg-yellow-500',
        trend: pendingAppointments > 0 ? 'up' : 'down'
      },
      {
        title: 'Completed',
        value: completedAppointments.toString(),
        change: '+0%',
        icon: Shield,
        color: 'bg-emerald-500',
        trend: 'up'
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
      }
    ];
  }, []);

  // Calculate revenue based on appointments
  const calculateRevenue = useCallback((appointments: Appointment[]): number => {
    const priceMap: { [key: string]: number } = {
      'Personal Training': 3500,
      'Weight Training': 300,
      'Zumba Class': 350,
      'Yoga Session': 400,
      'Boxing Training': 450,
      'Pilates Class': 380
    };

    return appointments
      .filter(apt => apt.paymentStatus === 'paid' || apt.status === 'completed')
      .reduce((total, apt) => {
        const price = priceMap[apt.serviceName] || 0;
        return total + price;
      }, 0);
  }, []);

  // Create default stats for empty state
  const createDefaultStats = useCallback((): Stat[] => {
    return [
      {
        title: 'Total Appointments',
        value: '0',
        change: '+0%',
        icon: Calendar,
        color: 'bg-blue-500',
        trend: 'up'
      },
      {
        title: 'Confirmed',
        value: '0',
        change: '+0%',
        icon: Users,
        color: 'bg-green-500',
        trend: 'up'
      },
      {
        title: 'Pending',
        value: '0',
        change: '+0%',
        icon: Clock,
        color: 'bg-yellow-500',
        trend: 'down'
      },
      {
        title: 'Completed',
        value: '0',
        change: '+0%',
        icon: Shield,
        color: 'bg-emerald-500',
        trend: 'up'
      },
      {
        title: 'Total Revenue',
        value: '₱0',
        change: '+0%',
        icon: DollarSign,
        color: 'bg-purple-500',
        trend: 'up'
      },
      {
        title: 'Gym Sessions',
        value: '0',
        change: '+0%',
        icon: Dumbbell,
        color: 'bg-orange-500',
        trend: 'up'
      },
      {
        title: 'Studio Classes',
        value: '0',
        change: '+0%',
        icon: Music,
        color: 'bg-pink-500',
        trend: 'up'
      }
    ];
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      console.log('No user available for fetching data');
      setError('Please sign in to access dashboard data');
      setLoading(false);
      return;
    }

    console.log('Starting to fetch dashboard data...');
    setLoading(true);
    setError(null);

    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // Reduced timeout to 10s
      );

      // Check if Firebase is initialized
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }

      console.log('Firebase DB initialized, fetching appointments...');

      // Fetch appointments from Firestore with limit for better performance
      const appointmentsRef = collection(db, "appointments");
      const appointmentsQuery = query(
        appointmentsRef, 
        orderBy("createdAt", "desc"),
        limit(100) // Limit to 100 documents for performance
      );
      
      const fetchPromise = getDocs(appointmentsQuery);
      const appointmentsSnapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;

      console.log('Snapshot received:', appointmentsSnapshot.size, 'documents');

      const appointmentsData: Appointment[] = [];
      
      if (appointmentsSnapshot.empty) {
        console.log('No appointments found in database');
        // Create empty dashboard with default stats
        const defaultStats = createDefaultStats();
        const finalData: DashboardData = {
          stats: defaultStats,
          appointments: [],
          revenue: 0
        };
        
        setDashboardData(finalData);
        setHasData(false);
        setLoading(false);
        setRetryCount(0);
        return;
      }

      appointmentsSnapshot.forEach((doc: any) => {
        const data = doc.data();
        // Add validation for required fields
        if (data.clientName && data.serviceName) {
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
        }
      });

      console.log('Processed appointments:', appointmentsData.length);

      // Calculate revenue
      const revenue = calculateRevenue(appointmentsData);

      const finalData: DashboardData = {
        stats: [],
        appointments: appointmentsData,
        revenue: revenue
      };

      finalData.stats = calculateStats(finalData);
      setDashboardData(finalData);
      setHasData(true);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
      
      console.log('Dashboard data loaded successfully');
      console.log('Total appointments:', appointmentsData.length);
      console.log('Total revenue:', revenue);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      
      let errorMessage = 'Failed to load dashboard data. ';
      let shouldRetry = false;
      
      if (err.message === 'Request timeout') {
        errorMessage += 'Request timed out. ';
        shouldRetry = retryCount < 2; // Reduced retry attempts
      } else if (err.code === 'permission-denied') {
        errorMessage += 'Access denied. Please check Firestore security rules.';
      } else if (err.message.includes('Firebase is not properly initialized')) {
        errorMessage += 'Firebase configuration issue. Please check your Firebase setup.';
      } else if (err.code === 'unavailable') {
        errorMessage += 'Network error. Please check your internet connection.';
        shouldRetry = retryCount < 2;
      } else if (err.code === 'not-found') {
        // Collection doesn't exist yet, show empty dashboard
        console.log('Collection not found, showing empty dashboard');
        const defaultStats = createDefaultStats();
        const finalData: DashboardData = {
          stats: defaultStats,
          appointments: [],
          revenue: 0
        };
        setDashboardData(finalData);
        setHasData(false);
        setLoading(false);
        return;
      } else {
        errorMessage += `Please try again. Error: ${err.message}`;
        shouldRetry = retryCount < 1;
      }
      
      // For non-critical errors, show empty dashboard instead of error
      if (err.code === 'not-found' || err.code === 'permission-denied') {
        const defaultStats = createDefaultStats();
        const finalData: DashboardData = {
          stats: defaultStats,
          appointments: [],
          revenue: 0
        };
        setDashboardData(finalData);
        setHasData(false);
        setLoading(false);
      } else {
        setError(errorMessage);
        setLoading(false);
        
        // Auto-retry for transient errors
        if (shouldRetry) {
          console.log(`Retrying fetch... (${retryCount + 1}/2)`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            if (user) fetchDashboardData();
          }, 1000 * (retryCount + 1)); // Reduced backoff
        }
      }
    }
  }, [user, calculateRevenue, calculateStats, retryCount, createDefaultStats]);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToBookings = () => {
    router.push('/a/booking');
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchDashboardData();
  };

  // Show authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
          <p className="text-gray-400 mb-6">
            Please sign in to access the admin dashboard
          </p>
          <button
            onClick={handleSignIn}
            className="w-full bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-400">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">
            {retryCount > 0 ? `Retry attempt ${retryCount}/2` : 'Fetching from database'}
          </p>
          <p className="text-xs text-gray-600 mt-1">User: {user.email}</p>
        </div>
      </div>
    );
  }

  if (error && !hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2 text-red-400">Unable to Load Dashboard</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {retryCount >= 2 ? 'Try Again' : 'Retry Loading Data'}
            </button>
            <button
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Content - Shows even if there's no data but user is authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome, {user.email} 
              <button 
                onClick={handleSignOut}
                className="ml-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                (Sign Out)
              </button>
            </p>
            {!hasData && (
              <p className="text-sm text-yellow-400 mt-1">
                No appointment data found. Bookings will appear here once created.
              </p>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={fetchDashboardData} 
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50" 
              title="Refresh data"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
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
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
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
                <button 
                  onClick={navigateToBookings}
                  className="text-sm bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      appointment.serviceType === 'gym' ? 'bg-orange-500' : 'bg-pink-500'
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
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
              {dashboardData.appointments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found</p>
                  <p className="text-sm mt-2">Appointments will appear here once booked</p>
                  <button 
                    onClick={() => router.push('/a/booking')}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded transition-colors"
                  >
                    Create First Booking
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/a/booking')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 p-4 rounded-lg text-left transition-all transform hover:scale-105"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Manage Bookings
              </button>
              <button 
                onClick={() => router.push('/a/usermanagement')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-4 rounded-lg text-left transition-all transform hover:scale-105"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Manage Users
              </button>
              <button 
                onClick={() => router.push('/a/analytic')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-lg text-left transition-all transform hover:scale-105"
              >
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