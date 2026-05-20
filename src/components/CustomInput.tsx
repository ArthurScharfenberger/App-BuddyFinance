import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

interface CustomInputProps extends TextInputProps {
    label: string;
    isPassword?: boolean;
}

export default function CustomInput({ label, isPassword, ...props }: CustomInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused
            ]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.textFaint}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.iconContainer}
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.base,
        width: '100%',
    },
    label: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        marginBottom: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        height: 56,
        paddingHorizontal: theme.spacing.base,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
    },
    input: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.md,
    },
    iconContainer: {
        padding: theme.spacing.xs,
    },
});
