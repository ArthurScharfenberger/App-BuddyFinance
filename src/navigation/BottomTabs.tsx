// =============================================================================
// BuddyFinance App — src/navigation/BottomTabs.tsx
// Navegação principal por abas inferiores.
// Visual alinhado ao tema azul do site (#0052FF).
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import EducacaoScreen     from '../screens/EducacaoScreen';
import HomeScreen         from '../screens/HomeScreen';
import InvestimentosScreen from '../screens/InvestimentosScreen';
import PerfilScreen       from '../screens/PerfilScreen';
import TransacoesScreen   from '../screens/TransacoesScreen';
import { theme }          from '../theme/colors';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TabName = 'Início' | 'Histórico' | 'Investir' | 'Aprender' | 'Perfil';

// ── Mapa de ícones ────────────────────────────────────────────────────────────

const TAB_ICONS: Record<TabName, {
    active:   keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
}> = {
    'Início':    { active: 'home',          inactive: 'home-outline'          },
    'Histórico': { active: 'list',          inactive: 'list-outline'          },
    'Investir':  { active: 'trending-up',   inactive: 'trending-up-outline'   },
    'Aprender':  { active: 'book',          inactive: 'book-outline'          },
    'Perfil':    { active: 'person',        inactive: 'person-outline'        },
};

// ── Navigator ─────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

// ── Componente de ícone customizado ───────────────────────────────────────────

function TabIcon({
    name,
    focused,
}: {
    name: TabName;
    focused: boolean;
}) {
    const icons = TAB_ICONS[name];
    const iconName = focused ? icons.active : icons.inactive;

    return (
        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <Ionicons
                name={iconName}
                size={22}
                color={focused ? theme.colors.primary : theme.colors.textFaint}
            />
        </View>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                // Estilo da barra
                tabBarStyle: styles.tabBar,

                // Cores do label
                tabBarActiveTintColor:   theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textFaint,

                // Estilo do label
                tabBarLabelStyle: styles.tabLabel,

                // Ícone customizado
                tabBarIcon: ({ focused }) => (
                    <TabIcon name={route.name as TabName} focused={focused} />
                ),
            })}
        >
            <Tab.Screen name="Início"    component={HomeScreen}          />
            <Tab.Screen name="Histórico" component={TransacoesScreen}    />
            <Tab.Screen name="Investir"  component={InvestimentosScreen} />
            <Tab.Screen name="Aprender"  component={EducacaoScreen}      />
            <Tab.Screen name="Perfil"    component={PerfilScreen}        />
        </Tab.Navigator>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor:  theme.colors.surface,
        borderTopWidth:   1,
        borderTopColor:   theme.colors.border,
        height:           Platform.OS === 'ios' ? 85 : 65,
        paddingBottom:    Platform.OS === 'ios' ? 24 : 10,
        paddingTop:       8,
    },
    tabLabel: {
        fontSize:   10,
        fontWeight: theme.typography.semibold,
        marginTop:  -2,
    },
    iconWrapper: {
        padding: 4,
        borderRadius: theme.radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperActive: {
        backgroundColor: theme.colors.primaryMuted,
    },
});
