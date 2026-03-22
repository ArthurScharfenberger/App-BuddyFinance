// =============================================================================
// BuddyFinance App — src/components/CustomButton.tsx
// Botão reutilizável com suporte a variantes, ícone e estado de loading.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from 'react-native';
import { theme } from '../theme/colors';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'danger' | 'ghost' | 'surface';
    size?: 'sm' | 'md' | 'lg';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
}

// ── Mapa de variantes ─────────────────────────────────────────────────────────

const variantStyles = {
    primary: {
        bg:         theme.colors.primary,
        text:       '#ffffff',
        border:     theme.colors.primary,
    },
    danger: {
        bg:         theme.colors.danger,
        text:       '#ffffff',
        border:     theme.colors.danger,
    },
    ghost: {
        bg:         'transparent',
        text:       theme.colors.textMuted,
        border:     theme.colors.border,
    },
    surface: {
        bg:         theme.colors.surface,
        text:       theme.colors.textPrimary,
        border:     theme.colors.border,
    },
} as const;

const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 14, fontSize: theme.typography.sm },
    md: { paddingVertical: 14, paddingHorizontal: 18, fontSize: theme.typography.base },
    lg: { paddingVertical: 17, paddingHorizontal: 22, fontSize: theme.typography.md },
} as const;

// ── Componente ────────────────────────────────────────────────────────────────

export default function CustomButton({
    title,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    style,
    disabled,
    ...rest
}: CustomButtonProps) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    return (
        <TouchableOpacity
            style={[
                styles.base,
                {
                    backgroundColor:  v.bg,
                    borderColor:      v.border,
                    paddingVertical:   s.paddingVertical,
                    paddingHorizontal: s.paddingHorizontal,
                    opacity: disabled || loading ? 0.5 : 1,
                },
                style,
            ]}
            disabled={disabled || loading}
            activeOpacity={0.75}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator size="small" color={v.text} />
            ) : (
                <>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={s.fontSize + 2}
                            color={v.text}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    base: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        marginHorizontal: theme.spacing.xs,
    },
    icon: {
        marginRight: theme.spacing.xs,
    },
    text: {
        fontWeight: theme.typography.bold,
        letterSpacing: -0.2,
    },
});
