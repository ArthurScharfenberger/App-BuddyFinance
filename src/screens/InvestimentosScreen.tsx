// =============================================================================
// BuddyFinance App — src/screens/InvestimentosScreen.tsx
// Analisador de mercado em tempo real — espelho mobile do site.
// Atualização automática a cada 30 segundos.
// TODO: substituir MOCK_DATA pelo fetch real da API (ex: Brapi, Yahoo Finance).
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme/colors';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Asset {
    symbol:    string;
    name:      string;
    price:     string;
    change:    string;
    trend:     'up' | 'down';
    category:  'ibovespa' | 'cripto' | 'fii';
}

type CategoryFilter = 'ibovespa' | 'cripto' | 'fii';

// ── Dados simulados ───────────────────────────────────────────────────────────
// TODO: substituir por fetch real quando API estiver disponível.

const MOCK_DATA: Asset[] = [
    // Ibovespa
    { symbol: 'PETR4',  name: 'Petrobras',       price: 'R$ 36,42',    change: '+1.85%', trend: 'up',   category: 'ibovespa' },
    { symbol: 'VALE3',  name: 'Vale',             price: 'R$ 61,80',    change: '-0.72%', trend: 'down', category: 'ibovespa' },
    { symbol: 'ITUB4',  name: 'Itaú Unibanco',   price: 'R$ 34,15',    change: '+0.44%', trend: 'up',   category: 'ibovespa' },
    { symbol: 'BBDC4',  name: 'Bradesco',         price: 'R$ 12,90',    change: '-1.10%', trend: 'down', category: 'ibovespa' },
    { symbol: 'MGLU3',  name: 'Magazine Luiza',   price: 'R$ 8,55',     change: '+2.30%', trend: 'up',   category: 'ibovespa' },
    // Cripto
    { symbol: 'BTC',    name: 'Bitcoin',          price: 'R$ 315.200',  change: '+3.12%', trend: 'up',   category: 'cripto' },
    { symbol: 'ETH',    name: 'Ethereum',         price: 'R$ 14.850',   change: '+1.80%', trend: 'up',   category: 'cripto' },
    { symbol: 'SOL',    name: 'Solana',           price: 'R$ 862,00',   change: '-2.40%', trend: 'down', category: 'cripto' },
    // FIIs
    { symbol: 'MXRF11', name: 'Maxi Renda',       price: 'R$ 10,42',    change: '+0.19%', trend: 'up',   category: 'fii' },
    { symbol: 'HGLG11', name: 'CGHG Logística',   price: 'R$ 152,80',   change: '-0.38%', trend: 'down', category: 'fii' },
    { symbol: 'KNRI11', name: 'Kinea Renda',       price: 'R$ 130,50',   change: '+0.62%', trend: 'up',   category: 'fii' },
];

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
    { key: 'ibovespa', label: 'Ibovespa' },
    { key: 'cripto',   label: 'Cripto'   },
    { key: 'fii',      label: 'FIIs'     },
];

const UPDATE_INTERVAL_MS = 30_000; // 30 segundos

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formata o timestamp de última atualização */
const formatTime = (date: Date): string =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// ── Componente: AssetRow ──────────────────────────────────────────────────────

function AssetRow({ asset }: { asset: Asset }) {
    const isUp    = asset.trend === 'up';
    const color   = isUp ? theme.colors.success : theme.colors.danger;
    const iconName = isUp ? 'trending-up' : 'trending-down';

    return (
        <View style={assetStyles.row}>
            {/* Símbolo e nome */}
            <View style={assetStyles.info}>
                <Text style={assetStyles.symbol}>{asset.symbol}</Text>
                <Text style={assetStyles.name}>{asset.name}</Text>
            </View>

            {/* Tendência */}
            <View style={[assetStyles.trendBadge, { backgroundColor: color + '18' }]}>
                <Ionicons name={iconName} size={14} color={color} />
            </View>

            {/* Preço e variação */}
            <View style={assetStyles.priceCol}>
                <Text style={assetStyles.price}>{asset.price}</Text>
                <Text style={[assetStyles.change, { color }]}>{asset.change}</Text>
            </View>
        </View>
    );
}

const assetStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.base,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    info: {
        flex: 1,
    },
    symbol: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
    name: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
        marginTop: 2,
    },
    trendBadge: {
        padding: theme.spacing.xs + 2,
        borderRadius: theme.radius.sm,
        marginHorizontal: theme.spacing.md,
    },
    priceCol: {
        alignItems: 'flex-end',
    },
    price: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.semibold,
    },
    change: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
        marginTop: 2,
    },
});

// ── Componente principal ──────────────────────────────────────────────────────

export default function InvestimentosScreen() {
    const [category, setCategory]   = useState<CategoryFilter>('ibovespa');
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [loading, setLoading]     = useState(false);
    const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

    // Simula atualização — substituir por fetch real
    const refresh = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setLastUpdate(new Date());
            setLoading(false);
        }, 600);
    }, []);

    // Atualização periódica automática
    useEffect(() => {
        refresh();
        intervalRef.current = setInterval(refresh, UPDATE_INTERVAL_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [refresh]);

    const filtered = MOCK_DATA.filter(a => a.category === category);

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* ── Cabeçalho ── */}
            <View style={styles.headerSection}>
                <View>
                    <Text style={styles.screenTitle}>Analisador</Text>
                    {/* Indicador "ao vivo" */}
                    <View style={styles.liveRow}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Conectado ao vivo</Text>
                    </View>
                </View>

                {/* Botão de atualização manual */}
                <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
                    {loading
                        ? <ActivityIndicator size="small" color={theme.colors.primary} />
                        : <Ionicons name="refresh" size={18} color={theme.colors.primary} />
                    }
                </TouchableOpacity>
            </View>

            {/* ── Filtros de categoria ── */}
            <View style={styles.filterRow}>
                {CATEGORIES.map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.filterBtn,
                            category === key && styles.filterBtnActive,
                        ]}
                        onPress={() => setCategory(key)}
                    >
                        <Text style={[
                            styles.filterText,
                            category === key && styles.filterTextActive,
                        ]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Lista de ativos ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.symbol}
                renderItem={({ item }) => <AssetRow asset={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ListFooterComponent={() => (
                    /* Timestamp de última atualização */
                    <View style={styles.footer}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.textFaint} />
                        <Text style={styles.footerText}>
                            Atualizado às {formatTime(lastUpdate)}
                        </Text>
                    </View>
                )}
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
        alignItems: 'flex-start',
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        letterSpacing: -0.5,
    },
    liveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: theme.spacing.xs,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.success,
    },
    liveText: {
        color: theme.colors.success,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    refreshBtn: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm + 2,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
    list: {
        paddingBottom: theme.spacing.xxxl,
    },

    // Rodapé
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    footerText: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
    },
});
