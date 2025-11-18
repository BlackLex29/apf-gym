"use client";
import React, { useState, useEffect } from "react";
import {
  IconUsers,
  IconUserPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFilter,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: "gym" | "karate" | "boxing" | "zumba";
  experience: string;
  status: "active" | "inactive";
  dateCreated: string;
}

export default function UserManagementPage() {
  const [coaches, setCoaches] = useState<Coach[]>([
    {
      id: "1",
      name: "Coach Luis",
      email: "marquez.luismanuel08@gmail.com",
      phone: "09496208191",
      specialty: "boxing",
      experience: "10 years",
      status: "inactive",
      dateCreated: "2025-11-15"
    },
    {
      id: "2",
      name: "Gene",
      email: "genedalida@gmail.com",
      phone: "09736364233",
      specialty: "gym",
      experience: "5 years",
      status: "active",
      dateCreated: "2025-11-13"
    },
    {
      id: "3",
      name: "Rafa Pogi",
      email: "rafaellevist0513@gmail.com",
      phone: "09920370749",
      specialty: "gym",
      experience: "5 years",
      status: "active",
      dateCreated: "2025-11-14"
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(false);

  const [coachForm, setCoachForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "gym" as "gym" | "karate" | "boxing" | "zumba",
    experience: "",
    status: "active" as "active" | "inactive"
  });

  const specialties = [
    { value: "gym", label: "Gym Training", color: "text-orange-400" },
    { value: "karate", label: "Karate", color: "text-blue-400" },
    { value: "boxing", label: "Boxing", color: "text-red-400" },
    { value: "zumba", label: "Zumba", color: "text-pink-400" }
  ];

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCoach: Coach = {
      id: Date.now().toString(),
      name: coachForm.name,
      email: coachForm.email,
      phone: coachForm.phone,
      specialty: coachForm.specialty,
      experience: coachForm.experience,
      status: coachForm.status,
      dateCreated: new Date().toISOString().split('T')[0]
    };

    setCoaches([...coaches, newCoach]);
    setCoachForm({
      name: "",
      email: "",
      phone: "",
      specialty: "gym",
      experience: "",
      status: "active"
    });
    setShowAddForm(false);
    alert("Coach added successfully!");
  };

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setCoachForm({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialty: coach.specialty,
      experience: coach.experience,
      status: coach.status
    });
  };

  const handleUpdateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCoach) {
      const updatedCoaches = coaches.map(coach =>
        coach.id === editingCoach.id 
          ? { 
              ...coach, 
              name: coachForm.name,
              email: coachForm.email,
              phone: coachForm.phone,
              specialty: coachForm.specialty,
              experience: coachForm.experience,
              status: coachForm.status
            }
          : coach
      );
      
      setCoaches(updatedCoaches);
      setEditingCoach(null);
      setCoachForm({
        name: "",
        email: "",
        phone: "",
        specialty: "gym",
        experience: "",
        status: "active"
      });
      
      alert("Coach updated successfully!");
    }
  };

  const handleDeleteCoach = async (id: string) => {
    if (confirm("Are you sure you want to delete this coach?")) {
      setCoaches(coaches.filter(coach => coach.id !== id));
      alert("Coach deleted successfully!");
    }
  };

  const handleStatusToggle = async (id: string) => {
    const coach = coaches.find(c => c.id === id);
    if (!coach) return;

    const newStatus = coach.status === "active" ? "inactive" : "active";
    
    setCoaches(coaches.map(coach =>
      coach.id === id
        ? { ...coach, status: newStatus }
        : coach
    ));
    
    alert(`Coach status updated to ${newStatus}`);
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || coach.specialty === filterSpecialty;
    const matchesStatus = filterStatus === "all" || coach.status === filterStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const getSpecialtyColor = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.color || "text-gray-400";
  };

  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading coaches...</p>
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
                  <IconUsers className="size-8 text-orange-400" />
                  Coach Management
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage gym, karate, boxing, and zumba coaches
                </p>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <IconUserPlus className="size-5" />
                Add New Coach
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <input
                    type="text"
                    placeholder="Search coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Specialty Filter */}
                <div className="relative">
                  <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="all">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </option>
                    ))}
                  </select>
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coaches Table */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-center p-4 font-semibold">Coach</th>
                      <th className="text-center p-4 font-semibold">Specialty</th>
                      <th className="text-center p-4 font-semibold">Experience</th>
                      <th className="text-center p-4 font-semibold">Contact</th>
                      <th className="text-center p-4 font-semibold">Status</th>
                      <th className="text-center p-4 font-semibold">Date Created</th>
                      <th className="text-center p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoaches.map((coach) => (
                      <tr key={coach.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="p-4">
                          <div className="text-center">
                            <p className="font-semibold">{coach.name}</p>
                            <p className="text-sm text-gray-400">{coach.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSpecialtyColor(coach.specialty)} bg-gray-700/50 inline-block`}>
                            {getSpecialtyLabel(coach.specialty)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-gray-300">{coach.experience}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-gray-300">{coach.phone}</span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleStatusToggle(coach.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              coach.status === "active"
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            }`}
                          >
                            {coach.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-gray-400 text-sm">{coach.dateCreated}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditCoach(coach)}
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="Edit Coach"
                            >
                              <IconEdit className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoach(coach.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Delete Coach"
                            >
                              <IconTrash className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredCoaches.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <IconUsers className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No coaches found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats - Centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Total Coaches</p>
                <p className="text-2xl font-bold text-white">{coaches.length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Active Coaches</p>
                <p className="text-2xl font-bold text-green-400">
                  {coaches.filter(c => c.status === "active").length}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Gym Coaches</p>
                <p className="text-2xl font-bold text-orange-400">
                  {coaches.filter(c => c.specialty === "gym").length}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">Class Coaches</p>
                <p className="text-2xl font-bold text-blue-400">
                  {coaches.filter(c => c.specialty !== "gym").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Coach Modal */}
      {(showAddForm || editingCoach) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">
                {editingCoach ? "Edit Coach" : "Add New Coach"}
              </h2>

              <form onSubmit={editingCoach ? handleUpdateCoach : handleAddCoach}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.name}
                      onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                      placeholder="Enter coach's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={coachForm.email}
                      onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={coachForm.phone}
                      onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Specialty *
                    </label>
                    <select
                      required
                      value={coachForm.specialty}
                      onChange={(e) => setCoachForm({ ...coachForm, specialty: e.target.value as any })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Experience *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.experience}
                      onChange={(e) => setCoachForm({ ...coachForm, experience: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                      placeholder="e.g., 5 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                      Status
                    </label>
                    <select
                      value={coachForm.status}
                      onChange={(e) => setCoachForm({ ...coachForm, status: e.target.value as any })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCoach(null);
                      setCoachForm({
                        name: "",
                        email: "",
                        phone: "",
                        specialty: "gym",
                        experience: "",
                        status: "active"
                      });
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <IconX className="size-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <IconCheck className="size-5" />
                    {editingCoach ? "Update Coach" : "Add Coach"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}