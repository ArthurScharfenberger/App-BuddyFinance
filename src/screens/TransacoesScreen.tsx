// =============================================================================
// BuddyFinance App — src/screens/TransacoesScreen.tsx
// Histórico completo de transações com filtros por tipo e resumo mensal.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TransactionItem, { Transaction } from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import { theme } from '../theme/colors';

// ── Constantes ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@buddyfinance:data_v2';

type FilterType = 'todas' | 'receita' | 'despesa';

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'todas',   label: 'Todas'    },
    { key: 'receita', label: 'Receitas' },
    { key: 'despesa', label: 'Despesas' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

/** Agrupa transações por mês/ano */
function groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
        const date  = new Date(t.date);
        const key   = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        if (!acc[label]) acc[label] = [];
        acc[label].push(t);
        return acc;
    }, {});
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function TransacoesScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter]             = useState<FilterType>('todas');
    const [refreshing, setRefreshing]     = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType]       = useState<'receita' | 'despesa'>('despesa');

    // ── Persistência ──────────────────────────────────────────────────────────

    const loadData = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setTransactions(parsed.transactions ?? []);
            }
        } catch (error) {
            console.error('[TransacoesScreen] Erro ao carregar:', error);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSave = useCallback(async (
        amount: number,
        description: string,
        type: 'receita' | 'despesa',
    ) => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const current = saved ? JSON.parse(saved) : { transactions: [], balance: 0 };

            const newTx: Transaction = {
                id:     Date.now().toString(),
                title:  description,
                amount,
                type,
                date:   new Date().toISOString(),
            };

            const newBalance = type === 'receita'
                ? current.balance + amount
                : current.balance - amount;

            const updated = [newTx, ...current.transactions];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                transactions: updated,
                balance: newBalance,
            }));
            setTransactions(updated);
        } catch (error) {
            console.error('[TransacoesScreen] Erro ao salvar:', error);
        }
    }, []);

    // ── Dados filtrados ───────────────────────────────────────────────────────

    const filtered = filter === 'todas'
        ? transactions
        : transactions.filter(t => t.type === filter);

    const grouped = groupByMonth(filtered);

    const totalReceitas = transactions
        .filter(t => t.type === 'receita')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalDespesas = transactions
        .filter(t => t.type === 'despesa')
        .reduce((acc, t) => acc + t.amount, 0);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
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
                <View style={styles.headerSection}>
                    <Text style={styles.screenTitle}>Histórico</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            setModalType('despesa');
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* ── Resumo do mês ── */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { borderColor: theme.colors.primary + '40' }]}>
                        <Ionicons name="arrow-up-circle-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.summaryLabel}>Total Receitas</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                            {formatCurrency(totalReceitas)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { borderColor: theme.colors.danger + '40' }]}>
                        <Ionicons name="arrow-down-circle-outline" size={18} color={theme.colors.danger} />
                        <Text style={styles.summaryLabel}>Total Despesas</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                            {formatCurrency(totalDespesas)}
                        </Text>
                    </View>
                </View>

                {/* ── Filtros ── */}
                <View style={styles.filterRow}>
                    {FILTERS.map(({ key, label }) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.filterBtn,
                                filter === key && styles.filterBtnActive,
                            ]}
                            onPress={() => setFilter(key)}
                        >
                            <Text style={[
                                styles.filterText,
                                filter === key && styles.filterTextActive,
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Lista agrupada por mês ── */}
                <View style={styles.listSection}>
                    {Object.keys(grouped).length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="receipt-outline"
                                size={48}
                                color={theme.colors.textFaint}
                            />
                            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                        </View>
                    ) : (
                        Object.entries(grouped).map(([month, items]) => (
                            <View key={month}>
                                {/* Rótulo do mês */}
                                <View style={styles.monthHeader}>
                                    <Text style={styles.monthLabel}>{month}</Text>
                                    <Text style={styles.monthCount}>{items.length} transações</Text>
                                </View>
                                {items.map(item => (
                                    <TransactionItem key={item.id} transaction={item} />
                                ))}
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            <TransactionModal
                visible={modalVisible}
                type={modalType}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
            />
        </SafeAreaView>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        letterSpacing: -0.5,
    },
    addBtn: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
    },

    // Resumo
    summaryRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        alignItems: 'flex-start',
        gap: theme.spacing.xs,
    },
    summaryLabel: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: theme.typography.md,
        fontWeight: theme.typography.bold,
    },

    // Filtros
    filterRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 4,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.radius.sm,
    },
    filterBtnActive: {
        backgroundColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
    filterTextActive: {
        color: '#ffffff',
    },

    // Lista
    listSection: {
        paddingBottom: theme.spacing.xxxl,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.base,
    },
    monthLabel: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
    monthCount: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
    },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
        gap: theme.spacing.md,
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.base,
    },
});
