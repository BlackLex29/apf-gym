"use client"

import { useState } from "react";
import { Calendar, DollarSign, Users, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  const revenueData = [
    { month: "Jan", gym: 15000, studio: 8000, karate: 5000, total: 28000 },
    { month: "Feb", gym: 18000, studio: 9500, karate: 6200, total: 33700 },
    { month: "Mar", gym: 22000, studio: 11000, karate: 7500, total: 40500 },
  ];

  const serviceStats = [
    { name: "Gym", value: 45, color: "#FF6B35" },
    { name: "Studio", value: 30, color: "#00C49F" },
    { name: "Karate", value: 25, color: "#0088FE" },
  ];

  const appointments = [
    { id: "1", clientName: "John Doe", serviceType: "gym", serviceName: "Personal Training", date: "2025-11-20", time: "10:00 AM", paymentAmount: "₱3,500", paymentStatus: "paid", paymentMethod: "cash" },
    { id: "2", clientName: "Jane Smith", serviceType: "studio", serviceName: "Zumba", date: "2025-11-21", time: "2:00 PM", paymentAmount: "₱350", paymentStatus: "paid", paymentMethod: "online" }
  ];

  const SERVICE_COLORS = { gym: "#FF6B35", studio: "#00C49F", karate: "#0088FE" };
  const totalRevenue = 102200;
  const gymRevenue = 55000;
  const studioRevenue = 28500;
  const karateRevenue = 18700;
  const formatCurrency = (amt: number) => `₱${amt.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your gym and studio performance</p>
          </div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-4 lg:mt-0 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
            <div className="p-3 bg-green-500/20 rounded-lg mb-3 inline-block"><DollarSign className="w-6 h-6 text-green-400" /></div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
            <div className="mt-4 flex flex-col items-center gap-1 text-xs">
              <span className="text-gray-400">Gym: {formatCurrency(gymRevenue)}</span>
              <span className="text-gray-400">Studio: {formatCurrency(studioRevenue)}</span>
              <span className="text-gray-400">Karate: {formatCurrency(karateRevenue)}</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
            <div className="p-3 bg-blue-500/20 rounded-lg mb-3 inline-block"><Calendar className="w-6 h-6 text-blue-400" /></div>
            <p className="text-gray-400 text-sm">Total Appointments</p>
            <p className="text-2xl font-bold text-blue-400">100</p>
            <div className="mt-4 flex flex-col items-center gap-1 text-xs">
              <span className="text-green-400">75 Completed</span>
              <span className="text-yellow-400">25 Pending</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
            <div className="p-3 bg-purple-500/20 rounded-lg mb-3 inline-block"><Users className="w-6 h-6 text-purple-400" /></div>
            <p className="text-gray-400 text-sm">Service Distribution</p>
            <p className="text-2xl font-bold text-purple-400">100</p>
            <div className="mt-4 flex flex-col items-center gap-1 text-xs">
              <span className="text-orange-400">45 Gym</span>
              <span className="text-green-400">30 Studio</span>
              <span className="text-blue-400">25 Karate</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
            <div className="p-3 bg-orange-500/20 rounded-lg mb-3 inline-block"><TrendingUp className="w-6 h-6 text-orange-400" /></div>
            <p className="text-gray-400 text-sm">Avg. Monthly Revenue</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(34066)}</p>
            <div className="mt-4 text-xs text-gray-400">Based on 3 months</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />Revenue Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="gym" name="Gym" fill="#FF6B35" />
                  <Bar dataKey="studio" name="Studio" fill="#00C49F" />
                  <Bar dataKey="karate" name="Karate" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />Service Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceStats} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} dataKey="value">
                    {serviceStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" />Detailed Revenue Breakdown
          </h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-center py-3 px-4 text-gray-400">Month</th>
                <th className="text-center py-3 px-4 text-gray-400">Gym</th>
                <th className="text-center py-3 px-4 text-gray-400">Studio</th>
                <th className="text-center py-3 px-4 text-gray-400">Karate</th>
                <th className="text-center py-3 px-4 text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((m, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-center">{m.month}</td>
                  <td className="py-3 px-4 text-center text-orange-400">{formatCurrency(m.gym)}</td>
                  <td className="py-3 px-4 text-center text-green-400">{formatCurrency(m.studio)}</td>
                  <td className="py-3 px-4 text-center text-blue-400">{formatCurrency(m.karate)}</td>
                  <td className="py-3 px-4 text-center font-bold">{formatCurrency(m.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-700/50 font-bold">
                <td className="py-3 px-4 text-center">Total</td>
                <td className="py-3 px-4 text-center text-orange-400">{formatCurrency(gymRevenue)}</td>
                <td className="py-3 px-4 text-center text-green-400">{formatCurrency(studioRevenue)}</td>
                <td className="py-3 px-4 text-center text-blue-400">{formatCurrency(karateRevenue)}</td>
                <td className="py-3 px-4 text-center">{formatCurrency(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />Recent Appointments
          </h3>
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${a.serviceType === "gym" ? "bg-orange-500/20" : "bg-green-500/20"}`}>
                    {a.serviceType === "gym" ? <Activity className="w-5 h-5 text-orange-400" /> : <Users className="w-5 h-5 text-green-400" />}
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="font-semibold">{a.clientName}</h4>
                    <p className="text-sm text-gray-400">{a.serviceName} • {new Date(a.date).toLocaleDateString()} • {a.time}</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="font-semibold text-orange-400">{a.paymentAmount}</p>
                  <p className="text-xs text-green-400">{a.paymentStatus} • {a.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}