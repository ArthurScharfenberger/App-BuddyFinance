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
    title?: string;
    variant?: 'primary' | 'danger' | 'ghost' | 'surface';
    size?: 'sm' | 'md' | 'lg';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
}

// ── Mapa de variantes ─────────────────────────────────────────────────────────

const variantStyles = {
    primary: {
        bg:         theme.colors.secondary,
        text:       theme.colors.textPrimary,
        border:     theme.colors.primary,
    },
    danger: {
        bg:         theme.colors.ifoodRed,
        text:       '#ffffff',
        border:     theme.colors.ifoodRed,
    },
    ghost: {
        bg:         'transparent',
        text:       theme.colors.primary,
        border:     theme.colors.primary,
    },
    surface: {
        bg:         theme.colors.surface,
        text:       theme.colors.textPrimary,
        border:     theme.colors.border,
    },
} as const;

const sizeStyles = {
    sm: { paddingVertical: 12, paddingHorizontal: 16, fontSize: theme.typography.sm },
    md: { paddingVertical: 16, paddingHorizontal: 20, fontSize: theme.typography.base },
    lg: { paddingVertical: 19, paddingHorizontal: 24, fontSize: theme.typography.md },
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
    const hasTitle = Boolean(title?.trim());

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
                            size={hasTitle ? s.fontSize + 2 : s.fontSize + 12}
                            color={v.text}
                            style={hasTitle && styles.icon}
                        />
                    )}
                    {hasTitle && (
                        <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>
                            {title}
                        </Text>
                    )}
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
        borderRadius: theme.radius.pill,
        borderWidth: 2,
        marginHorizontal: theme.spacing.xs,
        ...theme.shadow.sm,
    },
    icon: {
        marginRight: theme.spacing.xs,
    },
    text: {
        fontFamily: theme.typography.fontFamily.body,
        fontWeight: theme.typography.semibold,
    },
});
