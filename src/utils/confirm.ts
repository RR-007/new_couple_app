import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog.
 * Uses window.confirm on web, Alert.alert on native.
 */
export const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void
) => {
    if (Platform.OS === 'web') {
        if (window.confirm(message)) {
            onConfirm();
        }
    } else {
        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', style: 'destructive', onPress: onConfirm },
        ]);
    }
};
