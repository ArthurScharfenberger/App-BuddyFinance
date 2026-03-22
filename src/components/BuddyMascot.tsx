// =============================================================================
// BuddyFinance App — src/components/BuddyMascot.tsx
// Mascote do app com balão de fala. Visual alinhado ao tema azul.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BuddyMascotProps {
    /** Mensagem exibida no balão de fala */
    message: string;
    /** Variante visual: padrão (azul), alerta (amarelo) ou erro (vermelho) */
    variant?: 'default' | 'warning' | 'danger';
}

// ── Mapa de variantes ─────────────────────────────────────────────────────────

const variantConfig = {
    default: {
        bubbleBg:    theme.colors.surface,
        bubbleBorder: theme.colors.primary,
        iconName:    'chatbubble-ellipses-outline' as const,
        iconColor:   theme.colors.primary,
    },
    warning: {
        bubbleBg:    theme.colors.warningMuted,
        bubbleBorder: theme.colors.warning,
        iconName:    'warning-outline' as const,
        iconColor:   theme.colors.warning,
    },
    danger: {
        bubbleBg:    theme.colors.dangerMuted,
        bubbleBorder: theme.colors.danger,
        iconName:    'alert-circle-outline' as const,
        iconColor:   theme.colors.danger,
    },
} as const;

// ── Componente ────────────────────────────────────────────────────────────────

export default function BuddyMascot({
    message,
    variant = 'default',
}: BuddyMascotProps) {
    const config = variantConfig[variant];

    return (
        <View style={styles.container}>

            {/* Avatar circular com ícone */}
            <View style={[styles.avatar, { borderColor: config.bubbleBorder }]}>
                <Text style={styles.avatarEmoji}>🤖</Text>
            </View>

            {/* Balão de fala */}
            <View style={[
                styles.bubble,
                {
                    backgroundColor: config.bubbleBg,
                    borderColor: config.bubbleBorder,
                },
            ]}>
                {/* Ponta do balão (triângulo) */}
                <View style={[styles.bubbleTip, { borderRightColor: config.bubbleBorder }]} />

                <View style={styles.bubbleContent}>
                    <Ionicons
                        name={config.iconName}
                        size={14}
                        color={config.iconColor}
                        style={styles.bubbleIcon}
                    />
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>

        </View>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.base,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 26,
    },
    bubble: {
        flex: 1,
        marginLeft: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.spacing.md,
        position: 'relative',
    },
    bubbleTip: {
        position: 'absolute',
        left: -8,
        top: 14,
        width: 0,
        height: 0,
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderRightWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    bubbleContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bubbleIcon: {
        marginRight: 6,
        marginTop: 1,
    },
    message: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sm,
        lineHeight: 20,
        fontWeight: theme.typography.medium,
    },
});
