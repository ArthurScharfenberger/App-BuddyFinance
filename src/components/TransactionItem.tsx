// =============================================================================
// BuddyFinance App — src/components/TransactionItem.tsx
// Item de transação exibido nas listas de histórico e na home.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TransactionType = 'receita' | 'despesa';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    date: string; // ISO string — ex: new Date().toISOString()
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TransactionItemProps {
    transaction: Transaction;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formata a data de ISO para "dd/mm/yyyy às hh:mm" */
function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins  = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${mins}`;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function TransactionItem({ transaction }: TransactionItemProps) {
    const isReceita = transaction.type === 'receita';

    const color     = isReceita ? theme.colors.success : theme.colors.danger;
    const colorBg   = isReceita ? theme.colors.successMuted : theme.colors.dangerMuted;
    const iconName  = isReceita ? 'arrow-up-circle' : 'arrow-down-circle';
    const signal    = isReceita ? '+' : '-';

    return (
        <View style={styles.container}>

            {/* Ícone circular */}
            <View style={[styles.iconWrapper, { backgroundColor: colorBg }]}>
                <Ionicons name={iconName} size={22} color={color} />
            </View>

            {/* Título e data */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {transaction.title}
                </Text>
                <Text style={styles.date}>
                    {formatDate(transaction.date)}
                </Text>
            </View>

            {/* Valor */}
            <Text style={[styles.amount, { color }]}>
                {signal} R$ {transaction.amount.toFixed(2).replace('.', ',')}
            </Text>

        </View>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    iconWrapper: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        marginRight: theme.spacing.md,
    },
    info: {
        flex: 1,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.semibold,
    },
    date: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
        marginTop: 3,
    },
    amount: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
});
