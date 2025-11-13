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

const adminNavItems = [
  {
    title: "Home",
    url: "/a/dashboard",
    icon: IconHome,
    id: "dashboard",
  },
  {
    title: "User Management",
    url: "/a/usermanagement",
    icon: IconUsers,
    id: "users",
  },
  {
    title: "Bookings",
    url: "/a/booking",
    icon: IconCalendar,
    id: "bookings",
  },
  {
    title: "Analytics",
    url: "/a/analytic",
    icon: IconChartBar,
    id: "analytics",
  },
  {
    title: "Notifications",
    url: "/a/notification",
    icon: IconBell,
    id: "notifications",
  },
  {
    title: "Settings",
    url: "/a/settings",
    icon: IconSettings,
    id: "settings",
  },
];

export function Adminsidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Real-time listener for unread notifications count
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("type", "==", "inquiry"),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer"
              onClick={() => handleNavigation("/a/dashboard")}
            >
              <div className="flex items-center gap-2">
                <Dumbbell className="!size-5 text-orange-500" />
                <span className="text-base font-semibold">GymSchedPro</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* MAIN MENU */}
      <SidebarContent>
        <SidebarMenu>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.url;
            const showBadge = item.id === "notifications" && unreadCount > 0;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive
                      ? "bg-orange-500/20 border border-orange-500/50 text-orange-400 font-medium"
                      : "text-gray-300 hover:text-white"
                  }
                >
                  <div
                    onClick={() => handleNavigation(item.url)}
                    className="flex items-center gap-3 w-full cursor-pointer relative"
                  >
                    <item.icon className="!size-5" />
                    <span>{item.title}</span>

                    {/* Notification Badge */}
                    {showBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-gray-300 hover:text-white">
              <div
                onClick={() => handleNavigation("/a/profile")}
                className="flex items-center gap-3 w-full cursor-pointer"
              >
                <IconUser className="!size-5" />
                <span>Admin Profile</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-red-400 hover:text-red-300">
              <div
                onClick={() => handleNavigation("/login")}
                className="flex items-center gap-3 w-full cursor-pointer"
              >
                <IconLogout className="!size-5" />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
