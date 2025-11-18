"use client";
import React, { useState, useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconPhone,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  phone: string;
  email: string;
  notes?: string;
  coachName: string;
  duration: string;
}

export default function CoachAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [coachName, setCoachName] = useState("Coach Carlos");

  // Mock data - dapat galing sa API
  const mockAppointments: Appointment[] = [
    {
      id: 1,
      clientName: "Juan Dela Cruz",
      service: "Personal Training",
      date: "2024-01-20",
      time: "9:00 AM",
      status: "confirmed",
      phone: "+63 912 345 6789",
      email: "juan@email.com",
      notes: "Weight loss program - focus on cardio and nutrition",
      coachName: "Coach Carlos",
      duration: "1 hour"
    },
    {
      id: 2,
      clientName: "Maria Santos",
      service: "Yoga Session",
      date: "2024-01-20",
      time: "2:00 PM",
      status: "pending",
      phone: "+63 912 345 6790",
      email: "maria@email.com",
      notes: "Beginner yoga, flexibility training",
      coachName: "Coach Carlos",
      duration: "1.5 hours"
    },
    {
      id: 3,
      clientName: "Pedro Reyes",
      service: "Strength Training",
      date: "2024-01-21",
      time: "10:00 AM",
      status: "confirmed",
      phone: "+63 912 345 6791",
      email: "pedro@email.com",
      notes: "Advanced weight lifting program",
      coachName: "Coach Carlos",
      duration: "1 hour"
    },
    {
      id: 4,
      clientName: "Anna Lopez",
      service: "Personal Training",
      date: "2024-01-21",
      time: "4:00 PM",
      status: "pending",
      phone: "+63 912 345 6792",
      email: "anna@email.com",
      coachName: "Coach Carlos",
      duration: "1 hour"
    },
    {
      id: 5,
      clientName: "Carlos Mendez",
      service: "Boxing Training",
      date: "2024-01-22",
      time: "11:00 AM",
      status: "completed",
      phone: "+63 912 345 6793",
      email: "carlos@email.com",
      notes: "Boxing fundamentals and footwork",
      coachName: "Coach Carlos",
      duration: "1 hour"
    },
    {
      id: 6,
      clientName: "Sofia Rodriguez",
      service: "Pilates",
      date: "2024-01-22",
      time: "3:00 PM",
      status: "cancelled",
      phone: "+63 912 345 6794",
      email: "sofia@email.com",
      coachName: "Coach Carlos",
      duration: "1 hour"
    }
  ];

  useEffect(() => {
    // Dito pwedeng mag-fetch ng data from API
    setAppointments(mockAppointments);
  }, []);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const statusLabels = {
    pending: "Pending Confirmation",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const handleStatusUpdate = (id: number, newStatus: Appointment["status"]) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    ));
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today && apt.status !== "cancelled");
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date >= today && apt.status !== "cancelled");
  };

  const getAppointmentsCountByStatus = (status: Appointment["status"]) => {
    return appointments.filter(apt => apt.status === status).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="flex-1 lg:ml-64 p-6 pt-16 lg:pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <IconCalendar className="size-8 text-orange-400" />
                  My Appointments
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage your training sessions and client appointments
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Welcome back,</p>
                  <p className="font-semibold text-orange-400">{coachName}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <IconUser className="size-6 text-white" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold text-white">{appointments.length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-blue-400">{getUpcomingAppointments().length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Pending Confirmations</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {getAppointmentsCountByStatus("pending")}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Completed Sessions</p>
                <p className="text-2xl font-bold text-green-400">
                  {getAppointmentsCountByStatus("completed")}
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <input
                    type="text"
                    placeholder="Search clients or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Today's Appointments */}
            {getTodaysAppointments().length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <IconClock className="size-5 text-orange-400" />
                  Today's Schedule ({getTodaysAppointments().length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTodaysAppointments().map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-orange-500/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[appointment.status]}`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{appointment.service}</p>
                      <p className="text-lg font-bold text-orange-400">{appointment.time}</p>
                      <p className="text-xs text-gray-500 mt-2">Duration: {appointment.duration}</p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-400 mt-2 truncate">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Appointments Table */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <IconCalendar className="size-5 text-orange-400" />
                  All Appointments ({filteredAppointments.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 font-semibold">Client</th>
                      <th className="text-left p-4 font-semibold">Service</th>
                      <th className="text-left p-4 font-semibold">Date & Time</th>
                      <th className="text-left p-4 font-semibold">Duration</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-semibold">{appointment.clientName}</p>
                            <p className="text-sm text-gray-400">{appointment.phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300">{appointment.service}</span>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {appointment.notes}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-gray-300">{formatDate(appointment.date)}</p>
                            <p className="text-sm text-gray-400">{appointment.time}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300">{appointment.duration}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                            {statusLabels[appointment.status]}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {appointment.status === "pending" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(appointment.id, "confirmed");
                                  }}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs font-medium transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(appointment.id, "cancelled");
                                  }}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(appointment.id, "completed");
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs font-medium transition-colors"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <IconCalendar className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">Appointment Details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <IconX className="size-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Client Name
                  </label>
                  <p className="text-lg font-semibold">{selectedAppointment.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      <IconPhone className="size-4 inline mr-1" />
                      Phone
                    </label>
                    <p className="text-gray-300">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      <IconMail className="size-4 inline mr-1" />
                      Email
                    </label>
                    <p className="text-gray-300">{selectedAppointment.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Service
                    </label>
                    <p className="text-gray-300">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Duration
                    </label>
                    <p className="text-gray-300">{selectedAppointment.duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <p className="text-gray-300">{formatDate(selectedAppointment.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Time
                    </label>
                    <p className="text-gray-300">{selectedAppointment.time}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedAppointment.status]}`}>
                    {statusLabels[selectedAppointment.status]}
                  </span>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Client Notes
                    </label>
                    <p className="text-gray-300 bg-gray-700/50 rounded-lg p-3">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                {selectedAppointment.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, "confirmed");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, "cancelled");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, "completed");
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </>
  );
}