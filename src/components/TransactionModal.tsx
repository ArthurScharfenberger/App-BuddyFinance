// =============================================================================
// BuddyFinance App — src/components/TransactionModal.tsx
// Modal bottom-sheet para registrar receitas e despesas.
// Suporta sugestões rápidas, KeyboardAvoidingView e validação.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme/colors';
import { TransactionType } from './TransactionItem';

// ── Props ─────────────────────────────────────────────────────────────────────

interface TransactionModalProps {
    visible: boolean;
    type: TransactionType;
    initialDesc?: string;
    onClose: () => void;
    onSave: (amount: number, description: string, type: TransactionType) => void;
}

// ── Sugestões por tipo ────────────────────────────────────────────────────────

const SUGGESTIONS: Record<TransactionType, string[]> = {
    receita:  ['Salário', 'Freelance', 'Presente', 'Venda', 'Investimento'],
    despesa:  ['iFood', 'Mercado', 'Uber', 'Aluguel', 'Netflix', 'Conta de Luz'],
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function TransactionModal({
    visible,
    type,
    initialDesc = '',
    onClose,
    onSave,
}: TransactionModalProps) {
    const [amount, setAmount]           = useState('');
    const [description, setDescription] = useState('');

    const isReceita  = type === 'receita';
    const accentColor = isReceita ? theme.colors.success : theme.colors.danger;

    // Preenche a descrição automaticamente quando aberto via atalho de categoria
    useEffect(() => {
        if (visible) setDescription(initialDesc);
    }, [visible, initialDesc]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSave = () => {
        const numeric = parseFloat(amount.replace(',', '.'));

        if (isNaN(numeric) || numeric <= 0) {
            Alert.alert('Valor inválido', 'Digite um valor maior que zero.');
            return;
        }

        onSave(numeric, description.trim() || (isReceita ? 'Receita' : 'Despesa'), type);
        handleClose();
    };

    const handleClose = () => {
        setAmount('');
        setDescription('');
        onClose();
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.sheet}
                >
                    {/* Alça de arraste */}
                    <View style={styles.handle} />

                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: accentColor }]}>
                            {isReceita ? 'Adicionar Receita' : 'Adicionar Despesa'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* Input de valor */}
                        <Text style={styles.inputLabel}>Valor</Text>
                        <TextInput
                            style={[styles.input, styles.inputLarge]}
                            placeholder="R$ 0,00"
                            placeholderTextColor={theme.colors.textFaint}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />

                        {/* Input de descrição */}
                        <Text style={styles.inputLabel}>Descrição</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Almoço no restaurante"
                            placeholderTextColor={theme.colors.textFaint}
                            value={description}
                            onChangeText={setDescription}
                            returnKeyType="done"
                        />

                        {/* Sugestões rápidas */}
                        <Text style={styles.suggestLabel}>Sugestões rápidas</Text>
                        <View style={styles.suggestRow}>
                            {SUGGESTIONS[type].map((sug) => (
                                <TouchableOpacity
                                    key={sug}
                                    style={[
                                        styles.badge,
                                        description === sug && {
                                            backgroundColor: accentColor + '25',
                                            borderColor: accentColor,
                                        },
                                    ]}
                                    onPress={() => setDescription(sug)}
                                >
                                    <Text style={[
                                        styles.badgeText,
                                        description === sug && { color: accentColor },
                                    ]}>
                                        {sug}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Botões de ação */}
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: accentColor }]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xxxl,
        borderTopLeftRadius: theme.radius.xxl,
        borderTopRightRadius: theme.radius.xxl,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.pill,
        alignSelf: 'center',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
    },
    closeBtn: {
        padding: theme.spacing.xs,
    },
    inputLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.base,
        fontSize: theme.typography.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputLarge: {
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.bold,
        letterSpacing: -0.5,
    },
    suggestLabel: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.sm,
        marginBottom: theme.spacing.sm,
    },
    suggestRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.xs,
    },
    badge: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    badgeText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    cancelBtn: {
        flex: 1,
        padding: theme.spacing.base,
        alignItems: 'center',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelText: {
        color: theme.colors.textMuted,
        fontWeight: theme.typography.bold,
    },
    saveBtn: {
        flex: 2,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
    },
    saveText: {
        color: '#ffffff',
        fontWeight: theme.typography.bold,
        fontSize: theme.typography.base,
    },
});
