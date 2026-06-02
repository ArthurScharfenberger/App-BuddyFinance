// =============================================================================
// BuddyFinance App — src/screens/HomeScreen.tsx
// Tela principal: saldo, resumo, ações rápidas e transações recentes.
// Dados persistidos localmente via AsyncStorage.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
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
    { icon: 'fast-food' as const, label: 'iFood', color: theme.colors.ifoodRed },
    { icon: 'cart' as const, label: 'Mercado', color: theme.colors.success },
    { icon: 'car' as const, label: 'Uber', color: theme.colors.textPrimary },
    { icon: 'flash' as const, label: 'Contas', color: theme.colors.warning },
    { icon: 'medical' as const, label: 'Saúde', color: '#06B6D4' },
    { icon: 'school' as const, label: 'Educação', color: '#8B5CF6' },
] as const;

const MARKET_MOVERS = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'Cripto',
        price: 'US$ 103.240',
        change: '+7,8%',
        direction: 'up',
        note: 'Alta forte em cripto',
        icon: 'logo-bitcoin' as const,
    },
    {
        symbol: 'NVDA',
        name: 'Nvidia',
        type: 'Ação EUA',
        price: 'US$ 142,30',
        change: '+5,4%',
        direction: 'up',
        note: 'Tecnologia em destaque',
        icon: 'hardware-chip' as const,
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        type: 'Cripto',
        price: 'US$ 168,10',
        change: '-6,2%',
        direction: 'down',
        note: 'Correção no dia',
        icon: 'cube' as const,
    },
    {
        symbol: 'PETR4',
        name: 'Petrobras PN',
        type: 'Ação BR',
        price: 'R$ 38,42',
        change: '+3,1%',
        direction: 'up',
        note: 'Volume acima da média',
        icon: 'flame' as const,
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'Cripto',
        price: 'US$ 3.420',
        change: '-4,7%',
        direction: 'down',
        note: 'Queda entre criptoativos',
        icon: 'diamond-outline' as const,
    },
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
    const { width } = useWindowDimensions();
    const marketCarouselRef = useRef<ScrollView>(null);
    const marketCardWidth = Math.max(width - theme.spacing.xl * 2, 280);
    const marketStep = marketCardWidth + theme.spacing.md;

    // Estado principal
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [marketIndex, setMarketIndex] = useState(0);

    // Estado do modal
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>('receita');
    const [initialDescription, setInitialDescription] = useState('');

    // Animação da barra de orçamento
    const budgetAnimRef = useRef(new Animated.Value(0)).current;

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

    useEffect(() => {
        const timer = setInterval(() => {
            setMarketIndex((current) => {
                const next = (current + 1) % MARKET_MOVERS.length;
                marketCarouselRef.current?.scrollTo({
                    x: next * marketStep,
                    animated: true,
                });
                return next;
            });
        }, 3500);

        return () => clearInterval(timer);
    }, [marketStep]);

    // Animar barra de orçamento quando percentual mudar
    useEffect(() => {
        Animated.timing(budgetAnimRef, {
            toValue: percentualGasto * 100,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [percentualGasto, budgetAnimRef]);

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

                {/* ── Barra de uso do orçamento ── */}
                <View style={styles.budgetCard}>
                    <View style={styles.budgetRow}>
                        <View style={styles.budgetLabelRow}>
                            <Ionicons 
                                name="pie-chart-outline" 
                                size={18} 
                                color={theme.colors.primary}
                                style={styles.budgetIcon}
                            />
                            <Text style={styles.budgetLabel}>Uso do Orçamento</Text>
                        </View>
                        <Text style={[
                            styles.budgetPercent,
                            {
                                color: percentualGasto > 0.8
                                    ? theme.colors.danger
                                    : percentualGasto > 0.5
                                    ? theme.colors.warning
                                    : theme.colors.success,
                            },
                        ]}>
                            {(percentualGasto * 100).toFixed(0)}%
                        </Text>
                    </View>
                    <View style={styles.progressBg}>
                        <Animated.View style={[
                            styles.progressFill,
                            {
                                width: budgetAnimRef.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                                backgroundColor: percentualGasto > 0.8
                                    ? theme.colors.danger
                                    : percentualGasto > 0.5
                                    ? theme.colors.warning
                                    : theme.colors.success,
                            },
                        ]} />
                    </View>
                </View>

                {/* ── Card de saldo ── */}
                <BalanceCard
                    balance={formatCurrency(balance)}
                    receitas={formatCurrency(totalReceitas)}
                    despesas={formatCurrency(totalDespesas)}
                    totalReceitas={totalReceitas}
                    totalBalance={balance}
                />

                {/* ── Botões de ação ── */}
                <View style={styles.actionRow}>
                    <CustomButton
                        title="Receita"
                        variant="primary"
                        icon="add-circle-outline"
                        accessibilityLabel="Adicionar receita"
                        onPress={() => openModal('receita')}
                    />
                    <CustomButton
                        title="Despesa"
                        variant="danger"
                        icon="remove-circle-outline"
                        accessibilityLabel="Adicionar despesa"
                        onPress={() => openModal('despesa')}
                    />
                </View>

                {/* ── Carrossel de Mercado ── */}
                <View style={styles.marketSection}>
                    <View style={styles.marketHeader}>
                        <Text style={[styles.sectionTitle, styles.marketTitle]}>
                            Radar do Mercado
                        </Text>
                        <Text style={styles.marketHint}>Altas e quedas</Text>
                    </View>

                    <ScrollView
                        ref={marketCarouselRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        decelerationRate="fast"
                        snapToInterval={marketStep}
                        snapToAlignment="start"
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            const nextIndex = Math.round(nativeEvent.contentOffset.x / marketStep);
                            setMarketIndex(Math.min(nextIndex, MARKET_MOVERS.length - 1));
                        }}
                    >
                        {MARKET_MOVERS.map((asset) => {
                            const isUp = asset.direction === 'up';
                            const accentColor = isUp ? theme.colors.success : theme.colors.ifoodRed;

                            return (
                                <View
                                    key={asset.symbol}
                                    style={[styles.marketCard, { width: marketCardWidth }]}
                                >
                                    <View style={styles.marketTopRow}>
                                        <View style={styles.marketAssetRow}>
                                            <View style={[
                                                styles.marketIcon,
                                                { backgroundColor: accentColor + '18' },
                                            ]}>
                                                <Ionicons
                                                    name={asset.icon}
                                                    size={24}
                                                    color={accentColor}
                                                />
                                            </View>
                                            <View>
                                                <Text style={styles.marketSymbol}>{asset.symbol}</Text>
                                                <Text style={styles.marketName}>{asset.name}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.marketBadge, { borderColor: accentColor }]}>
                                            <Text style={[styles.marketBadgeText, { color: accentColor }]}>
                                                {asset.type}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.marketBottomRow}>
                                        <View>
                                            <Text style={styles.marketPrice}>{asset.price}</Text>
                                            <Text style={styles.marketNote}>{asset.note}</Text>
                                        </View>

                                        <Text style={[styles.marketChange, { color: accentColor }]}>
                                            {asset.change}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.marketDots}>
                        {MARKET_MOVERS.map((asset, index) => (
                            <View
                                key={asset.symbol}
                                style={[
                                    styles.marketDot,
                                    index === marketIndex && styles.marketDotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* ── Atalhos de categoria ── */}
                <Text style={styles.sectionTitle}>Despesas Rápidas</Text>
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
                                <Ionicons name={icon} size={30} color={color} />
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
        backgroundColor: theme.colors.background,
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
        width: 58,
        height: 58,
        borderRadius: theme.radius.md,
        backgroundColor: 'transparent',
        ...theme.shadow.sm,
    },
    greeting: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    username: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
    },
    notifBtn: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm + 2,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.sm,
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
    // Mercado
    marketSection: {
        marginBottom: theme.spacing.lg,
    },
    marketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    marketTitle: {
        marginBottom: 0,
    },
    marketHint: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    marketCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.base,
        marginRight: theme.spacing.md,
        ...theme.shadow.sm,
    },
    marketTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    marketAssetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    marketIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    marketSymbol: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
    },
    marketName: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        marginTop: 2,
    },
    marketBadge: {
        borderWidth: 1,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    marketBadgeText: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
    },
    marketBottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },
    marketPrice: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.black,
    },
    marketNote: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.xs,
        marginTop: 4,
    },
    marketChange: {
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.black,
    },
    marketDots: {
        flexDirection: 'row',
        alignSelf: 'center',
        gap: theme.spacing.xs,
        marginTop: theme.spacing.sm,
    },
    marketDot: {
        width: 6,
        height: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.border,
    },
    marketDotActive: {
        width: 22,
        backgroundColor: theme.colors.primary,
    },

    budgetCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.base + theme.spacing.sm,
        borderRadius: theme.radius.xl,
        marginBottom: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        ...theme.shadow.lg,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    budgetLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    budgetIcon: {
        marginRight: theme.spacing.xs,
    },
    budgetLabel: {
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
    },
    budgetPercent: {
        fontFamily: theme.typography.fontFamily.brand,
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.black,
    },
    progressBg: {
        height: 12,
        backgroundColor: theme.colors.backgroundSoft,
        borderRadius: theme.radius.pill,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        fontFamily: theme.typography.fontFamily.brand,
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
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    catLabel: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.body,
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
        fontFamily: theme.typography.fontFamily.body,
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
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        marginTop: theme.spacing.md,
    },
    emptySubText: {
        color: theme.colors.textFaint,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.sm,
        marginTop: theme.spacing.xs,
    },
});
