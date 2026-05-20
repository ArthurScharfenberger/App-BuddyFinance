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
import { theme } from '../theme/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';

export default function SignInScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSignIn = () => {
        // Lógica de login aqui
        console.log('Login com:', email, password);
        // Por enquanto, apenas navega para a Home
        navigation.navigate('MainTabs');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
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
                        <Text style={styles.title}>Entrar na conta</Text>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitle}>Não tem conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.linkText}>Cadastre-se grátis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SocialButton
                        label="Continuar com Google"
                        onPress={() => console.log('Google Login')}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OU ENTRE COM E-MAIL</Text>
                        <View style={styles.divider} />
                    </View>

                    <CustomInput
                        label="E-mail"
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <CustomInput
                        label="Senha"
                        placeholder="Sua senha"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                    />

                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
                            <Text style={styles.checkboxLabel}>Lembrar de mim</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.linkText}>Esqueci minha senha</Text>
                        </TouchableOpacity>
                    </View>

                    <CustomButton
                        title="Entrar"
                        variant="primary"
                        onPress={handleSignIn}
                        style={styles.signInButton}
                    />

                    <Text style={styles.termsText}>
                        Ao continuar, você concorda com os{' '}
                        <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
                        <Text style={styles.termsLink}>Política de Privacidade</Text>.
                    </Text>
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
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        width: 120,
        height: 40,
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    subtitleContainer: {
        flexDirection: 'row',
    },
    subtitle: {
        fontSize: theme.typography.base,
        color: theme.colors.textMuted,
    },
    linkText: {
        fontSize: theme.typography.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.semibold,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        fontSize: 10,
        fontWeight: theme.typography.bold,
        color: theme.colors.textFaint,
        marginHorizontal: theme.spacing.md,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing.xl,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.sm,
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkboxLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.textMuted,
    },
    signInButton: {
        width: '100%',
        height: 56,
        marginBottom: theme.spacing.xl,
    },
    termsText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: theme.colors.primary,
        fontWeight: theme.typography.medium,
    },
});
