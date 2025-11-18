// hooks/useAuth.ts
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    userRole: 'admin' | 'client' | 'coach' | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'client' | 'coach' | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get user role from Firestore
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser(user);
                        setUserRole(userData.role as 'admin' | 'client' | 'coach');
                    } else {
                        // If user document doesn't exist, create one with default role
                        console.log('User document not found, setting default role');
                        setUser(user);
                        setUserRole('client'); // Default role
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUser(user);
                    setUserRole('client'); // Fallback role
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};