import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { UserProfile } from "../services/coupleService";
import { registerForPushNotificationsAsync } from "../services/notificationService";
import { getUserSpaces, UserSpaceRecord } from "../services/spaceService";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    profile: UserProfile | null;
    coupleId: string | null; // Maintained for legacy backward compatibility during transition
    activeSpaceId: string | null;
    spaces: UserSpaceRecord[];
    setActiveSpace: (spaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    profile: null,
    coupleId: null,
    activeSpaceId: null,
    spaces: [],
    setActiveSpace: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [coupleId, setCoupleId] = useState<string | null>(null);
    const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
    const [spaces, setSpaces] = useState<UserSpaceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const setActiveSpace = async (spaceId: string) => {
        setActiveSpaceId(spaceId);
        setCoupleId(spaceId); // Legacy fallback
        await AsyncStorage.setItem('@active_space_id', spaceId);
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
                setProfile(null);
                setCoupleId(null);
                setActiveSpaceId(null);
                setSpaces([]);
                setLoading(false);
            }
        });

        return unsubscribeAuth;
    }, []);

    // Listen to user profile in real-time
    useEffect(() => {
        if (!user) return;

        const unsubscribeProfile = onSnapshot(
            doc(db, 'users', user.uid),
            async (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as UserProfile;
                    setProfile(data);

                    // Fetch all spaces the user belongs to
                    const userSpaces = await getUserSpaces(user.uid);
                    setSpaces(userSpaces);

                    // Determine active space (persisted > legacy > first space)
                    const persistedSpaceId = await AsyncStorage.getItem('@active_space_id');
                    let newActiveSpaceId = null;

                    if (userSpaces.some(s => s.id === persistedSpaceId)) {
                        newActiveSpaceId = persistedSpaceId;
                    } else if (data.coupleId) {
                        newActiveSpaceId = data.coupleId;
                    } else if (userSpaces.length > 0) {
                        newActiveSpaceId = userSpaces[0].id;
                    }

                    if (newActiveSpaceId) {
                        setActiveSpaceId(newActiveSpaceId);
                        setCoupleId(newActiveSpaceId);
                    } else {
                        setActiveSpaceId(null);
                        setCoupleId(null);
                    }
                } else {
                    setProfile(null);
                    setCoupleId(null);
                    setActiveSpaceId(null);
                    setSpaces([]);
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
        <AuthContext.Provider value={{ user, loading, profile, coupleId, activeSpaceId, spaces, setActiveSpace }}>
            {children}
        </AuthContext.Provider>
    );
};
