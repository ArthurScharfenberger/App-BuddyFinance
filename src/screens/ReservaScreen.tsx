// =============================================================================
// BuddyFinance App - src/screens/ReservaScreen.tsx
// Area de reserva com saldo disponivel e escolha de objetivo para a caixinha.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import BalanceCard from '../components/BalanceCard';
import { theme } from '../theme/colors';

const STORAGE_KEY = '@buddyfinance:emergency_reserve_v1';
const ACCOUNT_STORAGE_KEY = '@buddyfinance:data_v2';
const QUICK_DEPOSITS = [50, 100, 200] as const;

type ObjectiveOption = {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    isCustom?: boolean;
};

const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
    {
        title: 'Reserva de emergencia',
        subtitle: 'Protecao para imprevistos',
        icon: 'shield-checkmark-outline',
        color: theme.colors.success,
    },
    {
        title: 'Fazer uma viagem',
        subtitle: 'Planeje sua proxima rota',
        icon: 'airplane-outline',
        color: theme.colors.primary,
    },
    {
        title: 'Reformar a casa',
        subtitle: 'Melhorias e conforto',
        icon: 'home-outline',
        color: theme.colors.warning,
    },
    {
        title: 'Focar nos estudos',
        subtitle: 'Cursos, livros e futuro',
        icon: 'school-outline',
        color: '#8B5CF6',
    },
    {
        title: 'Meu sonho',
        subtitle: 'Um objetivo especial',
        icon: 'sparkles-outline',
        color: '#F472B6',
    },
    {
        title: 'Outro',
        subtitle: 'Criar uma nova caixinha',
        icon: 'add-outline',
        color: theme.colors.textPrimary,
        isCustom: true,
    },
];

const formatCurrency = (value: number): string =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function ReservaScreen() {
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [reserveBalance, setReserveBalance] = useState<number>(0);
    const [selectedObjective, setSelectedObjective] = useState<string>('');
    const [boxDescription, setBoxDescription] = useState<string>('');
    const [customMode, setCustomMode] = useState(false);
    const [customName, setCustomName] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    const activeBox = useMemo(() => {
        if (!selectedObjective) return null;

        return OBJECTIVE_OPTIONS.find(item => item.title === selectedObjective) ?? {
            title: selectedObjective,
            subtitle: boxDescription || 'Caixinha personalizada',
            icon: 'albums-outline' as keyof typeof Ionicons.glyphMap,
            color: theme.colors.primary,
        };
    }, [boxDescription, selectedObjective]);

    const loadReserve = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setReserveBalance(parsed.currentValue ?? 0);
                setSelectedObjective(parsed.boxName ?? '');
                setBoxDescription(parsed.boxDescription ?? '');
            }

            const accountSaved = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
            if (accountSaved) {
                const parsedAccount = JSON.parse(accountSaved);
                setAccountBalance(parsedAccount.balance ?? 0);
            }
        } catch (error) {
            console.error('[ReservaScreen] Erro ao carregar reserva:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveReserve = useCallback(async (
        nextReserveBalance: number,
        nextName: string,
        nextDescription: string,
    ) => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const currentData = saved ? JSON.parse(saved) : {};

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...currentData,
                currentValue: nextReserveBalance,
                boxName: nextName,
                boxDescription: nextDescription,
            }));
        } catch (error) {
            console.error('[ReservaScreen] Erro ao salvar reserva:', error);
        }
    }, []);

    const saveAccountBalance = useCallback(async (nextBalance: number) => {
        try {
            const saved = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
            const currentData = saved ? JSON.parse(saved) : { transactions: [], balance: 0 };

            await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify({
                ...currentData,
                balance: nextBalance,
            }));
        } catch (error) {
            console.error('[ReservaScreen] Erro ao salvar saldo disponível:', error);
        }
    }, []);

    const createBox = useCallback(async (objective: ObjectiveOption) => {
        if (objective.isCustom) {
            setCustomMode(true);
            setSelectedObjective('');
            setBoxDescription('');
            return;
        }

        setCustomMode(false);
        setCustomName('');
        setSelectedObjective(objective.title);
        setBoxDescription(objective.subtitle);
        await saveReserve(reserveBalance, objective.title, objective.subtitle);
    }, [reserveBalance, saveReserve]);

    const createCustomBox = useCallback(async () => {
        const nextName = customName.trim() || 'Minha caixinha';
        const nextDescription = 'Objetivo personalizado';

        setCustomMode(false);
        setSelectedObjective(nextName);
        setBoxDescription(nextDescription);
        setCustomName('');
        await saveReserve(reserveBalance, nextName, nextDescription);
    }, [customName, reserveBalance, saveReserve]);

    const handleDeposit = useCallback(async (amount: number) => {
        if (!activeBox) return;

        if (amount > accountBalance) {
            Alert.alert('Saldo insuficiente', 'Você ainda não tem saldo disponível para guardar esse valor.');
            return;
        }

        const nextAccountBalance = accountBalance - amount;
        const nextReserveBalance = reserveBalance + amount;

        setAccountBalance(nextAccountBalance);
        setReserveBalance(nextReserveBalance);

        await Promise.all([
            saveAccountBalance(nextAccountBalance),
            saveReserve(nextReserveBalance, activeBox.title, activeBox.subtitle),
        ]);
    }, [accountBalance, activeBox, reserveBalance, saveAccountBalance, saveReserve]);

    const handleWithdrawAll = useCallback(async () => {
        if (!activeBox || reserveBalance <= 0) return;

        const nextAccountBalance = accountBalance + reserveBalance;

        setAccountBalance(nextAccountBalance);
        setReserveBalance(0);

        await Promise.all([
            saveAccountBalance(nextAccountBalance),
            saveReserve(0, activeBox.title, activeBox.subtitle),
        ]);
    }, [accountBalance, activeBox, reserveBalance, saveAccountBalance, saveReserve]);

    const handleChangeObjective = useCallback(() => {
        setSelectedObjective('');
        setBoxDescription('');
        setCustomMode(false);
    }, []);

    useEffect(() => {
        loadReserve();
    }, [loadReserve]);

    if (!isLoaded) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando reserva...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View>
                            <Text style={styles.kicker}>Caixinha segura</Text>
                            <Text style={styles.screenTitle}>Reserva</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcon}>
                        <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
                    </View>
                </View>

                <BalanceCard
                    balance={formatCurrency(accountBalance)}
                    receitas={formatCurrency(0)}
                    despesas={formatCurrency(0)}
                    totalBalance={accountBalance}
                    showSummary={false}
                />

                {activeBox ? (
                    <View style={styles.boxPanel}>
                        <View style={styles.boxTopRow}>
                            <View style={[styles.boxIcon, { backgroundColor: activeBox.color + '22' }]}>
                                <Ionicons name={activeBox.icon} size={32} color={activeBox.color} />
                            </View>
                            <TouchableOpacity style={styles.changeButton} onPress={handleChangeObjective}>
                                <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.primary} />
                                <Text style={styles.changeButtonText}>Trocar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.boxTitle}>{activeBox.title}</Text>
                        <Text style={styles.boxDescription}>{activeBox.subtitle}</Text>

                        <View style={styles.reserveAmountCard}>
                            <Text style={styles.reserveAmountLabel}>Guardado nessa caixinha</Text>
                            <Text style={styles.reserveAmountValue}>{formatCurrency(reserveBalance)}</Text>
                        </View>

                        <Text style={styles.actionTitle}>Guardar dinheiro</Text>
                        <View style={styles.depositGrid}>
                            {QUICK_DEPOSITS.map(amount => {
                                const disabled = amount > accountBalance;

                                return (
                                    <TouchableOpacity
                                        key={amount}
                                        style={[styles.depositButton, disabled && styles.depositButtonDisabled]}
                                        onPress={() => handleDeposit(amount)}
                                        disabled={disabled}
                                        activeOpacity={0.78}
                                    >
                                        <Text style={[styles.depositValue, disabled && styles.depositValueDisabled]}>
                                            {formatCurrency(amount)}
                                        </Text>
                                        <Ionicons
                                            name={disabled ? 'lock-closed-outline' : 'add-circle-outline'}
                                            size={18}
                                            color={disabled ? theme.colors.textFaint : theme.colors.success}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {accountBalance <= 0 && (
                            <View style={styles.helperNotice}>
                                <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                                <Text style={styles.helperNoticeText}>
                                    Adicione uma receita no painel inicial para ter saldo disponível e guardar dinheiro.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.withdrawButton, reserveBalance <= 0 && styles.withdrawButtonDisabled]}
                            onPress={handleWithdrawAll}
                            disabled={reserveBalance <= 0}
                            activeOpacity={0.78}
                        >
                            <Ionicons name="return-down-back-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.withdrawButtonText}>Resgatar tudo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.objectiveSection}>
                        <Text style={styles.objectiveTitle}>
                            Qual e o seu objetivo para essa caixinha?
                        </Text>

                        {customMode && (
                            <View style={styles.customCard}>
                                <Text style={styles.customTitle}>Nome da sua caixinha</Text>
                                <TextInput
                                    style={styles.customInput}
                                    value={customName}
                                    onChangeText={setCustomName}
                                    placeholder="Ex: Comprar notebook"
                                    placeholderTextColor={theme.colors.textFaint}
                                />
                                <TouchableOpacity
                                    style={styles.customCreateButton}
                                    onPress={createCustomBox}
                                    activeOpacity={0.78}
                                >
                                    <Text style={styles.customCreateText}>Criar caixinha</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.objectiveGrid}>
                            {OBJECTIVE_OPTIONS.map((objective) => (
                                <TouchableOpacity
                                    key={objective.title}
                                    style={styles.objectiveCard}
                                    activeOpacity={0.84}
                                    onPress={() => createBox(objective)}
                                >
                                    <View style={[
                                        styles.objectiveArt,
                                        objective.isCustom
                                            ? styles.objectiveArtCustom
                                            : { backgroundColor: objective.color + '20' },
                                    ]}>
                                        <Ionicons
                                            name={objective.icon}
                                            size={objective.isCustom ? 34 : 40}
                                            color={objective.isCustom ? theme.colors.textPrimary : objective.color}
                                        />
                                    </View>

                                    <Text style={styles.objectiveName} numberOfLines={2}>
                                        {objective.title}
                                    </Text>
                                    <Text style={styles.objectiveSubtitle} numberOfLines={2}>
                                        {objective.subtitle}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    logo: {
        width: 58,
        height: 58,
        borderRadius: theme.radius.md,
        ...theme.shadow.sm,
    },
    kicker: {
        color: theme.colors.success,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        letterSpacing: 0.8,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
    },
    headerIcon: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.successMuted,
        borderWidth: 1,
        borderColor: theme.colors.success + '44',
    },
    objectiveSection: {
        marginTop: theme.spacing.sm,
    },
    objectiveTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        lineHeight: 38,
        marginBottom: theme.spacing.xl,
    },
    objectiveGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: theme.spacing.xl,
    },
    objectiveCard: {
        width: '47%',
    },
    objectiveArt: {
        width: '100%',
        aspectRatio: 1.08,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        marginBottom: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    objectiveArtCustom: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    objectiveName: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
        lineHeight: 19,
    },
    objectiveSubtitle: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        lineHeight: 17,
        marginTop: theme.spacing.xs,
    },
    boxPanel: {
        marginTop: theme.spacing.sm,
        padding: theme.spacing.xl,
        borderRadius: theme.radius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.md,
    },
    boxTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    boxIcon: {
        width: 70,
        height: 70,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primaryMuted,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    changeButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    boxTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        lineHeight: 38,
    },
    boxDescription: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        lineHeight: 21,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    reserveAmountCard: {
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    reserveAmountLabel: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: theme.spacing.xs,
    },
    reserveAmountValue: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxxl,
        fontWeight: theme.typography.black,
    },
    actionTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        marginBottom: theme.spacing.md,
    },
    depositGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.base,
    },
    depositButton: {
        flex: 1,
        minHeight: 74,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.success + '44',
        justifyContent: 'space-between',
    },
    depositButtonDisabled: {
        opacity: 0.46,
        borderColor: theme.colors.borderSoft,
    },
    depositValue: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    depositValueDisabled: {
        color: theme.colors.textFaint,
    },
    helperNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primaryMuted,
        marginBottom: theme.spacing.base,
    },
    helperNoticeText: {
        flex: 1,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        lineHeight: 20,
    },
    withdrawButton: {
        minHeight: 52,
        borderRadius: theme.radius.pill,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    withdrawButtonDisabled: {
        opacity: 0.42,
    },
    withdrawButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    customCard: {
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    customTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        marginBottom: theme.spacing.md,
    },
    customInput: {
        minHeight: 54,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.md,
    },
    customCreateButton: {
        minHeight: 50,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.secondary,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customCreateText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    loadingText: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
    },
});
