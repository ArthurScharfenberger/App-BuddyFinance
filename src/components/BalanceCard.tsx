// =============================================================================
// BuddyFinance App — src/components/BalanceCard.tsx
// Card de saldo disponível — painel azul igual ao hero do site.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BalanceCardProps {
    balance: string;
    receitas: string;
    despesas: string;
    totalReceitas?: number;
    totalBalance?: number;
    showSummary?: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function BalanceCard({
    balance,
    receitas,
    despesas,
    totalReceitas = 0,
    totalBalance = 0,
    showSummary = true,
}: BalanceCardProps) {
    const receitasIsNegative = totalReceitas < 0;
    const balanceIsNegative = totalBalance < 0;
    return (
        <View style={styles.card}>

            {/* Cabeçalho: ícone + rótulo */}
            <View style={styles.header}>
                <Ionicons name="wallet-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.label}>Saldo Disponível</Text>
            </View>

            {/* Valor principal */}
            <Text style={[
                styles.balance,
                !showSummary ? styles.balanceOnly : undefined,
                balanceIsNegative ? { color: theme.colors.danger } : undefined
            ]}>
                {balance}
            </Text>

            {showSummary && (
                <>
                    {/* Divisor */}
                    <View style={styles.divider} />

                    {/* Resumo: receitas e despesas lado a lado */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryIconRow}>
                                <Ionicons
                                    name="arrow-up-circle-outline"
                                    size={14}
                                    color={receitasIsNegative ? theme.colors.danger : theme.colors.success}
                                />
                                <Text style={styles.summaryLabel}>Receitas</Text>
                            </View>
                            <Text style={[
                                styles.summaryValue,
                                receitasIsNegative ? { color: theme.colors.danger } : undefined
                            ]}>
                                {receitas}
                            </Text>
                        </View>

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryItem}>
                            <View style={styles.summaryIconRow}>
                                <Ionicons name="arrow-down-circle-outline" size={14} color={theme.colors.danger} />
                                <Text style={styles.summaryLabel}>Despesas</Text>
                            </View>
                            <Text style={styles.summaryValue}>{despesas}</Text>
                        </View>
                    </View>
                </>
            )}

        </View>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.secondary,
        padding: theme.spacing.xl,
        borderRadius: theme.radius.xxl,
        marginBottom: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        ...theme.shadow.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    label: {
        color: 'rgba(244,247,251,0.76)',
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginLeft: theme.spacing.xs,
    },
    balance: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xxxl,
        fontWeight: theme.typography.black,
        marginBottom: theme.spacing.lg,
    },
    balanceOnly: {
        marginBottom: 0,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(30,167,255,0.22)',
        marginBottom: theme.spacing.base,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
    },
    summaryIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryLabel: {
        color: 'rgba(244,247,251,0.76)',
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.md,
        fontWeight: theme.typography.bold,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: theme.spacing.base,
    },
});
