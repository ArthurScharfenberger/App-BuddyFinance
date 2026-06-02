import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleResetPassword = () => {
        // Lógica de recuperação aqui
        console.log('Recuperar senha para:', email);
        setIsSent(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.navHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Recuperar senha</Text>
                        <Text style={styles.subtitle}>
                            {isSent
                                ? 'Enviamos um link de recuperação para o seu e-mail.'
                                : 'Digite seu e-mail para receber as instruções de recuperação.'}
                        </Text>
                    </View>

                    {!isSent ? (
                        <>
                            <CustomInput
                                label="E-mail"
                                placeholder="seu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <CustomButton
                                title="Enviar link"
                                variant="primary"
                                onPress={handleResetPassword}
                                style={styles.actionButton}
                            />
                        </>
                    ) : (
                        <CustomButton
                            title="Voltar para o Login"
                            variant="primary"
                            onPress={() => navigation.navigate('SignIn')}
                            style={styles.actionButton}
                        />
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Ainda precisa de ajuda? </Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Fale com o suporte</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    navHeader: {
        paddingHorizontal: theme.spacing.base,
        paddingTop: theme.spacing.base,
    },
    backButton: {
        padding: theme.spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        width: 170,
        height: 58,
        marginBottom: theme.spacing.xl,
        backgroundColor: 'transparent',
        ...theme.shadow.sm,
    },
    title: {
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    subtitle: {
        fontSize: theme.typography.base,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    actionButton: {
        width: '100%',
        height: 56,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    footer: {
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        fontSize: theme.typography.base,
        color: theme.colors.textMuted,
    },
    linkText: {
        fontSize: theme.typography.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.semibold,
    },
});
