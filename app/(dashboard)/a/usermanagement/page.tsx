"use client";
import React, { useState, useEffect } from "react";
import {
  IconUsers,
  IconUserPlus,
  IconTrash,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import { db, auth } from "@/lib/firebaseConfig";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot 
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: "gym" | "karate" | "boxing" | "zumba";
  experience: string;
  status: "active" | "inactive";
  dateCreated: string;
  authUid: string;
}

export default function CoachManagementPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [coachForm, setCoachForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "gym" as "gym" | "karate" | "boxing" | "zumba",
    experience: "",
    status: "active" as "active" | "inactive",
    password: "",
  });

  const specialties = [
    { value: "gym", label: "Gym Training", color: "text-orange-400" },
    { value: "karate", label: "Karate", color: "text-blue-400" },
    { value: "boxing", label: "Boxing", color: "text-red-400" },
    { value: "zumba", label: "Zumba", color: "text-pink-400" }
  ];

  // Fetch coaches from Firestore
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesRef = collection(db, "users");
        const q = query(coachesRef, where("role", "==", "coach"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const coachesData: Coach[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            coachesData.push({
              id: doc.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              specialty: data.specialty,
              experience: data.experience,
              status: data.status,
              dateCreated: data.createdAt,
              authUid: data.authUid
            });
          });
          setCoaches(coachesData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchCoaches();
  }, []);

  // Simple function to add coach to both Auth and Firestore
  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        coachForm.email, 
        coachForm.password
      );
      
      const authUid = userCredential.user.uid;

      // 2. Add to Firestore users collection
      const userData = {
        name: coachForm.name,
        email: coachForm.email,
        phone: coachForm.phone,
        specialty: coachForm.specialty,
        experience: coachForm.experience,
        status: coachForm.status,
        role: "coach",
        authUid: authUid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "users"), userData);

      // Success
      setSuccessMessage("✅ Coach added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Reset form
      setCoachForm({
        name: "",
        email: "",
        phone: "",
        specialty: "gym",
        experience: "",
        status: "active",
        password: "",
      });
      setShowAddForm(false);

    } catch (error: unknown) {
      console.error('Error adding coach:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoach = async (id: string) => {
    if (confirm("Are you sure you want to delete this coach?")) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "users", id));
        
        setSuccessMessage("Coach deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error('Error deleting coach:', error);
        alert("Error deleting coach");
      }
    }
  };

  const handleStatusToggle = async (coach: Coach) => {
    try {
      const newStatus = coach.status === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "users", coach.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setSuccessMessage(`Coach status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      alert("Error updating status");
    }
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Main Content - Full width since sidebar is removed */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <IconUsers className="size-8 text-orange-400" />
                Coach Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage gym coaches and their accounts
              </p>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <IconUserPlus className="size-5" />
              Add New Coach
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="relative">
                <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <th className="text-left p-4 font-semibold">Coach</th>
                    <th className="text-left p-4 font-semibold">Specialty</th>
                    <th className="text-left p-4 font-semibold">Experience</th>
                    <th className="text-left p-4 font-semibold">Contact</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((coach) => (
                    <tr key={coach.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{coach.name}</p>
                          <p className="text-sm text-gray-400">{coach.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSpecialtyColor(coach.specialty)} bg-gray-700/50`}>
                          {getSpecialtyLabel(coach.specialty)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{coach.experience}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{coach.phone}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleStatusToggle(coach)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            coach.status === "active"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                        >
                          {coach.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
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
                  <p>No coaches found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Add Coach Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Add New Coach</h2>

              <form onSubmit={handleAddCoach}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.name}
                      onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter coach's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={coachForm.email}
                      onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={coachForm.phone}
                      onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Specialty *
                    </label>
                    <select
                      required
                      value={coachForm.specialty}
                      onChange={(e) => setCoachForm({ ...coachForm, specialty: e.target.value as "gym" | "karate" | "boxing" | "zumba" })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Experience *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.experience}
                      onChange={(e) => setCoachForm({ ...coachForm, experience: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 5 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={coachForm.password}
                      onChange={(e) => setCoachForm({ ...coachForm, password: e.target.value })}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter password (min. 6 characters)"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Coach"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}