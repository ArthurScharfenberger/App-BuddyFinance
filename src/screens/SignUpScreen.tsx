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

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = () => {
        // Lógica de cadastro aqui
        console.log('Cadastro com:', name, email, password);
        // Por enquanto, continua para o diagnóstico inicial
        navigation.navigate('OnboardingIncome');
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
                        <Text style={styles.title}>Criar conta grátis</Text>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitle}>Já tem uma conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                <Text style={styles.linkText}>Entrar agora</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SocialButton
                        label="Cadastrar com Google"
                        onPress={() => console.log('Google SignUp')}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OU CADASTRE COM E-MAIL</Text>
                        <View style={styles.divider} />
                    </View>

                    <CustomInput
                        label="Nome completo"
                        placeholder="Seu nome"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

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
                        placeholder="Crie uma senha forte"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                    />

                    <CustomButton
                        title="Criar conta"
                        variant="primary"
                        onPress={handleSignUp}
                        style={styles.signUpButton}
                    />

                    <Text style={styles.termsText}>
                        Ao criar uma conta, você concorda com os{' '}
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
        width: 170,
        height: 58,
        marginBottom: theme.spacing.xl,
        ...theme.shadow.sm,
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
    signUpButton: {
        width: '100%',
        height: 56,
        marginTop: theme.spacing.md,
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
