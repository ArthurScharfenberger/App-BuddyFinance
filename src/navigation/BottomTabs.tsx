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
import PerfilScreen       from '../screens/PerfilScreen';
import TransacoesScreen   from '../screens/TransacoesScreen';
import { theme }          from '../theme/colors';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TabName = 'Início' | 'Histórico' | 'Aprender' | 'Perfil';

// ── Mapa de ícones ────────────────────────────────────────────────────────────

const TAB_ICONS: Record<TabName, {
    active:   keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
}> = {
    'Início':    { active: 'home',          inactive: 'home-outline'          },
    'Histórico': { active: 'list',          inactive: 'list-outline'          },
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
                size={26}
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
                tabBarIconStyle: styles.tabIconSlot,
                tabBarItemStyle: styles.tabItem,

                // Ícone customizado
                tabBarIcon: ({ focused }) => (
                    <TabIcon name={route.name as TabName} focused={focused} />
                ),
            })}
        >
            <Tab.Screen name="Início"    component={HomeScreen}          />
            <Tab.Screen name="Histórico" component={TransacoesScreen}    />
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
        height:           Platform.OS === 'ios' ? 108 : 90,
        paddingBottom:    Platform.OS === 'ios' ? 28 : 14,
        paddingTop:       12,
        ...theme.shadow.md,
    },
    tabItem: {
        height: 64,
        justifyContent: 'center',
        paddingVertical: 6,
    },
    tabIconSlot: {
        width: 52,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    tabLabel: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize:   theme.typography.sm,
        fontWeight: theme.typography.semibold,
        marginTop:  3,
    },
    iconWrapper: {
        width: 44,
        height: 34,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperActive: {
        backgroundColor: theme.colors.primaryMuted,
    },
});
