"use client"

import * as React from "react"
import {
    IconHome,
    IconUsers,
    IconCalendar,
    IconChartBar,
    IconBell,
    IconFileText,
    IconUser,
    IconSettings,
} from "@tabler/icons-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { DumbbellIcon } from "lucide-react"

const adminNavItems = [
    {
        title: "Home",
        url: "/a/dashboard",
        icon: IconHome,
    },
    {
        title: "User Management",
        url: "/a/users",
        icon: IconUsers,
    },
    {
        title: "Bookings",
        url: "/a/bookings",
        icon: IconCalendar,
    },
    {
        title: "Analytics",
        url: "/a/analytics",
        icon: IconChartBar,
    },
    {
        title: "Notifications",
        url: "/a/notifications",
        icon: IconBell,
    },
    {
        title: "Rules & Policies",
        url: "/a/rules",
        icon: IconFileText,
    },
    {
        title: "Settings",
        url: "/a/settings",
        icon: IconSettings,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/a/dashboard">
                                <DumbbellIcon className="!size-5 text-orange-500" />
                                <span className="text-base font-semibold">GymSchedPro</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {adminNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon className="!size-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {/* You can add user profile or logout button here */}
            </SidebarFooter>
        </Sidebar>
    )
}