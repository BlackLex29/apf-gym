// app/hooks/useUserRole.ts
"use client";

import { usePathname } from 'next/navigation';

export interface UserRole {
    role: 'admin' | 'client' | 'coach';
    userId?: string;
}

export function useUserRole(): UserRole {
    const pathname = usePathname();

    console.log('🔍 useUserRole - Current Path:', pathname);

    // Detect from URL path
    if (pathname.startsWith('/a/')) {
        console.log('🔍 useUserRole - Detected admin from path');
        return { role: 'admin' };
    } else if (pathname.startsWith('/c/')) {
        console.log('🔍 useUserRole - Detected client from path');
        return { role: 'client' };
    } else if (pathname.startsWith('/m/')) {
        console.log('🔍 useUserRole - Detected coach from path');
        return { role: 'coach' };
    } else {
        console.log('🔍 useUserRole - Using default admin role');
        return { role: 'admin' }; // default fallback
    }
}