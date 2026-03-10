import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { Space } from '../services/spaceService';
import { useAuth } from './AuthContext';

// Default values to fallback on
export const DEFAULT_THEME_COLOR = '#FF2D55'; // The standard pinkish/red app color

const DEFAULT_THEME = {
    primary: DEFAULT_THEME_COLOR,
    secondary: '#1C1C1E',
    tertiary: { type: 'color' as const, value: '#000000' }
};

interface Customization {
    theme: {
        primary: string;
        secondary: string;
        tertiary: { type: 'color' | 'image'; value: string };
    };
    nicknames: Record<string, string>;
    tabNames: Record<string, string>;
}

interface ThemeContextType {
    customization: Customization;
    loadingTheme: boolean;
    getNickname: (userId: string) => string | null;
}

const ThemeContext = createContext<ThemeContextType>({
    customization: {
        theme: DEFAULT_THEME,
        nicknames: {},
        tabNames: {},
    },
    loadingTheme: true,
    getNickname: () => null,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { activeSpaceId } = useAuth();

    const [customization, setCustomization] = useState<Customization>({
        theme: DEFAULT_THEME,
        nicknames: {},
        tabNames: {},
    });
    const [loadingTheme, setLoadingTheme] = useState(true);

    useEffect(() => {
        if (!activeSpaceId) {
            // Reset to defaults if no active space
            setCustomization({
                theme: DEFAULT_THEME,
                nicknames: {},
                tabNames: {},
            });
            setLoadingTheme(false);
            return;
        }

        // Listen to the active space document to get real-time customization updates
        const spaceRef = doc(db, 'couples', activeSpaceId);

        const unsubscribe = onSnapshot(spaceRef, (docSnap) => {
            if (docSnap.exists()) {
                const spaceData = docSnap.data() as Space;
                setCustomization({
                    theme: spaceData.theme || DEFAULT_THEME,
                    nicknames: spaceData.nicknames || {},
                    tabNames: spaceData.tabNames || {},
                });
            }
            setLoadingTheme(false);
        }, (error) => {
            console.error("Error listening to theme customization:", error);
            setLoadingTheme(false);
        });

        return () => unsubscribe();
    }, [activeSpaceId]);

    const getNickname = (userId: string) => {
        return customization.nicknames[userId] || null;
    };

    return (
        <ThemeContext.Provider value={{ customization, loadingTheme, getNickname }}>
            {children}
        </ThemeContext.Provider>
    );
};
