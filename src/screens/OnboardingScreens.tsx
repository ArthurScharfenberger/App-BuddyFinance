import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme/colors';

const PROFILE_STORAGE_KEY = '@buddyfinance:onboarding_profile_v1';

type GoalOption = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
};

const GOALS: GoalOption[] = [
    { label: 'Organizar meu mês', icon: 'calendar-outline', color: theme.colors.primary },
    { label: 'Criar reserva de emergência', icon: 'shield-checkmark-outline', color: theme.colors.success },
    { label: 'Começar a investir', icon: 'trending-up-outline', color: theme.colors.buddyProgress },
    { label: 'Sair das dívidas', icon: 'remove-circle-outline', color: theme.colors.ifoodRed },
];

const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const amount = Number(digits) / 100;

    if (!digits) return '';

    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

async function updateProfile(data: Record<string, string>) {
    const saved = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    const currentProfile = saved ? JSON.parse(saved) : {};

    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        ...currentProfile,
        ...data,
    }));
}

function OnboardingLayout({
    children,
    footer,
}: {
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
                {footer && <View style={styles.footer}>{footer}</View>}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function ProgressHeader({ step }: { step: number }) {
    return (
        <View style={styles.progressBlock}>
            <Text style={styles.progressText}>Passo {step} de 3</Text>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>
        </View>
    );
}

function PrimaryButton({
    title,
    onPress,
    disabled,
}: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[styles.primaryButton, disabled && styles.disabledButton]}
            onPress={onPress}
            activeOpacity={0.78}
            disabled={disabled}
        >
            <Text style={styles.primaryButtonText}>{title}</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>
    );
}

function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.secondaryButton} onPress={onPress} activeOpacity={0.76}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>{title}</Text>
        </TouchableOpacity>
    );
}

function HeroIllustration() {
    return (
        <View style={styles.heroVisual}>
            <View style={styles.heroOrb}>
                <Ionicons name="wallet-outline" size={48} color={theme.colors.primary} />
            </View>
            <View style={[styles.floatingCard, styles.floatingCardTop]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.success} />
                <Text style={styles.floatingCardText}>Reserva</Text>
            </View>
            <View style={[styles.floatingCard, styles.floatingCardBottom]}>
                <Ionicons name="trending-up-outline" size={18} color={theme.colors.buddyProgress} />
                <Text style={styles.floatingCardText}>Investir</Text>
            </View>
        </View>
    );
}

export function OnboardingWelcomeScreen() {
    const navigation = useNavigation<any>();

    return (
        <OnboardingLayout>
            <View style={styles.welcomeHeader}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <HeroIllustration />
                <Text style={styles.welcomeTitle}>Bem-vindo ao Buddy Finance</Text>
                <Text style={styles.welcomeSubtitle}>
                    Organize seu dinheiro, crie sua reserva e dê os primeiros passos nos investimentos.
                </Text>
            </View>

            <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                    <Ionicons name="pie-chart-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.featureText}>Planejamento simples</Text>
                </View>
                <View style={styles.featureCard}>
                    <Ionicons name="sparkles-outline" size={20} color={theme.colors.success} />
                    <Text style={styles.featureText}>Orientação personalizada</Text>
                </View>
            </View>

            <PrimaryButton
                title="Começar agora"
                onPress={() => navigation.navigate('OnboardingIncome')}
            />

            <TouchableOpacity
                style={styles.textLinkButton}
                onPress={() => navigation.navigate('SignIn')}
                activeOpacity={0.76}
            >
                <Text style={styles.textLink}>Já tenho conta</Text>
            </TouchableOpacity>
        </OnboardingLayout>
    );
}

export function OnboardingIncomeScreen() {
    const navigation = useNavigation<any>();
    const [income, setIncome] = useState('');

    const handleContinue = useCallback(async () => {
        await updateProfile({ income });
        navigation.navigate('OnboardingExpenses');
    }, [income, navigation]);

    return (
        <OnboardingLayout footer={(
            <>
                <PrimaryButton title="Continuar" onPress={handleContinue} disabled={!income} />
                <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} />
            </>
        )}>
            <ProgressHeader step={1} />
            <View style={styles.questionCard}>
                <View style={styles.questionIcon}>
                    <Ionicons name="cash-outline" size={30} color={theme.colors.primary} />
                </View>
                <Text style={styles.screenTitle}>Vamos entender sua realidade financeira</Text>
                <Text style={styles.questionText}>Qual é sua renda mensal?</Text>
                <Text style={styles.helpText}>
                    Essa informação ajuda a personalizar seu planejamento financeiro.
                </Text>
                <TextInput
                    style={styles.moneyInput}
                    value={income}
                    onChangeText={(value) => setIncome(formatCurrencyInput(value))}
                    placeholder="Ex: R$ 2.500,00"
                    placeholderTextColor={theme.colors.textFaint}
                    keyboardType="numeric"
                />
            </View>
        </OnboardingLayout>
    );
}

export function OnboardingExpensesScreen() {
    const navigation = useNavigation<any>();
    const [expenses, setExpenses] = useState('');

    const handleContinue = useCallback(async () => {
        await updateProfile({ expenses });
        navigation.navigate('OnboardingGoal');
    }, [expenses, navigation]);

    return (
        <OnboardingLayout footer={(
            <>
                <PrimaryButton title="Continuar" onPress={handleContinue} disabled={!expenses} />
                <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} />
            </>
        )}>
            <ProgressHeader step={2} />
            <View style={styles.questionCard}>
                <View style={[styles.questionIcon, styles.dangerQuestionIcon]}>
                    <Ionicons name="receipt-outline" size={30} color={theme.colors.ifoodRed} />
                </View>
                <Text style={styles.screenTitle}>Agora, seus gastos mensais</Text>
                <Text style={styles.questionText}>Quanto você costuma gastar por mês?</Text>
                <Text style={styles.helpText}>Você pode informar uma média aproximada.</Text>
                <TextInput
                    style={styles.moneyInput}
                    value={expenses}
                    onChangeText={(value) => setExpenses(formatCurrencyInput(value))}
                    placeholder="Ex: R$ 1.800,00"
                    placeholderTextColor={theme.colors.textFaint}
                    keyboardType="numeric"
                />
            </View>
        </OnboardingLayout>
    );
}

export function OnboardingGoalScreen() {
    const navigation = useNavigation<any>();
    const [goal, setGoal] = useState('');

    const handleFinish = useCallback(async () => {
        await updateProfile({ goal });
        navigation.navigate('OnboardingComplete');
    }, [goal, navigation]);

    return (
        <OnboardingLayout footer={(
            <>
                <PrimaryButton title="Finalizar" onPress={handleFinish} disabled={!goal} />
                <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} />
            </>
        )}>
            <ProgressHeader step={3} />
            <View style={styles.goalHeader}>
                <Text style={styles.screenTitle}>Qual é seu principal objetivo agora?</Text>
                <Text style={styles.helpText}>
                    Escolha a opção que melhor representa o que você busca neste momento.
                </Text>
            </View>

            <View style={styles.goalGrid}>
                {GOALS.map((item) => {
                    const selected = goal === item.label;

                    return (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.goalCard, selected && styles.goalCardSelected]}
                            onPress={() => setGoal(item.label)}
                            activeOpacity={0.82}
                        >
                            <View style={[styles.goalIcon, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon} size={26} color={item.color} />
                            </View>
                            <Text style={styles.goalText}>{item.label}</Text>
                            {selected && (
                                <View style={styles.goalCheck}>
                                    <Ionicons name="checkmark" size={14} color={theme.colors.background} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingLayout>
    );
}

export function OnboardingCompleteScreen() {
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState({ income: '', expenses: '', goal: '' });

    useEffect(() => {
        async function loadProfile() {
            const saved = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (saved) {
                setProfile(JSON.parse(saved));
            }
        }

        loadProfile();
    }, []);

    return (
        <OnboardingLayout>
            <View style={styles.successVisual}>
                <View style={styles.successRing}>
                    <Ionicons name="checkmark" size={48} color={theme.colors.background} />
                </View>
            </View>

            <Text style={styles.completeTitle}>Tudo pronto!</Text>
            <Text style={styles.completeMessage}>
                Seu perfil inicial foi configurado. Agora vamos te ajudar a organizar sua vida financeira com mais clareza e segurança.
            </Text>

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Renda mensal</Text>
                    <Text style={styles.summaryValue}>{profile.income || 'Não informado'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Gasto mensal</Text>
                    <Text style={styles.summaryValue}>{profile.expenses || 'Não informado'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Objetivo principal</Text>
                    <Text style={styles.summaryValue}>{profile.goal || 'Organizar meu mês'}</Text>
                </View>
            </View>

            <PrimaryButton
                title="Ir para o painel"
                onPress={() => navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                })}
            />
        </OnboardingLayout>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xl,
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSoft,
    },
    welcomeHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logo: {
        width: 184,
        height: 64,
        marginBottom: theme.spacing.xl,
        ...theme.shadow.sm,
    },
    heroVisual: {
        width: '100%',
        minHeight: 240,
        borderRadius: theme.radius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
        ...theme.shadow.lg,
    },
    heroOrb: {
        width: 118,
        height: 118,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primaryMuted,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingCard: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    floatingCardTop: {
        top: theme.spacing.xl,
        right: theme.spacing.lg,
    },
    floatingCardBottom: {
        left: theme.spacing.lg,
        bottom: theme.spacing.xl,
    },
    floatingCardText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
    welcomeTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        textAlign: 'center',
        lineHeight: 40,
    },
    welcomeSubtitle: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
    featureGrid: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    featureCard: {
        flex: 1,
        minHeight: 92,
        padding: theme.spacing.base,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        justifyContent: 'space-between',
    },
    featureText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
        lineHeight: 20,
    },
    primaryButton: {
        minHeight: 58,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.secondary,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        ...theme.shadow.md,
    },
    disabledButton: {
        opacity: 0.45,
    },
    primaryButtonText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
    secondaryButton: {
        height: 48,
        marginTop: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
    textLinkButton: {
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
    },
    textLink: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.semibold,
    },
    progressBlock: {
        marginBottom: theme.spacing.xxl,
    },
    progressText: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
        marginBottom: theme.spacing.sm,
    },
    progressTrack: {
        height: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primary,
    },
    questionCard: {
        padding: theme.spacing.xl,
        borderRadius: theme.radius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.md,
    },
    questionIcon: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryMuted,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    dangerQuestionIcon: {
        backgroundColor: theme.colors.dangerMuted,
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.black,
        lineHeight: 32,
        marginBottom: theme.spacing.md,
    },
    questionText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        marginBottom: theme.spacing.sm,
    },
    helpText: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        lineHeight: 21,
        marginBottom: theme.spacing.xl,
    },
    moneyInput: {
        minHeight: 64,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.bold,
        paddingHorizontal: theme.spacing.base,
    },
    goalHeader: {
        marginBottom: theme.spacing.lg,
    },
    goalGrid: {
        gap: theme.spacing.md,
    },
    goalCard: {
        minHeight: 86,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.base,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        position: 'relative',
    },
    goalCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceHover,
    },
    goalIcon: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    goalText: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
        lineHeight: 22,
        paddingRight: theme.spacing.xl,
    },
    goalCheck: {
        position: 'absolute',
        right: theme.spacing.base,
        top: theme.spacing.base,
        width: 24,
        height: 24,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
    },
    successVisual: {
        minHeight: 210,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successRing: {
        width: 108,
        height: 108,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        borderWidth: 10,
        borderColor: theme.colors.successMuted,
        ...theme.shadow.lg,
    },
    completeTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxxl,
        fontWeight: theme.typography.black,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    completeMessage: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    summaryCard: {
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    summaryRow: {
        gap: theme.spacing.xs,
    },
    summaryLabel: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    summaryValue: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: theme.colors.borderSoft,
        marginVertical: theme.spacing.md,
    },
});
