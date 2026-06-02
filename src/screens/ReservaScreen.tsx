// =============================================================================
// BuddyFinance App - src/screens/ReservaScreen.tsx
// Area de reserva com multiplas caixinhas e saldo disponivel.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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

type ReserveBox = {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    currentValue: number;
    createdAt: string;
};

type TransactionType = 'receita' | 'despesa';

type StoredAccountData = {
    transactions: TransactionRecord[];
    balance: number;
};

type TransactionRecord = {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    date: string;
};

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
        title: 'Outro',
        subtitle: 'Criar uma nova caixinha',
        icon: 'add-outline',
        color: theme.colors.textPrimary,
        isCustom: true,
    },
];

const formatCurrency = (value: number): string =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

const parseCurrencyInput = (value: string): number =>
    Number(value.replace(/\./g, '').replace(',', '.'));

const createReserveTransaction = (
    amount: number,
    type: TransactionType,
    title: string,
): TransactionRecord => ({
    id: Date.now().toString(),
    title,
    amount,
    type,
    date: new Date().toISOString(),
});

const createBoxFromOption = (option: ObjectiveOption, customName?: string): ReserveBox => {
    const isCustom = option.isCustom;
    const title = isCustom ? (customName?.trim() || 'Minha caixinha') : option.title;

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        subtitle: isCustom ? 'Objetivo personalizado' : option.subtitle,
        icon: isCustom ? 'albums-outline' : option.icon,
        color: isCustom ? theme.colors.primary : option.color,
        currentValue: 0,
        createdAt: new Date().toISOString(),
    };
};

export default function ReservaScreen() {
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [boxes, setBoxes] = useState<ReserveBox[]>([]);
    const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
    const [customMode, setCustomMode] = useState(false);
    const [customName, setCustomName] = useState('');
    const [depositValue, setDepositValue] = useState('');
    const [withdrawValue, setWithdrawValue] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    const selectedBox = useMemo(
        () => boxes.find(box => box.id === selectedBoxId) ?? null,
        [boxes, selectedBoxId]
    );

    const depositAmount = parseCurrencyInput(depositValue);
    const canDepositCustom = depositValue.trim().length > 0
        && Number.isFinite(depositAmount)
        && depositAmount > 0
        && depositAmount <= accountBalance;

    const withdrawAmount = parseCurrencyInput(withdrawValue);
    const canWithdrawCustom = Boolean(selectedBox)
        && withdrawValue.trim().length > 0
        && Number.isFinite(withdrawAmount)
        && withdrawAmount > 0
        && withdrawAmount <= (selectedBox?.currentValue ?? 0);

    const loadReserve = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed.boxes)) {
                    setBoxes(parsed.boxes);
                } else if (parsed.boxName || parsed.currentValue > 0) {
                    setBoxes([{
                        id: 'legacy-reserve',
                        title: parsed.boxName ?? 'Reserva de emergencia',
                        subtitle: parsed.boxDescription ?? 'Protecao para imprevistos',
                        icon: 'shield-checkmark-outline',
                        color: theme.colors.success,
                        currentValue: parsed.currentValue ?? 0,
                        createdAt: new Date().toISOString(),
                    }]);
                }
            } else {
                setBoxes([]);
            }

            const accountSaved = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
            if (accountSaved) {
                const parsedAccount = JSON.parse(accountSaved);
                setAccountBalance(parsedAccount.balance ?? 0);
            } else {
                setAccountBalance(0);
            }
        } catch (error) {
            console.error('[ReservaScreen] Erro ao carregar reserva:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveBoxes = useCallback(async (nextBoxes: ReserveBox[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                boxes: nextBoxes,
                updatedAt: new Date().toISOString(),
            }));
        } catch (error) {
            console.error('[ReservaScreen] Erro ao salvar reserva:', error);
        }
    }, []);

    const saveAccountData = useCallback(async (
        nextBalance: number,
        nextTransaction?: TransactionRecord,
    ) => {
        try {
            const saved = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
            const currentData: StoredAccountData = saved
                ? JSON.parse(saved)
                : { transactions: [], balance: 0 };

            const nextTransactions = nextTransaction
                ? [nextTransaction, ...(currentData.transactions ?? [])]
                : currentData.transactions ?? [];

            await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify({
                ...currentData,
                transactions: nextTransactions,
                balance: nextBalance,
            }));
        } catch (error) {
            console.error('[ReservaScreen] Erro ao salvar saldo disponivel:', error);
        }
    }, []);

    const persistState = useCallback(async (
        nextBoxes: ReserveBox[],
        nextAccountBalance: number,
        nextTransaction?: TransactionRecord,
    ) => {
        setBoxes(nextBoxes);
        setAccountBalance(nextAccountBalance);

        await Promise.all([
            saveBoxes(nextBoxes),
            saveAccountData(nextAccountBalance, nextTransaction),
        ]);
    }, [saveAccountData, saveBoxes]);

    const handleCreateBox = useCallback(async (objective: ObjectiveOption) => {
        if (objective.isCustom) {
            setCustomMode(true);
            return;
        }

        const nextBox = createBoxFromOption(objective);
        const nextBoxes = [nextBox, ...boxes];

        setCustomMode(false);
        setSelectedBoxId(nextBox.id);
        await saveBoxes(nextBoxes);
        setBoxes(nextBoxes);
    }, [boxes, saveBoxes]);

    const handleCreateCustomBox = useCallback(async () => {
        const customOption = OBJECTIVE_OPTIONS.find(option => option.isCustom);
        if (!customOption) return;

        const nextBox = createBoxFromOption(customOption, customName);
        const nextBoxes = [nextBox, ...boxes];

        setCustomName('');
        setCustomMode(false);
        setSelectedBoxId(nextBox.id);
        await saveBoxes(nextBoxes);
        setBoxes(nextBoxes);
    }, [boxes, customName, saveBoxes]);

    const updateSelectedBoxValue = useCallback(async (
        nextValue: number,
        nextAccountBalance: number,
        nextTransaction?: TransactionRecord,
    ) => {
        if (!selectedBox) return;

        const nextBoxes = boxes.map(box =>
            box.id === selectedBox.id
                ? { ...box, currentValue: nextValue }
                : box
        );

        await persistState(nextBoxes, nextAccountBalance, nextTransaction);
    }, [boxes, persistState, selectedBox]);

    const handleDeposit = useCallback(async (amount: number) => {
        if (!selectedBox) return;

        if (!Number.isFinite(amount) || amount <= 0) {
            Alert.alert('Valor invalido', 'Digite um valor maior que zero.');
            return;
        }

        if (amount > accountBalance) {
            Alert.alert('Saldo insuficiente', 'Voce ainda nao tem saldo disponivel para guardar esse valor.');
            return;
        }

        await updateSelectedBoxValue(
            selectedBox.currentValue + amount,
            accountBalance - amount,
            createReserveTransaction(amount, 'despesa', 'Reserva'),
        );
        setDepositValue('');
    }, [accountBalance, selectedBox, updateSelectedBoxValue]);

    const handleCustomDeposit = useCallback(async () => {
        await handleDeposit(parseCurrencyInput(depositValue));
    }, [depositValue, handleDeposit]);

    const handleWithdraw = useCallback(async (amount: number) => {
        if (!selectedBox) return;

        if (!Number.isFinite(amount) || amount <= 0) {
            Alert.alert('Valor invalido', 'Digite um valor maior que zero.');
            return;
        }

        if (amount > selectedBox.currentValue) {
            Alert.alert('Valor indisponivel', 'Essa caixinha nao tem esse valor guardado.');
            return;
        }

        await updateSelectedBoxValue(
            selectedBox.currentValue - amount,
            accountBalance + amount,
            createReserveTransaction(amount, 'receita', 'Resgate da reserva'),
        );
        setWithdrawValue('');
    }, [accountBalance, selectedBox, updateSelectedBoxValue]);

    const handleCustomWithdraw = useCallback(async () => {
        await handleWithdraw(parseCurrencyInput(withdrawValue));
    }, [handleWithdraw, withdrawValue]);

    const handleWithdrawAll = useCallback(async () => {
        if (!selectedBox || selectedBox.currentValue <= 0) return;

        await updateSelectedBoxValue(
            0,
            accountBalance + selectedBox.currentValue,
            createReserveTransaction(selectedBox.currentValue, 'receita', 'Resgate da reserva'),
        );
        setWithdrawValue('');
    }, [accountBalance, selectedBox, updateSelectedBoxValue]);

    const handleDeleteBox = useCallback(() => {
        if (!selectedBox) return;

        Alert.alert(
            'Excluir caixinha',
            selectedBox.currentValue > 0
                ? 'O valor guardado volta para o saldo disponivel. Deseja excluir?'
                : 'Deseja excluir essa caixinha?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const nextBoxes = boxes.filter(box => box.id !== selectedBox.id);
                        const nextAccountBalance = accountBalance + selectedBox.currentValue;

                        setSelectedBoxId(null);
                        setDepositValue('');
                        setWithdrawValue('');
                        await persistState(
                            nextBoxes,
                            nextAccountBalance,
                            selectedBox.currentValue > 0
                                ? createReserveTransaction(selectedBox.currentValue, 'receita', 'Resgate da reserva')
                                : undefined,
                        );
                    },
                },
            ]
        );
    }, [accountBalance, boxes, persistState, selectedBox]);

    const handleBackToBoxes = useCallback(() => {
        setSelectedBoxId(null);
        setDepositValue('');
        setWithdrawValue('');
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadReserve();
        }, [loadReserve])
    );

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

                {selectedBox ? (
                    <View style={styles.detailPanel}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackToBoxes}
                            activeOpacity={0.78}
                        >
                            <Ionicons name="chevron-back-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.backButtonText}>Minhas caixinhas</Text>
                        </TouchableOpacity>

                        <View style={styles.detailTopRow}>
                            <View style={[styles.detailIcon, { backgroundColor: selectedBox.color + '22' }]}>
                                <Ionicons name={selectedBox.icon} size={34} color={selectedBox.color} />
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteBox}
                                activeOpacity={0.78}
                            >
                                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.detailTitle}>{selectedBox.title}</Text>
                        <Text style={styles.detailDescription}>{selectedBox.subtitle}</Text>

                        <View style={styles.reserveAmountCard}>
                            <Text style={styles.reserveAmountLabel}>Guardado nessa caixinha</Text>
                            <Text style={styles.reserveAmountValue}>{formatCurrency(selectedBox.currentValue)}</Text>
                        </View>

                        <Text style={styles.actionTitle}>Adicionar dinheiro</Text>
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

                        <View style={styles.moneyRow}>
                            <View style={styles.moneyInputWrap}>
                                <Text style={styles.moneyPrefix}>R$</Text>
                                <TextInput
                                    style={styles.moneyInput}
                                    value={depositValue}
                                    onChangeText={setDepositValue}
                                    placeholder="Digite o valor exato"
                                    placeholderTextColor={theme.colors.textFaint}
                                    keyboardType="numeric"
                                />
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.moneyPrimaryButton,
                                    !canDepositCustom && styles.moneyButtonDisabled,
                                ]}
                                onPress={handleCustomDeposit}
                                disabled={!canDepositCustom}
                                activeOpacity={0.78}
                            >
                                <Text style={[
                                    styles.moneyPrimaryButtonText,
                                    !canDepositCustom && styles.moneyButtonTextDisabled,
                                ]}>
                                    Guardar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {accountBalance <= 0 && (
                            <View style={styles.helperNotice}>
                                <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                                <Text style={styles.helperNoticeText}>
                                    Adicione uma receita no painel inicial para ter saldo disponivel e guardar dinheiro.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.actionTitle}>Retirar dinheiro</Text>
                        <View style={styles.moneyRow}>
                            <View style={styles.moneyInputWrap}>
                                <Text style={styles.moneyPrefix}>R$</Text>
                                <TextInput
                                    style={styles.moneyInput}
                                    value={withdrawValue}
                                    onChangeText={setWithdrawValue}
                                    placeholder="Digite o valor exato"
                                    placeholderTextColor={theme.colors.textFaint}
                                    keyboardType="numeric"
                                />
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.moneySecondaryButton,
                                    !canWithdrawCustom && styles.moneyButtonDisabled,
                                ]}
                                onPress={handleCustomWithdraw}
                                disabled={!canWithdrawCustom}
                                activeOpacity={0.78}
                            >
                                <Text style={[
                                    styles.moneySecondaryButtonText,
                                    !canWithdrawCustom && styles.moneyButtonTextDisabled,
                                ]}>
                                    Retirar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.withdrawButton, selectedBox.currentValue <= 0 && styles.withdrawButtonDisabled]}
                            onPress={handleWithdrawAll}
                            disabled={selectedBox.currentValue <= 0}
                            activeOpacity={0.78}
                        >
                            <Ionicons name="return-down-back-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.withdrawButtonText}>Resgatar tudo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {boxes.length > 0 && (
                            <View style={styles.boxesSection}>
                                <Text style={styles.sectionTitle}>Minhas caixinhas</Text>
                                <View style={styles.boxGrid}>
                                    {boxes.map(box => (
                                        <TouchableOpacity
                                            key={box.id}
                                            style={styles.savedBoxCard}
                                            activeOpacity={0.84}
                                            onPress={() => setSelectedBoxId(box.id)}
                                        >
                                            <View style={[styles.savedBoxArt, { backgroundColor: box.color + '20' }]}>
                                                <Ionicons name={box.icon} size={38} color={box.color} />
                                                <Text style={styles.savedBoxAmount}>
                                                    {formatCurrency(box.currentValue)}
                                                </Text>
                                            </View>
                                            <Text style={styles.savedBoxName} numberOfLines={2}>
                                                {box.title}
                                            </Text>
                                            <Text style={styles.savedBoxSubtitle} numberOfLines={2}>
                                                {box.subtitle}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.objectiveSection}>
                            <Text style={styles.objectiveTitle}>
                                {boxes.length > 0
                                    ? 'Criar nova caixinha'
                                    : 'Qual e o seu objetivo para essa caixinha?'}
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
                                        onPress={handleCreateCustomBox}
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
                                        onPress={() => handleCreateBox(objective)}
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
                    </>
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
        backgroundColor: 'transparent',
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
    sectionTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        lineHeight: 36,
        marginBottom: theme.spacing.lg,
    },
    boxesSection: {
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xxl,
    },
    boxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: theme.spacing.xl,
    },
    savedBoxCard: {
        width: '47%',
    },
    savedBoxArt: {
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
    savedBoxAmount: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.black,
        marginTop: theme.spacing.md,
    },
    savedBoxName: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
        lineHeight: 19,
    },
    savedBoxSubtitle: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        lineHeight: 17,
        marginTop: theme.spacing.xs,
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
    detailPanel: {
        marginTop: theme.spacing.sm,
        padding: theme.spacing.xl,
        borderRadius: theme.radius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.md,
    },
    backButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    backButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    detailTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    detailIcon: {
        width: 70,
        height: 70,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    deleteButton: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailTitle: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        lineHeight: 38,
    },
    detailDescription: {
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
    moneyRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    moneyInputWrap: {
        flex: 1,
        minHeight: 54,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
    },
    moneyPrefix: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
        marginRight: theme.spacing.xs,
    },
    moneyInput: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        paddingVertical: theme.spacing.sm,
    },
    moneyPrimaryButton: {
        minHeight: 54,
        minWidth: 92,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.base,
    },
    moneyPrimaryButtonText: {
        color: theme.colors.buddyBlack,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    moneySecondaryButton: {
        minHeight: 54,
        minWidth: 92,
        borderRadius: theme.radius.pill,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.base,
    },
    moneySecondaryButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    moneyButtonDisabled: {
        backgroundColor: theme.colors.backgroundSoft,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        opacity: 0.62,
    },
    moneyButtonTextDisabled: {
        color: theme.colors.textFaint,
    },
    helperNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primaryMuted,
        marginBottom: theme.spacing.xl,
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
