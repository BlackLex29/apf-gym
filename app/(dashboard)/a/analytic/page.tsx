"use client";
import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  IconCalendar,
  IconCash,
  IconUsers,
  IconTrendingUp,
  IconActivity,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface AppointmentData {
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
  paymentAmount: string;
  createdAt: Date;
}

interface RevenueData {
  month: string;
  gym: number;
  studio: number;
  karate: number;
  total: number;
}

interface ServiceStats {
  name: string;
  value: number;
  color: string;
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const SERVICE_COLORS = {
    gym: "#FF6B35",
    studio: "#00C49F", 
    karate: "#0088FE",
  };

  useEffect(() => {
    loadAppointments();
  }, [timeRange]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsRef = collection(db, "appointments");
      const now = new Date();
      let startDate = new Date();

      // Calculate start date based on time range
      switch (timeRange) {
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const q = query(
        appointmentsRef,
        where("createdAt", ">=", startDate),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: AppointmentData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as AppointmentData);
      });

      setAppointments(appointmentsData);
      processAnalyticsData(appointmentsData);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (appointments: AppointmentData[]) => {
    // Process revenue data by month
    const monthlyRevenue: { [key: string]: RevenueData } = {};
    
    appointments.forEach((appointment) => {
      if (appointment.paymentStatus === "paid") {
        const date = new Date(appointment.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            month: monthName,
            gym: 0,
            studio: 0,
            karate: 0,
            total: 0,
          };
        }

        // Extract numeric value from payment amount
        const amount = parseInt(appointment.paymentAmount.replace(/[^\d]/g, '')) || 0;
        
        if (appointment.serviceType === "gym") {
          monthlyRevenue[monthKey].gym += amount;
        } else if (appointment.serviceType === "studio") {
          if (appointment.serviceName.toLowerCase().includes("karate")) {
            monthlyRevenue[monthKey].karate += amount;
          } else {
            monthlyRevenue[monthKey].studio += amount;
          }
        }
        
        monthlyRevenue[monthKey].total += amount;
      }
    });

    // Convert to array and sort by month
    const revenueArray = Object.values(monthlyRevenue).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });

    setRevenueData(revenueArray);

    // Process service statistics
    const serviceCounts: { [key: string]: number } = {
      gym: 0,
      studio: 0,
      karate: 0,
    };

    appointments.forEach((appointment) => {
      if (appointment.serviceType === "gym") {
        serviceCounts.gym++;
      } else if (appointment.serviceType === "studio") {
        if (appointment.serviceName.toLowerCase().includes("karate")) {
          serviceCounts.karate++;
        } else {
          serviceCounts.studio++;
        }
      }
    });

    const serviceStatsData: ServiceStats[] = [
      {
        name: "Gym",
        value: serviceCounts.gym,
        color: SERVICE_COLORS.gym,
      },
      {
        name: "Studio Classes",
        value: serviceCounts.studio,
        color: SERVICE_COLORS.studio,
      },
      {
        name: "Karate",
        value: serviceCounts.karate,
        color: SERVICE_COLORS.karate,
      },
    ];

    setServiceStats(serviceStatsData);
  };

  // Calculate summary statistics
  const totalRevenue = revenueData.reduce((sum, month) => sum + month.total, 0);
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(app => app.status === "confirmed").length;
  const pendingAppointments = appointments.filter(app => app.status === "pending").length;
  
  const gymRevenue = revenueData.reduce((sum, month) => sum + month.gym, 0);
  const studioRevenue = revenueData.reduce((sum, month) => sum + month.studio, 0);
  const karateRevenue = revenueData.reduce((sum, month) => sum + month.karate, 0);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <AppSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <AppSidebar />
      
      <div className="flex-1 lg:ml-64 flex flex-col p-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-400">Track your gym and studio performance</p>
            </div>
            
            <div className="flex gap-2 mt-4 lg:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <IconCash className="size-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <span className="text-gray-400">Gym: {formatCurrency(gymRevenue)}</span>
                <span className="text-gray-400">Studio: {formatCurrency(studioRevenue)}</span>
                <span className="text-gray-400">Karate: {formatCurrency(karateRevenue)}</span>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold text-blue-400">{totalAppointments}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <IconCalendar className="size-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <span className="text-green-400">{completedAppointments} Completed</span>
                <span className="text-yellow-400">{pendingAppointments} Pending</span>
              </div>
            </div>

            {/* Service Distribution */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Service Distribution</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {serviceStats.reduce((sum, stat) => sum + stat.value, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <IconUsers className="size-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <span className="text-orange-400">{serviceStats[0]?.value || 0} Gym</span>
                <span className="text-green-400">{serviceStats[1]?.value || 0} Studio</span>
                <span className="text-blue-400">{serviceStats[2]?.value || 0} Karate</span>
              </div>
            </div>

            {/* Average Revenue */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg. Monthly Revenue</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(revenueData.length > 0 ? totalRevenue / revenueData.length : 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <IconTrendingUp className="size-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Based on {revenueData.length} months
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <IconTrendingUp className="size-5 text-orange-400" />
                Revenue Trend
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      formatter={(value) => [`₱${Number(value).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Bar dataKey="gym" name="Gym" fill={SERVICE_COLORS.gym} />
                    <Bar dataKey="studio" name="Studio Classes" fill={SERVICE_COLORS.studio} />
                    <Bar dataKey="karate" name="Karate" fill={SERVICE_COLORS.karate} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Distribution Pie Chart */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <IconActivity className="size-5 text-orange-400" />
                Service Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Appointments"]}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Revenue Breakdown */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IconCash className="size-5 text-orange-400" />
              Detailed Revenue Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Month</th>
                    <th className="text-right py-3 px-4 text-gray-400">Gym Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400">Studio Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400">Karate Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((month, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium">{month.month}</td>
                      <td className="py-3 px-4 text-right text-orange-400">
                        {formatCurrency(month.gym)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-400">
                        {formatCurrency(month.studio)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-400">
                        {formatCurrency(month.karate)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatCurrency(month.total)}
                      </td>
                    </tr>
                  ))}
                  {revenueData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No revenue data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-700/50 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right text-orange-400">
                      {formatCurrency(gymRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-400">
                      {formatCurrency(studioRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-400">
                      {formatCurrency(karateRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(totalRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IconCalendar className="size-5 text-orange-400" />
              Recent Appointments
            </h3>
            <div className="space-y-4">
              {appointments.slice(0, 10).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      appointment.serviceType === "gym" 
                        ? "bg-orange-500/20" 
                        : appointment.serviceName.toLowerCase().includes("karate")
                        ? "bg-blue-500/20"
                        : "bg-green-500/20"
                    }`}>
                      {appointment.serviceType === "gym" ? (
                        <IconActivity className="size-5 text-orange-400" />
                      ) : (
                        <IconUsers className="size-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{appointment.clientName}</h4>
                      <p className="text-sm text-gray-400">
                        {appointment.serviceName} • {new Date(appointment.date).toLocaleDateString()} • {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-400">{appointment.paymentAmount}</p>
                    <p className={`text-xs ${
                      appointment.paymentStatus === "paid" 
                        ? "text-green-400" 
                        : "text-yellow-400"
                    }`}>
                      {appointment.paymentStatus} • {appointment.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No appointments found for the selected period
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}