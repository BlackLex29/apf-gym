"use client";
import React, { useState, useEffect } from "react";
import {
    IconUserPlus,
    IconSearch,
    IconFilter,
    IconCheck,
    IconX,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";

interface Coach {
    id: string;
    name: string;
    email: string;
    specialization: string;
    yearsExperience: number;
    status: "active" | "pending" | "inactive";
    createdAt: string;
    phone: string;
    achievements: string[];
    hourlyRate: number;
}

export default function CoachManagementPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showAddCoachModal, setShowAddCoachModal] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

    const mockCoaches: Coach[] = [
        {
            id: "1",
            name: "Alex Rodriguez",
            email: "alex@email.com",
            specialization: "Strength Training",
            yearsExperience: 8,
            status: "active",
            createdAt: "2024-01-01",
            phone: "+63 912 345 6789",
            achievements: ["Certified Personal Trainer", "2x Regional Powerlifting Champion"],
            hourlyRate: 500
        },
        {
            id: "2",
            name: "Sarah Chen",
            email: "sarah@email.com",
            specialization: "Yoga & Pilates",
            yearsExperience: 6,
            status: "active",
            createdAt: "2024-01-02",
            phone: "+63 912 345 6790",
            achievements: ["RYT 500 Certified", "Senior Yoga Instructor"],
            hourlyRate: 450
        },
        {
            id: "3",
            name: "Mike Johnson",
            email: "mike@email.com",
            specialization: "Boxing & MMA",
            yearsExperience: 10,
            status: "pending",
            createdAt: "2024-01-03",
            phone: "+63 912 345 6791",
            achievements: ["Professional Boxing Coach", "3x National Champion"],
            hourlyRate: 600
        },
        {
            id: "4",
            name: "Maria Santos",
            email: "maria@email.com",
            specialization: "Dance Fitness",
            yearsExperience: 5,
            status: "pending",
            createdAt: "2024-01-04",
            phone: "+63 912 345 6792",
            achievements: ["Zumba Instructor", "Dance Competition Judge"],
            hourlyRate: 400
        }
    ];

    useEffect(() => {
        setCoaches(mockCoaches);
    }, []);

    const filteredCoaches = coaches.filter(coach => {
        const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || coach.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Coach["status"]) => {
        switch (status) {
            case "active":
                return "bg-green-500/20 text-green-400";
            case "pending":
                return "bg-yellow-500/20 text-yellow-400";
            case "inactive":
                return "bg-red-500/20 text-red-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    const handleStatusUpdate = (id: string, newStatus: Coach["status"]) => {
        setCoaches(coaches.map(coach =>
            coach.id === id ? { ...coach, status: newStatus } : coach
        ));
    };

    const handleAddCoach = (newCoach: Omit<Coach, "id">) => {
        const coach: Coach = {
            ...newCoach,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
        };
        setCoaches([...coaches, coach]);
        setShowAddCoachModal(false);
    };

    const pendingCoachesCount = coaches.filter(coach => coach.status === "pending").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header - Centered */}
                    <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:text-left gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center justify-center lg:justify-start gap-3">
                                <IconUserPlus className="size-8 text-orange-400" />
                                Coach Management
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Manage coach accounts and applications
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddCoachModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <IconUserPlus className="size-5" />
                            Add New Coach
                        </button>
                    </div>

                    {/* Stats Cards - Centered */}
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
                            <p className="text-gray-400 text-sm">Pending Applications</p>
                            <p className="text-2xl font-bold text-yellow-400">{pendingCoachesCount}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                            <p className="text-gray-400 text-sm">Inactive Coaches</p>
                            <p className="text-2xl font-bold text-red-400">
                                {coaches.filter(c => c.status === "inactive").length}
                            </p>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                                <input
                                    type="text"
                                    placeholder="Search coaches by name, email, or specialization..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="relative">
                                <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Coaches Table - Centered */}
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-center p-4 font-semibold">Coach</th>
                                        <th className="text-center p-4 font-semibold">Specialization</th>
                                        <th className="text-center p-4 font-semibold">Experience</th>
                                        <th className="text-center p-4 font-semibold">Hourly Rate</th>
                                        <th className="text-center p-4 font-semibold">Status</th>
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
                                                    <p className="text-xs text-gray-500">{coach.phone}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-gray-300">{coach.specialization}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-gray-300">{coach.yearsExperience} years</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-green-400 font-semibold">₱{coach.hourlyRate}/hr</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(coach.status)}`}>
                                                    {coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {coach.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(coach.id, "active")}
                                                                className="p-2 bg-green-500 hover:bg-green-600 rounded text-white transition-colors"
                                                                title="Approve Coach"
                                                            >
                                                                <IconCheck className="size-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(coach.id, "inactive")}
                                                                className="p-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                                                                title="Reject Coach"
                                                            >
                                                                <IconX className="size-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedCoach(coach)}
                                                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
                                                        title="Edit Coach"
                                                    >
                                                        <IconEdit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCoaches(coaches.filter(c => c.id !== coach.id))}
                                                        className="p-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
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
                                    <IconUserPlus className="size-12 mx-auto mb-4 opacity-50" />
                                    <p>No coaches found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Coach Modal - Centered */}
            {showAddCoachModal && (
                <AddCoachModal
                    onClose={() => setShowAddCoachModal(false)}
                    onAddCoach={handleAddCoach}
                />
            )}
        </div>
    );
}

// Add Coach Modal Component - Centered
function AddCoachModal({ onClose, onAddCoach }: { onClose: () => void; onAddCoach: (coach: Omit<Coach, "id">) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        yearsExperience: 0,
        hourlyRate: 0,
        achievements: [""],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddCoach({
            ...formData,
            status: "active",
            createdAt: new Date().toISOString().split('T')[0],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center">Add New Coach</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="text"
                        placeholder="Specialization"
                        required
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        placeholder="Years of Experience"
                        required
                        value={formData.yearsExperience}
                        onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        placeholder="Hourly Rate (₱)"
                        required
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Add Coach
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}