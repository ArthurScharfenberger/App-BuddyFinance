// =============================================================================
// BuddyFinance App — App.tsx
// Ponto de entrada da aplicação.
// Configura o NavigationContainer e a StatusBar com o tema escuro do app.
// =============================================================================

import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';
import { StatusBar } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { theme }  from './src/theme/colors';

export default function App() {
    const [fontsLoaded] = useFonts({
        Sora: require('./assets/fonts/Sora.ttf'),
        Inter: require('./assets/fonts/Inter.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <NavigationContainer>
            {/* StatusBar escura alinhada com o fundo #080e1a */}
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.background}
                translucent={false}
            />
            <RootNavigator />
        </NavigationContainer>
    );
}
