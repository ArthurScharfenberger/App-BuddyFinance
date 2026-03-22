// =============================================================================
// BuddyFinance App — src/screens/HomeScreen.tsx
// Tela principal: saldo, resumo, ações rápidas e transações recentes.
// Dados persistidos localmente via AsyncStorage.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BalanceCard from '../components/BalanceCard';
import BuddyMascot from '../components/BuddyMascot';
import CustomButton from '../components/CustomButton';
import TransactionItem, { Transaction, TransactionType } from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import { theme } from '../theme/colors';

// ── Constantes ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@buddyfinance:data_v2';

/** Categorias de atalho rápido */
const QUICK_CATEGORIES = [
    { icon: 'fast-food' as const, label: 'iFood', color: '#EA1D2C' },
    { icon: 'cart' as const, label: 'Mercado', color: '#4CAF50' },
    { icon: 'car' as const, label: 'Uber', color: theme.colors.textPrimary },
    { icon: 'flash' as const, label: 'Contas', color: '#F59E0B' },
    { icon: 'medical' as const, label: 'Saúde', color: '#06B6D4' },
    { icon: 'school' as const, label: 'Educação', color: '#8B5CF6' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formata valor numérico para moeda brasileira */
const formatCurrency = (value: number): string =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

/** Retorna saudação de acordo com o horário */
const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
};

/** Retorna mensagem do mascote baseada no estado financeiro */
const getMascotMessage = (balance: number, percent: number): {
    message: string;
    variant: 'default' | 'warning' | 'danger';
} => {
    if (balance < 0) return { message: 'Saldo negativo! Bora cortar gastos?', variant: 'danger' };
    if (percent > 0.9) return { message: 'Quase no limite do orçamento. Cuidado!', variant: 'warning' };
    if (percent > 0.6) return { message: 'Mais da metade do orçamento usado.', variant: 'warning' };
    return { message: 'Planejamento em dia! Continue assim.', variant: 'default' };
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
    // Estado principal
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Estado do modal
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>('receita');
    const [initialDescription, setInitialDescription] = useState('');

    // ── Persistência ──────────────────────────────────────────────────────────

    const loadData = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setTransactions(parsed.transactions ?? []);
                setBalance(parsed.balance ?? 0);
            }
        } catch (error) {
            console.error('[HomeScreen] Erro ao carregar dados:', error);
        }
    }, []);

    const saveData = useCallback(async (newTransactions: Transaction[], newBalance: number) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                transactions: newTransactions,
                balance: newBalance,
            }));
        } catch (error) {
            console.error('[HomeScreen] Erro ao salvar dados:', error);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSaveTransaction = useCallback((
        amount: number,
        description: string,
        type: TransactionType,
    ) => {
        const newBalance = type === 'receita'
            ? balance + amount
            : balance - amount;

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            title: description,
            amount,
            type,
            date: new Date().toISOString(),
        };

        const updatedTransactions = [newTransaction, ...transactions];
        setBalance(newBalance);
        setTransactions(updatedTransactions);
        saveData(updatedTransactions, newBalance);
    }, [balance, transactions, saveData]);

    const openModal = useCallback((type: TransactionType, desc = '') => {
        setTransactionType(type);
        setInitialDescription(desc);
        setModalVisible(true);
    }, []);

    // ── Cálculos derivados ────────────────────────────────────────────────────

    const totalReceitas = transactions
        .filter(t => t.type === 'receita')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalDespesas = transactions
        .filter(t => t.type === 'despesa')
        .reduce((acc, t) => acc + t.amount, 0);

    const percentualGasto = totalReceitas > 0
        ? Math.min(totalDespesas / totalReceitas, 1)
        : 0;

    const mascot = getMascotMessage(balance, percentualGasto);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >

                {/* ── Cabeçalho ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View>
                            <Text style={styles.greeting}>{getGreeting()},</Text>
                            <Text style={styles.username}>Visitante</Text>
                        </View>
                    </View>

                    {/* Sino de notificações */}
                    <TouchableOpacity style={styles.notifBtn}>
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color={theme.colors.textPrimary}
                        />
                        {/* Ponto de alerta quando há transações */}
                        {transactions.length > 0 && <View style={styles.notifDot} />}
                    </TouchableOpacity>
                </View>

                {/* ── Mascote ── */}
                <BuddyMascot message={mascot.message} variant={mascot.variant} />

                {/* ── Card de saldo ── */}
                <BalanceCard
                    balance={formatCurrency(balance)}
                    receitas={formatCurrency(totalReceitas)}
                    despesas={formatCurrency(totalDespesas)}
                />

                {/* ── Barra de uso do orçamento ── */}
                <View style={styles.budgetCard}>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Uso do Orçamento</Text>
                        <Text style={styles.budgetPercent}>
                            {(percentualGasto * 100).toFixed(0)}%
                        </Text>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${percentualGasto * 100}%` as any,
                                backgroundColor: percentualGasto > 0.8
                                    ? theme.colors.danger
                                    : theme.colors.primary,
                            },
                        ]} />
                    </View>
                </View>

                {/* ── Botões de ação ── */}
                <View style={styles.actionRow}>
                    <CustomButton
                        title="+ Receita"
                        variant="primary"
                        icon="add-circle-outline"
                        onPress={() => openModal('receita')}
                    />
                    <CustomButton
                        title="- Despesa"
                        variant="danger"
                        icon="remove-circle-outline"
                        onPress={() => openModal('despesa')}
                    />
                </View>

                {/* ── Atalhos de categoria ── */}
                <Text style={styles.sectionTitle}>Sugestões de hoje</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesRow}
                    contentContainerStyle={{ paddingRight: theme.spacing.base }}
                >
                    {QUICK_CATEGORIES.map(({ icon, label, color }) => (
                        <TouchableOpacity
                            key={label}
                            style={styles.catBtn}
                            onPress={() => openModal('despesa', label)}
                        >
                            <View style={[styles.catIcon, { backgroundColor: color + '18' }]}>
                                <Ionicons name={icon} size={22} color={color} />
                            </View>
                            <Text style={styles.catLabel}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Atividades recentes ── */}
                <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="receipt-outline"
                                size={40}
                                color={theme.colors.textFaint}
                            />
                            <Text style={styles.emptyText}>
                                Nenhuma movimentação ainda.
                            </Text>
                            <Text style={styles.emptySubText}>
                                Adicione sua primeira receita ou despesa.
                            </Text>
                        </View>
                    ) : (
                        transactions.slice(0, 5).map(item => (
                            <TransactionItem key={item.id} transaction={item} />
                        ))
                    )}
                </View>

            </ScrollView>

            {/* ── Modal de transação ── */}
            <TransactionModal
                visible={modalVisible}
                type={transactionType}
                initialDesc={initialDescription}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveTransaction}
            />

        </SafeAreaView>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },

    // Cabeçalho
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
    },
    greeting: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    username: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
    },
    notifBtn: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm + 2,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.pill,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },

    // Orçamento
    budgetCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    budgetLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
    },
    budgetPercent: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
    progressBg: {
        height: 6,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.pill,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: theme.radius.pill,
    },

    // Ações
    actionRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xl,
    },

    // Categorias
    sectionTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.md,
        fontWeight: theme.typography.bold,
        marginBottom: theme.spacing.md,
    },
    categoriesRow: {
        marginBottom: theme.spacing.xl,
    },
    catBtn: {
        alignItems: 'center',
        marginRight: theme.spacing.lg,
    },
    catIcon: {
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.xs,
    },
    catLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.xs,
    },

    // Recentes
    recentSection: {
        marginBottom: theme.spacing.xxxl,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        marginTop: theme.spacing.md,
    },
    emptySubText: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.sm,
        marginTop: theme.spacing.xs,
    },
});
