// =============================================================================
// BuddyFinance App — App.tsx
// Ponto de entrada da aplicação.
// Configura o NavigationContainer e a StatusBar com o tema escuro do app.
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { theme }  from './src/theme/colors';

const FIRST_ACCESS_RESET_KEY = '@buddyfinance:first_access_reset_v1';
const LOCAL_DATA_KEYS = [
    '@buddyfinance:data_v2',
    '@buddyfinance:emergency_reserve_v1',
    '@buddyfinance:onboarding_profile_v1',
];

export default function App() {
    const { width } = useWindowDimensions();
    const [storageReady, setStorageReady] = useState(false);
    const [fontsLoaded] = useFonts({
        Sora: require('./assets/fonts/Sora.ttf'),
        Inter: require('./assets/fonts/Inter.ttf'),
    });
    const isDesktopWeb = Platform.OS === 'web' && width >= 768;

    useEffect(() => {
        async function resetStoredDemoData() {
            try {
                const hasReset = await AsyncStorage.getItem(FIRST_ACCESS_RESET_KEY);

                if (!hasReset) {
                    await AsyncStorage.multiRemove(LOCAL_DATA_KEYS);
                    await AsyncStorage.setItem(FIRST_ACCESS_RESET_KEY, 'true');
                }
            } catch (error) {
                console.error('[App] Erro ao limpar dados iniciais:', error);
            } finally {
                setStorageReady(true);
            }
        }

        resetStoredDemoData();
    }, []);

    if (!fontsLoaded || !storageReady) return null;

    return (
        <View style={styles.shell}>
            <View style={[styles.appFrame, isDesktopWeb && styles.desktopFrame]}>
                <NavigationContainer>
                    {/* StatusBar escura alinhada com o fundo #080e1a */}
                    <StatusBar
                        barStyle="light-content"
                        backgroundColor={theme.colors.background}
                        translucent={false}
                    />
                    <RootNavigator />
                </NavigationContainer>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    shell: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    appFrame: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.colors.background,
    },
    desktopFrame: {
        maxWidth: 520,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.borderSoft,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.14,
        shadowRadius: 32,
    },
});
