"use client";
import React, { useState, useEffect } from "react";
import {
  IconCalendar,
  IconSearch,
  IconFilter,
  IconCheck,
  IconX,
  IconUser,
  IconClock,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  coach?: string;
  coachSpecialty?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: "cash" | "gcash";
  paymentStatus: "pending" | "paid";
  notes?: string;
  createdAt: Date;
  userId: string;
}

export default function BookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  // Fetch appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const appointmentsData: Appointment[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            appointmentsData.push({
              id: doc.id,
              clientName: data.clientName,
              clientEmail: data.clientEmail,
              clientPhone: data.clientPhone,
              serviceType: data.serviceType,
              serviceName: data.serviceName,
              date: data.date,
              time: data.time,
              coach: data.coach,
              coachSpecialty: data.coachSpecialty,
              status: data.status,
              paymentMethod: data.paymentMethod,
              paymentStatus: data.paymentStatus,
              notes: data.notes,
              createdAt: data.createdAt?.toDate() || new Date(),
              userId: data.userId
            });
          });
          setAppointments(appointmentsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const serviceLabels = {
    gym: "Gym Session",
    studio: "Studio Class"
  };

  const paymentLabels = {
    cash: "Cash",
    gcash: "GCash"
  };

  const paymentStatusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    paid: "bg-green-500/20 text-green-400"
  };

  const updateAppointmentStatus = async (id: string, newStatus: Appointment["status"]) => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  const updatePaymentStatus = async (id: string, newPaymentStatus: "pending" | "paid") => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await updateDoc(appointmentRef, {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await deleteDoc(appointmentRef);
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesService = filterService === "all" || apt.serviceType === filterService;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusCount = (status: Appointment["status"]) => {
    return appointments.filter(apt => apt.status === status).length;
  };

  const getServiceCount = (serviceType: string) => {
    return appointments.filter(apt => apt.serviceType === serviceType).length;
  };

  const getPaymentStatusCount = (paymentStatus: "pending" | "paid") => {
    return appointments.filter(apt => apt.paymentStatus === paymentStatus).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header - Centered */}
            <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:text-left gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center justify-center lg:justify-start gap-3">
                  <IconCalendar className="size-8 text-orange-400" />
                  Bookings Management
                </h1>
                <p className="text-gray-400 mt-2">
                  View and manage all client appointments
                </p>
              </div>
              
              <div className="text-sm text-gray-400">
                Total Appointments: <span className="text-white font-semibold">{appointments.length}</span>
              </div>
            </div>

            {/* Stats Cards - Centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{getStatusCount("pending")}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-blue-400">{getStatusCount("confirmed")}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Gym Sessions</p>
                <p className="text-2xl font-bold text-orange-400">{getServiceCount("gym")}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Studio Classes</p>
                <p className="text-2xl font-bold text-pink-400">{getServiceCount("studio")}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Pending Payment</p>
                <p className="text-2xl font-bold text-yellow-400">{getPaymentStatusCount("pending")}</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="relative">
                  <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="all">All Services</option>
                    <option value="gym">Gym Sessions</option>
                    <option value="studio">Studio Classes</option>
                  </select>
                </div>

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

            {/* Appointments Table - Centered */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-center p-4 font-semibold">Client</th>
                      <th className="text-center p-4 font-semibold">Service Type</th>
                      <th className="text-center p-4 font-semibold">Service Details</th>
                      <th className="text-center p-4 font-semibold">Date & Time</th>
                      <th className="text-center p-4 font-semibold">Payment</th>
                      <th className="text-center p-4 font-semibold">Status</th>
                      <th className="text-center p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr 
                        key={appointment.id} 
                        className="border-b border-gray-700/50 hover:bg-gray-700/20"
                      >
                        <td className="p-4">
                          <div className="text-center">
                            <p className="font-semibold">{appointment.clientName}</p>
                            <p className="text-sm text-gray-400">{appointment.clientEmail}</p>
                            <p className="text-xs text-gray-500">{appointment.clientPhone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            appointment.serviceType === "gym" 
                              ? "bg-orange-500/20 text-orange-400" 
                              : "bg-pink-500/20 text-pink-400"
                          }`}>
                            {serviceLabels[appointment.serviceType as keyof typeof serviceLabels]}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-center">
                            <p className="font-medium">{appointment.serviceName}</p>
                            {appointment.coach && (
                              <p className="text-xs text-blue-400 mt-1">
                                Coach: {appointment.coach}
                              </p>
                            )}
                            {appointment.notes && (
                              <p className="text-xs text-gray-400 mt-1">{appointment.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-center">
                            <p className="text-sm">{formatDate(appointment.date)}</p>
                            <p className="text-xs text-gray-400">{appointment.time}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              paymentStatusColors[appointment.paymentStatus]
                            }`}>
                              {appointment.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                            <p className="text-xs text-gray-400">
                              {paymentLabels[appointment.paymentMethod]}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${
                            statusColors[appointment.status]
                          }`}>
                            {statusLabels[appointment.status]}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <IconEdit className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(appointment.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Delete Appointment"
                            >
                              <IconTrash className="size-4" />
                            </button>
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

      {/* Appointment Details Modal - Centered */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-center flex-1">Appointment Details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <IconX className="size-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <IconUser className="size-5 text-orange-400" />
                    Client Information
                  </h3>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-300">{selectedAppointment.clientName}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <p className="text-gray-300">{selectedAppointment.clientEmail}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-300">{selectedAppointment.clientPhone}</p>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <IconCalendar className="size-5 text-orange-400" />
                    Appointment Details
                  </h3>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Service Type
                    </label>
                    <p className="text-gray-300">
                      {serviceLabels[selectedAppointment.serviceType as keyof typeof serviceLabels]}
                    </p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Service
                    </label>
                    <p className="text-gray-300">{selectedAppointment.serviceName}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date & Time
                    </label>
                    <p className="text-gray-300">
                      {formatDate(selectedAppointment.date)} at {selectedAppointment.time}
                    </p>
                  </div>
                  {selectedAppointment.coach && (
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Assigned Coach
                      </label>
                      <p className="text-gray-300">
                        {selectedAppointment.coach} {selectedAppointment.coachSpecialty && `- ${selectedAppointment.coachSpecialty}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Method
                  </label>
                  <p className="text-gray-300">
                    {paymentLabels[selectedAppointment.paymentMethod]}
                  </p>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Status
                  </label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatusColors[selectedAppointment.paymentStatus]
                  }`}>
                    {selectedAppointment.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Client Notes
                  </label>
                  <p className="text-gray-300 bg-gray-700/50 rounded-lg p-3">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Status Actions - Centered */}
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {/* Payment Status Actions */}
                {selectedAppointment.paymentStatus === "pending" && (
                  <button
                    onClick={() => updatePaymentStatus(selectedAppointment.id, "paid")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}

                {/* Appointment Status Actions */}
                {selectedAppointment.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
                    >
                      Confirm Appointment
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <IconTrash className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Delete Appointment</h3>
              <p className="text-gray-400">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setAppointmentToDelete(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete)}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}