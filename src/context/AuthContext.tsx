import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { UserProfile } from "../services/coupleService";
import { registerForPushNotificationsAsync } from "../services/notificationService";
import { UserSpaceRecord } from "../services/spaceService";

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

        let currentUserProfile: UserProfile | null = null;

        const unsubscribeProfile = onSnapshot(
            doc(db, 'users', user.uid),
            (snapshot) => {
                if (snapshot.exists()) {
                    currentUserProfile = snapshot.data() as UserProfile;
                    setProfile(currentUserProfile);
                    registerForPushNotificationsAsync(user.uid);
                } else {
                    setProfile(null);
                    setCoupleId(null);
                    setActiveSpaceId(null);
                    setSpaces([]);
                    currentUserProfile = null;
                }
            },
            (error) => {
                console.error('Error listening to profile:', error);
                setLoading(false);
            }
        );

        // Listen to spaces subcollection for real-time updates (like name changes)
        const qSpaces = query(collection(db, 'users', user.uid, 'spaces'), orderBy('joinedAt', 'asc'));
        const unsubscribeSpaces = onSnapshot(qSpaces, async (snapshot) => {
            const userSpaces = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserSpaceRecord[];
            setSpaces(userSpaces);

            // Determine active space (persisted > legacy > first space)
            const persistedSpaceId = await AsyncStorage.getItem('@active_space_id');
            let newActiveSpaceId = null;

            if (userSpaces.some(s => s.id === persistedSpaceId)) {
                newActiveSpaceId = persistedSpaceId;
            } else if (currentUserProfile?.coupleId) {
                newActiveSpaceId = currentUserProfile.coupleId;
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
            setLoading(false);
        }, (error) => {
            console.error('Error listening to spaces:', error);
            setLoading(false);
        });

        return () => {
            unsubscribeProfile();
            unsubscribeSpaces();
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, profile, coupleId, activeSpaceId, spaces, setActiveSpace }}>
            {children}
        </AuthContext.Provider>
    );
};
