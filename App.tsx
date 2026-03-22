// =============================================================================
// BuddyFinance App — App.tsx
// Ponto de entrada da aplicação.
// Configura o NavigationContainer e a StatusBar com o tema escuro do app.
// =============================================================================

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';

import BottomTabs from './src/navigation/BottomTabs';
import { theme }  from './src/theme/colors';

export default function App() {
    return (
        <NavigationContainer>
            {/* StatusBar escura alinhada com o fundo #080e1a */}
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.background}
                translucent={false}
            />
            <BottomTabs />
        </NavigationContainer>
    );
}
