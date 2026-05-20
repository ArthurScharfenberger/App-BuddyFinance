import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import { theme } from '../theme/colors';

interface SocialButtonProps {
    onPress: () => void;
    label: string;
}

export default function SocialButton({ onPress, label }: SocialButtonProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.label}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: theme.spacing.xl,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: theme.spacing.md,
    },
    label: {
        color: '#1F2937',
        fontSize: theme.typography.md,
        fontWeight: theme.typography.semibold,
    },
});
