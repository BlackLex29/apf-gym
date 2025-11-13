"use client";
import React, { useState } from "react";
import { ClientSidebar } from "@/components/ClientSideBar";
import Chatbot from "@/components/Chatbot";
import {
  IconCreditCard,
  IconCheck,
  IconX,
  IconUser,
  IconSchool,
  IconCalendar,
} from "@tabler/icons-react";

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [memberDetails, setMemberDetails] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    type: "regular" as "regular" | "student",
  });

  const membershipPlans = [
    {
      id: "regular",
      name: "Regular Membership",
      price: "₱1,000",
      originalPrice: "₱1,000",
      duration: "1 month",
      description: "Full access to gym facilities and equipment",
      features: [
        "Unlimited gym access",
        "All equipment usage",
        "Locker room access",
        "Shower facilities",
        "Basic fitness assessment"
      ],
      popular: false
    },
    {
      id: "student",
      name: "Student Membership",
      price: "₱800",
      originalPrice: "₱1,000",
      duration: "1 month",
      description: "Special discount for verified students",
      features: [
        "All regular membership benefits",
        "Valid student ID required",
        "Same access privileges",
        "Discount applied monthly",
        "School email verification"
      ],
      popular: true
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setMemberDetails(prev => ({
      ...prev,
      type: planId as "regular" | "student"
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmMembership = () => {
    // Here you would typically send the membership data to your backend
    const selectedPlanData = membershipPlans.find(plan => plan.id === selectedPlan);
    alert(`Membership application submitted!\n\nPlan: ${selectedPlanData?.name}\nPrice: ${selectedPlanData?.price}\nName: ${memberDetails.name}\nEmail: ${memberDetails.email}`);
    
    // Reset form
    setSelectedPlan(null);
    setMemberDetails({
      name: "",
      email: "",
      phone: "",
      studentId: "",
      type: "regular"
    });
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <ClientSidebar />
        
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-6 pt-16 lg:pt-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              {/* Header */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                  <IconCreditCard className="size-10 text-orange-400" />
                  Monthly Membership
                </h1>
                <p className="text-gray-400 text-lg">
                  Choose the membership plan that fits your needs
                </p>
              </div>

              {/* Membership Plans */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 transition-all cursor-pointer ${
                      selectedPlan === plan.id
                        ? plan.id === "student" 
                          ? "border-green-500 shadow-xl shadow-green-500/20"
                          : "border-orange-500 shadow-xl shadow-orange-500/20"
                        : "border-gray-700 hover:border-orange-500/50"
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Discount Badge for Student */}
                    {plan.id === "student" && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Save ₱200
                        </span>
                      </div>
                    )}

                    <div className="text-center space-y-6">
                      {/* Plan Header */}
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-gray-400">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold text-orange-400">
                            {plan.price}
                          </span>
                          {plan.id === "student" && (
                            <span className="text-lg text-gray-400 line-through">
                              {plan.originalPrice}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400">{plan.duration}</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <IconCheck className="size-5 text-green-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Select Button */}
                      <button
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          selectedPlan === plan.id
                            ? plan.id === "student"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-orange-500 hover:bg-orange-600"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Membership Form */}
              {selectedPlan && (
                <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <IconUser className="size-6 text-orange-400" />
                    Membership Application
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        value={memberDetails.name}
                        onChange={(e) => setMemberDetails({ ...memberDetails, name: e.target.value })}
                        className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        required
                        value={memberDetails.email}
                        onChange={(e) => setMemberDetails({ ...memberDetails, email: e.target.value })}
                        className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        required
                        value={memberDetails.phone}
                        onChange={(e) => setMemberDetails({ ...memberDetails, phone: e.target.value })}
                        className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      
                      {/* Student ID Field - Only show for student plan */}
                      {selectedPlan === "student" && (
                        <input
                          type="text"
                          placeholder="Student ID Number *"
                          required
                          value={memberDetails.studentId}
                          onChange={(e) => setMemberDetails({ ...memberDetails, studentId: e.target.value })}
                          className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      )}
                    </div>

                    {/* Selected Plan Summary */}
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {membershipPlans.find(p => p.id === selectedPlan)?.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {membershipPlans.find(p => p.id === selectedPlan)?.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-400">
                            {membershipPlans.find(p => p.id === selectedPlan)?.price}
                          </p>
                          {selectedPlan === "student" && (
                            <p className="text-sm text-gray-400 line-through">
                              {membershipPlans.find(p => p.id === selectedPlan)?.originalPrice}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-4 rounded-lg font-bold text-lg transition-all"
                    >
                      Apply for Membership
                    </button>
                  </form>
                </div>
              )}

              {/* Membership Benefits */}
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Membership Benefits
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <IconCalendar className="size-12 text-orange-400 mx-auto" />
                    <h3 className="font-bold text-lg">Flexible Access</h3>
                    <p className="text-gray-400 text-sm">
                      Open 5:00 AM to 10:00 PM daily. Come whenever it fits your schedule.
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <IconUser className="size-12 text-green-400 mx-auto" />
                    <h3 className="font-bold text-lg">Expert Guidance</h3>
                    <p className="text-gray-400 text-sm">
                      Get assistance from certified trainers and fitness experts.
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <IconCheck className="size-12 text-blue-400 mx-auto" />
                    <h3 className="font-bold text-lg">All Facilities</h3>
                    <p className="text-gray-400 text-sm">
                      Access to all gym equipment, locker rooms, and shower facilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <IconCheck className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Confirm Membership</h3>
              <p className="text-gray-400">
                Are you sure you want to apply for this membership?
              </p>
              
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-gray-400">Plan:</span> {membershipPlans.find(p => p.id === selectedPlan)?.name}</p>
                <p><span className="text-gray-400">Price:</span> {membershipPlans.find(p => p.id === selectedPlan)?.price}</p>
                <p><span className="text-gray-400">Name:</span> {memberDetails.name}</p>
                <p><span className="text-gray-400">Email:</span> {memberDetails.email}</p>
                {selectedPlan === "student" && (
                  <p><span className="text-gray-400">Student ID:</span> {memberDetails.studentId}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <IconX className="size-5" />
                  Cancel
                </button>
                <button
                  onClick={confirmMembership}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <IconCheck className="size-5" />
                  Confirm
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