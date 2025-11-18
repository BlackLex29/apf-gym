"use client";

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        // Add role-based route protection
        if (!loading && user && userRole) {
            const currentPath = window.location.pathname;

            // Check if user is accessing admin routes without admin role
            if (currentPath.startsWith('/a/') && userRole !== 'admin') {
                router.push('/c/dashboard'); // or appropriate dashboard
            }

            // Check if user is accessing client routes without client role
            if (currentPath.startsWith('/c/') && userRole !== 'client') {
                router.push(userRole === 'admin' ? '/a/dashboard' : '/m/dashboard');
            }

            // Check if user is accessing coach routes without coach role
            if (currentPath.startsWith('/m/') && userRole !== 'coach') {
                router.push(userRole === 'admin' ? '/a/dashboard' : '/c/dashboard');
            }
        }
    }, [user, userRole, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar
                variant="inset"
                userRole={{
                    role: userRole as 'admin' | 'client' | 'coach',
                    userId: user?.uid
                }}
            />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}