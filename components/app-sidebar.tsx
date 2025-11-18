"use client";

import * as React from "react";
import {
    IconHome,
    IconUsers,
    IconCalendar,
    IconChartBar,
    IconBell,
    IconUser,
    IconSettings,
    IconLogout,
    IconCash,
    IconUserCog,
    IconMessageCircle,
    IconCreditCard,
    IconClock,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// Types
interface UserRole {
    role: 'admin' | 'client' | 'coach';
    userId?: string;
}

interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<any>;
    id: string;
    roles: ('admin' | 'client' | 'coach')[];
    badge?: number;
    badgeColor?: string;
}

interface Session {
    id: string;
    clientName: string;
    date: string;
    time: string;
    sessionType: string;
    status: "confirmed" | "pending" | "cancelled";
}

// Navigation data structure
const getNavData = (userRole: UserRole, unreadCount: number, pendingPaymentsCount: number) => {
    const baseData = {
        user: {
            name: "User",
            email: "user@example.com",
            avatar: "/avatars/user.jpg",
        },
        navMain: [] as NavItem[],
        navSecondary: [
            {
                title: "Settings",
                url: userRole.role === 'admin' ? '/a/settings' :
                    userRole.role === 'client' ? '/c/setting' : '/m/settings',
                icon: IconSettings,
            },
        ],
    };

    // Role-specific navigation items
    const roleNavItems: NavItem[] = [
        // Admin items
        {
            title: "Dashboard",
            url: "/a/dashboard",
            icon: IconHome,
            id: "dashboard",
            roles: ['admin']
        },
        {
            title: "User Management",
            url: "/a/usermanagement",
            icon: IconUsers,
            id: "users",
            roles: ['admin']
        },
        {
            title: "Bookings",
            url: "/a/booking",
            icon: IconCalendar,
            id: "bookings",
            roles: ['admin']
        },
        {
            title: "Payment Confirmation",
            url: "/a/paymentconfirmation",
            icon: IconCash,
            id: "payments",
            roles: ['admin']
        },
        {
            title: "Analytics",
            url: "/a/analytic",
            icon: IconChartBar,
            id: "analytics",
            roles: ['admin']
        },
        {
            title: "Account Management",
            url: "/a/accountmanagement",
            icon: IconUserCog,
            id: "accountmanagement",
            roles: ['admin']
        },
        {
            title: "Notifications",
            url: "/a/notification",
            icon: IconBell,
            id: "notifications",
            roles: ['admin']
        },

        // Client items
        {
            title: "Dashboard",
            url: "/c/dashboard",
            icon: IconHome,
            id: "client-dashboard",
            roles: ['client']
        },
        {
            title: "Inquire",
            url: "/c/inquire",
            icon: IconMessageCircle,
            id: "inquire",
            roles: ['client']
        },
        {
            title: "Book Appointment",
            url: "/c/bookappointment",
            icon: IconCalendar,
            id: "book",
            roles: ['client']
        },
        {
            title: "Monthly Membership",
            url: "/c/membership",
            icon: IconCreditCard,
            id: "membership",
            roles: ['client']
        },

        // Coach items
        {
            title: "Dashboard",
            url: "/m/dashboard",
            icon: IconHome,
            id: "coach-dashboard",
            roles: ['coach']
        },
        {
            title: "Coach Appointment",
            url: "/m/appointments",
            icon: IconCalendar,
            id: "appointments",
            roles: ['coach']
        },
    ];

    // Filter items by role and add badges
    baseData.navMain = roleNavItems
        .filter(item => item.roles.includes(userRole.role))
        .map(item => {
            const showNotificationBadge = userRole.role === 'admin' && item.id === "notifications" && unreadCount > 0;
            const showPaymentBadge = userRole.role === 'admin' && item.id === "payments" && pendingPaymentsCount > 0;

            return {
                ...item,
                badge: showNotificationBadge ? unreadCount : showPaymentBadge ? pendingPaymentsCount : undefined,
                badgeColor: showNotificationBadge ? "red" : showPaymentBadge ? "yellow" : undefined,
            };
        });

    return baseData;
};

// Navigation Components
interface NavMainProps {
    items: NavItem[];
    onNavigate: (url: string) => void;
    currentPath: string;
}

function NavMain({ items, onNavigate, currentPath }: NavMainProps) {
    return (
        <SidebarMenu>
            {items.map((item) => {
                const isActive = currentPath === item.url;

                return (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                            asChild
                            className={isActive
                                ? "bg-orange-500/20 border border-orange-500/50 text-orange-400 font-semibold"
                                : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                            }
                        >
                            <div
                                onClick={() => onNavigate(item.url)}
                                className="flex items-center gap-3 w-full cursor-pointer relative pl-3 py-2"
                            >
                                <item.icon className="size-5 flex-shrink-0" />
                                <span className="flex-1 text-sm">{item.title}</span>

                                {/* Badges */}
                                {item.badge && item.badge > 0 && (
                                    <span className={`${item.badgeColor === 'red' ? 'bg-red-500 text-white' :
                                        item.badgeColor === 'yellow' ? 'bg-yellow-500 text-black' :
                                            'bg-gray-500 text-white'
                                        } text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse`}>
                                        {item.badge > 99 ? "99+" : item.badge}
                                    </span>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

interface UpcomingSessionsProps {
    sessions: Session[];
    onNavigate: (url: string) => void;
}

function UpcomingSessions({ sessions, onNavigate }: UpcomingSessionsProps) {
    const getStatusIcon = (status: Session["status"]) => {
        switch (status) {
            case "confirmed":
                return <IconCheck className="size-3 text-green-500" />;
            case "pending":
                return <IconClock className="size-3 text-yellow-500" />;
            case "cancelled":
                return <IconX className="size-3 text-red-500" />;
            default:
                return <IconClock className="size-3 text-gray-500" />;
        }
    };

    const getStatusColor = (status: Session["status"]) => {
        switch (status) {
            case "confirmed":
                return "text-green-400";
            case "pending":
                return "text-yellow-400";
            case "cancelled":
                return "text-red-400";
            default:
                return "text-gray-400";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (sessions.length === 0) return null;

    return (
        <div className="px-4 py-2 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <IconCalendar className="size-4 text-orange-400" />
                <span className="text-sm font-semibold text-gray-300">Upcoming Sessions</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-orange-500/50 transition-colors cursor-pointer"
                        onClick={() => onNavigate("/m/appointments")}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-white truncate">
                                {session.clientName}
                            </span>
                            <div className="flex items-center gap-1">
                                {getStatusIcon(session.status)}
                                <span className={`text-xs ${getStatusColor(session.status)}`}>
                                    {session.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                            {formatDate(session.date)} • {session.time}
                        </div>
                        <div className="text-xs text-orange-400 font-medium truncate">
                            {session.sessionType}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => onNavigate("/m/appointments")}
                className="w-full mt-2 text-xs text-orange-400 hover:text-orange-300 text-center font-medium"
            >
                View All Sessions
            </button>
        </div>
    );
}

interface NavUserProps {
    onProfileClick: () => void;
    onLogoutClick: () => void;
}

function NavUser({ onProfileClick, onLogoutClick }: NavUserProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-300 hover:text-white">
                    <div
                        onClick={onProfileClick}
                        className="flex items-center gap-3 w-full cursor-pointer pl-3 py-2"
                    >
                        <IconUser className="size-5 flex-shrink-0" />
                        <span>My Profile</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <div
                        onClick={onLogoutClick}
                        className="flex items-center gap-3 w-full cursor-pointer pl-3 py-2"
                    >
                        <IconLogout className="size-5 flex-shrink-0" />
                        <span>Logout</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

// Main AppSidebar Component
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    userRole?: UserRole;
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

    // Default to admin if no role provided
    const effectiveUserRole = userRole || { role: 'admin' as const };
    const navData = getNavData(effectiveUserRole, unreadCount, pendingPaymentsCount);

    // Real-time data effects
    useEffect(() => {
        if (effectiveUserRole.role === 'admin') {
            const notificationsRef = collection(db, "notifications");
            const notificationsQuery = query(
                notificationsRef,
                where("type", "==", "inquiry"),
                where("read", "==", false),
                orderBy("createdAt", "desc")
            );

            const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
                setUnreadCount(snapshot.size);
            });

            const appointmentsRef = collection(db, "appointments");
            const paymentsQuery = query(
                appointmentsRef,
                where("paymentStatus", "==", "pending"),
                where("status", "in", ["pending", "confirmed"])
            );

            const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
                setPendingPaymentsCount(snapshot.size);
            });

            return () => {
                unsubscribeNotifications();
                unsubscribePayments();
            };
        }

        if (effectiveUserRole.role === 'coach' && effectiveUserRole.userId) {
            const sessionsRef = collection(db, "appointments");
            const sessionsQuery = query(
                sessionsRef,
                where("coachId", "==", effectiveUserRole.userId),
                where("status", "in", ["confirmed", "pending"]),
                orderBy("date", "asc"),
                orderBy("time", "asc")
            );

            const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
                const sessions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Session[];
                setUpcomingSessions(sessions);
            });

            return () => unsubscribeSessions();
        }
    }, [effectiveUserRole.role, effectiveUserRole.userId]);

    const handleNavigation = (url: string) => {
        router.push(url);
    };

    const getProfileUrl = () => {
        switch (effectiveUserRole.role) {
            case 'admin': return '/a/profile';
            case 'client': return '/c/profile';
            case 'coach': return '/m/profile';
            default: return '/profile';
        }
    };

    const getDashboardUrl = () => {
        switch (effectiveUserRole.role) {
            case 'admin': return '/a/dashboard';
            case 'client': return '/c/dashboard';
            case 'coach': return '/m/dashboard';
            default: return '/dashboard';
        }
    };

    // Filter upcoming sessions for coach
    const today = new Date().toISOString().split('T')[0];
    const filteredSessions = upcomingSessions
        .filter(session => session.date >= today && session.status !== "cancelled")
        .slice(0, 3);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="cursor-pointer"
                        >
                            <div
                                onClick={() => handleNavigation(getDashboardUrl())}
                                className="flex items-center gap-3 pl-3"
                            >
                                <Dumbbell className="size-6 text-orange-500 flex-shrink-0" />
                                <span className="text-lg font-bold tracking-tight">GymSchedPro</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Upcoming Sessions Section for Coach */}
                {effectiveUserRole.role === 'coach' && (
                    <UpcomingSessions
                        sessions={filteredSessions}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* Main Navigation */}
                <NavMain
                    items={navData.navMain}
                    onNavigate={handleNavigation}
                    currentPath={pathname}
                />

                {/* Secondary Navigation */}
                {navData.navSecondary.length > 0 && (
                    <SidebarMenu className="mt-auto">
                        {navData.navSecondary.map((item) => {
                            const isActive = pathname === item.url;
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={isActive
                                            ? "bg-orange-500/20 border border-orange-500/50 text-orange-400 font-semibold"
                                            : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                                        }
                                    >
                                        <div
                                            onClick={() => handleNavigation(item.url)}
                                            className="flex items-center gap-3 w-full cursor-pointer pl-3 py-2"
                                        >
                                            <item.icon className="size-5 flex-shrink-0" />
                                            <span className="text-sm">{item.title}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                )}
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <NavUser
                    onProfileClick={() => handleNavigation(getProfileUrl())}
                    onLogoutClick={() => handleNavigation("/login")}
                />
            </SidebarFooter>
        </Sidebar>
    );
}