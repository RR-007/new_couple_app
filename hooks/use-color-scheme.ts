import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const systemTheme = useSystemColorScheme() ?? 'light';
    const activeTheme = colorScheme ?? 'system';

    return {
        colorScheme: activeTheme,
        resolvedColorScheme: activeTheme === 'system' ? systemTheme : activeTheme,
        setColorScheme
    };
}
