"use client";

import React, { useState, useEffect } from "react";
import {
  IconCash,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconClock,
  IconUser,
  IconCalendar,
  IconActivity,
  IconUsers,
} from "@tabler/icons-react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

interface Payment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  serviceName: string;
  date: string;
  time: string;
  coach?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: "pending" | "confirmed" | "rejected";
  paymentAmount: string;
  paymentProof?: string;
  createdAt: Date;
  appointmentId: string;
}

export default function PaymentConfirmationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("paymentStatus", "in", ["pending", "confirmed", "rejected"]),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const paymentsData: Payment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        paymentsData.push({
          id: doc.id,
          clientName: data.clientName || "Unknown Client",
          clientEmail: data.clientEmail || "No Email",
          clientPhone: data.clientPhone || "No Phone",
          serviceType: data.serviceType || "unknown",
          serviceName: data.serviceName || "Unknown Service",
          date: data.date || "Unknown Date",
          time: data.time || "Unknown Time",
          coach: data.coach,
          status: data.status || "pending",
          paymentMethod: data.paymentMethod || "GCash",
          paymentStatus: data.paymentStatus || "pending",
          paymentAmount: data.paymentAmount || "₱0",
          paymentProof: data.paymentProof,
          createdAt: data.createdAt?.toDate() || new Date(),
          appointmentId: doc.id,
        } as Payment);
      });

      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);
      const paymentRef = doc(db, "appointments", paymentId);

      await updateDoc(paymentRef, {
        paymentStatus: "confirmed",
        status: "confirmed",
        updatedAt: new Date()
      });

      // Refresh the list
      await loadPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);
      const paymentRef = doc(db, "appointments", paymentId);

      await updateDoc(paymentRef, {
        paymentStatus: "rejected",
        status: "cancelled",
        updatedAt: new Date()
      });

      // Refresh the list
      await loadPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Failed to reject payment. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || payment.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "confirmed":
        return "Confirmed";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getServiceColor = (serviceType: string) => {
    return serviceType === "gym"
      ? "bg-orange-500/20 text-orange-400"
      : "bg-green-500/20 text-green-400";
  };

  const getServiceLabel = (serviceType: string) => {
    return serviceType === "gym" ? "Gym Session" : "Studio Class";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusCount = (status: Payment["paymentStatus"]) => {
    return payments.filter(payment => payment.paymentStatus === status).length;
  };


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="flex-1 lg:ml-64 flex flex-col p-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header - Centered */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <IconCash className="size-8 text-orange-400" />
              Payment Confirmation
            </h1>
            <p className="text-gray-400 mt-2">
              Review and confirm customer payments
            </p>
          </div>

          {/* Stats Cards - Centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 w-full max-w-xs text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-yellow-500/20 rounded-lg mb-4">
                  <IconClock className="size-6 text-yellow-400" />
                </div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-400 my-2">
                  {getStatusCount("pending")}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 w-full max-w-xs text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-green-500/20 rounded-lg mb-4">
                  <IconCheck className="size-6 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-green-400 my-2">
                  {getStatusCount("confirmed")}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 w-full max-w-xs text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-red-500/20 rounded-lg mb-4">
                  <IconX className="size-6 text-red-400" />
                </div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400 my-2">
                  {getStatusCount("rejected")}
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
              <div className="relative w-full max-w-md">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="text"
                  placeholder="Search clients or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                />
              </div>

              <div className="relative w-full max-w-md">
                <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-center"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 font-semibold text-center">Client</th>
                    <th className="py-4 font-semibold text-center">Service</th>
                    <th className="py-4 font-semibold text-center">Date & Time</th>
                    <th className="py-4 font-semibold text-center">Amount</th>
                    <th className="py-4 font-semibold text-center">Payment Status</th>
                    <th className="py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20"
                    >
                      <td className="py-4">
                        <div className="text-center">
                          <p className="font-semibold">{payment.clientName}</p>
                          <p className="text-sm text-gray-400">{payment.clientEmail}</p>
                          <p className="text-xs text-gray-500">{payment.clientPhone}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getServiceColor(payment.serviceType)}`}>
                            {getServiceLabel(payment.serviceType)}
                          </span>
                          <p className="text-sm text-gray-400 mt-1">{payment.serviceName}</p>
                          {payment.coach && (
                            <p className="text-xs text-blue-400">Coach: {payment.coach}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-center">
                          <p className="text-sm">{formatDate(payment.date)}</p>
                          <p className="text-xs text-gray-400">{payment.time}</p>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <p className="font-semibold text-orange-400 text-lg">{payment.paymentAmount}</p>
                        <p className="text-xs text-gray-400">{payment.paymentMethod}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor(payment.paymentStatus)}`}>
                          {getStatusLabel(payment.paymentStatus)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          {payment.paymentStatus === "pending" && (
                            <>
                              <button
                                onClick={() => confirmPayment(payment.id)}
                                disabled={actionLoading === payment.id}
                                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                                title="Confirm Payment"
                              >
                                <IconCheck className="size-4 text-white" />
                              </button>
                              <button
                                onClick={() => rejectPayment(payment.id)}
                                disabled={actionLoading === payment.id}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject Payment"
                              >
                                <IconX className="size-4 text-white" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <IconUser className="size-4 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <IconCash className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-center flex-1">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <IconX className="size-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
                    <IconUser className="size-5 text-orange-400" />
                    Client Information
                  </h3>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-300">{selectedPayment.clientName}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <p className="text-gray-300">{selectedPayment.clientEmail}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-300">{selectedPayment.clientPhone}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
                    <IconCash className="size-5 text-orange-400" />
                    Payment Details
                  </h3>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Amount
                    </label>
                    <p className="text-2xl font-bold text-orange-400">{selectedPayment.paymentAmount}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Method
                    </label>
                    <p className="text-gray-300">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-block ${getStatusColor(selectedPayment.paymentStatus)}`}>
                      {getStatusLabel(selectedPayment.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
                  <IconCalendar className="size-5 text-orange-400" />
                  Service Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Service Type
                    </label>
                    <p className="text-gray-300">{getServiceLabel(selectedPayment.serviceType)}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Service Name
                    </label>
                    <p className="text-gray-300">{selectedPayment.serviceName}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <p className="text-gray-300">{formatDate(selectedPayment.date)}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Time
                    </label>
                    <p className="text-gray-300">{selectedPayment.time}</p>
                  </div>
                </div>
                {selectedPayment.coach && (
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Assigned Coach
                    </label>
                    <p className="text-gray-300">{selectedPayment.coach}</p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              {selectedPayment.paymentProof && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
                    <IconCash className="size-5 text-orange-400" />
                    Payment Proof
                  </h3>
                  <div className="text-center">
                    <img
                      src={selectedPayment.paymentProof}
                      alt="Payment Proof"
                      className="max-w-full h-auto max-h-64 mx-auto rounded-lg border border-gray-600"
                    />
                    <a
                      href={selectedPayment.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                    >
                      View Full Image
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedPayment.paymentStatus === "pending" && (
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => confirmPayment(selectedPayment.id)}
                    disabled={actionLoading === selectedPayment.id}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <IconCheck className="size-5" />
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => rejectPayment(selectedPayment.id)}
                    disabled={actionLoading === selectedPayment.id}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <IconX className="size-5" />
                    Reject Payment
                  </button>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}