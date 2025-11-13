"use client";

import * as React from "react";
import {
  IconHome,
  IconMessageCircle,
  IconCalendar,
  IconCreditCard,
  IconUser,
  IconLogout,
  IconSettings,
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

const clientNavItems = [
  {
    title: "Dashboard",
    url: "/c/dashboard",
    icon: IconHome,
    id: "dashboard",
  },
  {
    title: "Inquire",
    url: "/c/inquire",
    icon: IconMessageCircle,
    id: "inquire",
  },
  {
    title: "Book Appointment",
    url: "/c/bookappointment",
    icon: IconCalendar,
    id: "book",
  },
  {
    title: "Monthly Membership",
    url: "/c/membership",
    icon: IconCreditCard,
    id: "membership",
  },
   {
    title: "Settings",
    url: "/c/setting",
    icon: IconSettings,
    id: "settings",
  },
  
];

export function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <Sidebar collapsible="offcanvas">
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer"
              onClick={() => handleNavigation("/c/dashboard")}
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
          {clientNavItems.map((item) => {
            const isActive = pathname === item.url;

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
                    className="flex items-center gap-3 w-full cursor-pointer"
                  >
                    <item.icon className="!size-5" />
                    <span>{item.title}</span>
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
            <SidebarMenuButton
              asChild
              className="text-gray-300 hover:text-white"
            >
              <div
                onClick={() => handleNavigation("/c/profile")}
                className="flex items-center gap-3 w-full cursor-pointer"
              >
                <IconUser className="!size-5" />
                <span>My Profile</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-red-400 hover:text-red-300"
            >
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