import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { UserProfile } from "../services/coupleService";
import { registerForPushNotificationsAsync } from "../services/notificationService";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    profile: UserProfile | null;
    coupleId: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    profile: null,
    coupleId: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [coupleId, setCoupleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
                setProfile(null);
                setCoupleId(null);
                setLoading(false);
            }
        });

        return unsubscribeAuth;
    }, []);

    // Listen to user profile in real-time to get coupleId
    useEffect(() => {
        if (!user) return;

        const unsubscribeProfile = onSnapshot(
            doc(db, 'users', user.uid),
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as UserProfile;
                    setProfile(data);
                    setCoupleId(data.coupleId || null);
                } else {
                    setProfile(null);
                    setCoupleId(null);
                }
                setLoading(false);

                // Register for push notifications if we have a user
                if (snapshot.exists()) {
                    registerForPushNotificationsAsync(user.uid);
                }
            },
            (error) => {
                console.error('Error listening to profile:', error);
                setLoading(false);
            }
        );

        return unsubscribeProfile;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, profile, coupleId }}>
            {children}
        </AuthContext.Provider>
    );
};
