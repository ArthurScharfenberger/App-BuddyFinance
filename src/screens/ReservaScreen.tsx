// =============================================================================
// BuddyFinance App - src/screens/ReservaScreen.tsx
// Area de reserva com saldo disponivel e escolha de objetivo para a caixinha.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BalanceCard from '../components/BalanceCard';
import { theme } from '../theme/colors';

const STORAGE_KEY = '@buddyfinance:emergency_reserve_v1';
const ACCOUNT_STORAGE_KEY = '@buddyfinance:data_v2';

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
    const [accountBalance, setAccountBalance] = useState<number>(8200);
    const [selectedObjective, setSelectedObjective] = useState<string>('Reserva de emergencia');
    const [isLoaded, setIsLoaded] = useState(false);

    const loadReserve = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setSelectedObjective(parsed.boxName ?? 'Reserva de emergencia');
            }

            const accountSaved = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
            if (accountSaved) {
                const parsedAccount = JSON.parse(accountSaved);
                setAccountBalance(parsedAccount.balance ?? 8200);
            }
        } catch (error) {
            console.error('[ReservaScreen] Erro ao carregar reserva:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveObjective = useCallback(async (objective: ObjectiveOption) => {
        setSelectedObjective(objective.title);

        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const currentData = saved ? JSON.parse(saved) : {};

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...currentData,
                boxName: objective.title,
                boxDescription: objective.subtitle,
            }));
        } catch (error) {
            console.error('[ReservaScreen] Erro ao salvar objetivo:', error);
        }
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

                <View style={styles.objectiveSection}>
                    <Text style={styles.objectiveTitle}>
                        Qual e o seu objetivo para essa caixinha?
                    </Text>

                    <View style={styles.objectiveGrid}>
                        {OBJECTIVE_OPTIONS.map((objective) => {
                            const isSelected = selectedObjective === objective.title;

                            return (
                                <TouchableOpacity
                                    key={objective.title}
                                    style={styles.objectiveCard}
                                    activeOpacity={0.84}
                                    onPress={() => saveObjective(objective)}
                                >
                                    <View style={[
                                        styles.objectiveArt,
                                        objective.isCustom
                                            ? styles.objectiveArtCustom
                                            : { backgroundColor: objective.color + '20' },
                                        isSelected && styles.objectiveArtSelected,
                                    ]}>
                                        <Ionicons
                                            name={objective.icon}
                                            size={objective.isCustom ? 34 : 40}
                                            color={objective.isCustom ? theme.colors.textPrimary : objective.color}
                                        />
                                        {isSelected && (
                                            <View style={styles.selectedBadge}>
                                                <Ionicons name="checkmark" size={14} color={theme.colors.background} />
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.objectiveName} numberOfLines={2}>
                                        {objective.title}
                                    </Text>
                                    <Text style={styles.objectiveSubtitle} numberOfLines={2}>
                                        {objective.subtitle}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
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
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
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
    objectiveArtSelected: {
        borderColor: theme.colors.success,
        borderWidth: 2,
    },
    objectiveArtCustom: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    selectedBadge: {
        position: 'absolute',
        right: theme.spacing.sm,
        top: theme.spacing.sm,
        width: 24,
        height: 24,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        borderWidth: 2,
        borderColor: theme.colors.background,
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
