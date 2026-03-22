// =============================================================================
// BuddyFinance App — src/screens/EducacaoScreen.tsx
// Central de educação financeira: artigos, dicas e conceitos essenciais.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme/colors';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Tip {
    id:       string;
    icon:     keyof typeof Ionicons.glyphMap;
    color:    string;
    title:    string;
    body:     string;
    tag:      string;
}

interface Article {
    id:       string;
    title:    string;
    excerpt:  string;
    readTime: string;
    tag:      string;
    tagColor: string;
}

// ── Conteúdo estático ─────────────────────────────────────────────────────────
// TODO: substituir por fetch de API de conteúdo quando disponível.

const TIPS: Tip[] = [
    {
        id: '1',
        icon: 'shield-checkmark-outline',
        color: theme.colors.primary,
        title: 'Regra dos 50/30/20',
        body: 'Divida sua renda em 3 blocos: 50% para necessidades, 30% para desejos e 20% para poupança e investimentos.',
        tag: 'Orçamento',
    },
    {
        id: '2',
        icon: 'trending-up-outline',
        color: theme.colors.success,
        title: 'Fundo de Emergência',
        body: 'Mantenha ao menos 6 meses de gastos reservados em liquidez diária antes de investir em renda variável.',
        tag: 'Reserva',
    },
    {
        id: '3',
        icon: 'time-outline',
        color: theme.colors.warning,
        title: 'Juros Compostos',
        body: 'Quem começa a investir cedo leva vantagem. R$ 200/mês por 30 anos a 10% a.a. gera mais de R$ 450.000.',
        tag: 'Investimentos',
    },
    {
        id: '4',
        icon: 'card-outline',
        color: theme.colors.danger,
        title: 'Cartão de Crédito',
        body: 'Pague sempre a fatura total. O rotativo cobra em média 400% ao ano — um dos créditos mais caros do mundo.',
        tag: 'Dívidas',
    },
];

const ARTICLES: Article[] = [
    {
        id: '1',
        title: 'Como montar sua primeira carteira de investimentos',
        excerpt: 'Do Tesouro Direto às ações, um guia prático para quem está começando do zero.',
        readTime: '5 min',
        tag: 'Iniciante',
        tagColor: theme.colors.primary,
    },
    {
        id: '2',
        title: 'FIIs: renda passiva com imóveis sem comprar imóvel',
        excerpt: 'Entenda como os Fundos Imobiliários funcionam e por que são populares para geração de renda mensal.',
        readTime: '7 min',
        tag: 'FIIs',
        tagColor: theme.colors.success,
    },
    {
        id: '3',
        title: 'Inflação: como proteger o seu dinheiro',
        excerpt: 'Saber o que é inflação é só o começo. Veja quais ativos protegem seu patrimônio na prática.',
        readTime: '4 min',
        tag: 'Macro',
        tagColor: theme.colors.warning,
    },
    {
        id: '4',
        title: 'Criptomoedas: o que você precisa saber antes de investir',
        excerpt: 'Volatilidade, custódia e tributação — os três pilares que todo investidor de cripto precisa entender.',
        readTime: '6 min',
        tag: 'Cripto',
        tagColor: '#F7931A',
    },
];

// ── Componente: TipCard ───────────────────────────────────────────────────────

function TipCard({ tip }: { tip: Tip }) {
    return (
        <View style={[tipStyles.card, { borderLeftColor: tip.color }]}>
            <View style={[tipStyles.iconWrapper, { backgroundColor: tip.color + '18' }]}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
            </View>
            <View style={tipStyles.content}>
                <View style={tipStyles.titleRow}>
                    <Text style={tipStyles.title}>{tip.title}</Text>
                    <View style={[tipStyles.tag, { backgroundColor: tip.color + '18' }]}>
                        <Text style={[tipStyles.tagText, { color: tip.color }]}>{tip.tag}</Text>
                    </View>
                </View>
                <Text style={tipStyles.body}>{tip.body}</Text>
            </View>
        </View>
    );
}

const tipStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.base,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        borderLeftWidth: 3,
        alignItems: 'flex-start',
        gap: theme.spacing.md,
    },
    iconWrapper: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
        gap: theme.spacing.sm,
    },
    title: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
    },
    tag: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.pill,
    },
    tagText: {
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
    },
    body: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        lineHeight: 20,
    },
});

// ── Componente: ArticleCard ───────────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
    return (
        <TouchableOpacity
            style={articleStyles.card}
            onPress={() => Alert.alert('Em breve', 'Artigos completos chegam na próxima versão!')}
            activeOpacity={0.75}
        >
            <View style={articleStyles.header}>
                <View style={[articleStyles.tag, { backgroundColor: article.tagColor + '20' }]}>
                    <Text style={[articleStyles.tagText, { color: article.tagColor }]}>
                        {article.tag}
                    </Text>
                </View>
                <View style={articleStyles.readTime}>
                    <Ionicons name="time-outline" size={11} color={theme.colors.textFaint} />
                    <Text style={articleStyles.readTimeText}>{article.readTime}</Text>
                </View>
            </View>
            <Text style={articleStyles.title}>{article.title}</Text>
            <Text style={articleStyles.excerpt} numberOfLines={2}>{article.excerpt}</Text>
            <View style={articleStyles.footer}>
                <Text style={articleStyles.readLink}>Ler artigo</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );
}

const articleStyles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.base,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    tag: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
    },
    tagText: {
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
    },
    readTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    readTimeText: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
        marginBottom: theme.spacing.xs,
        lineHeight: 22,
    },
    excerpt: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        lineHeight: 20,
        marginBottom: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    readLink: {
        color: theme.colors.primary,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
});

// ── Componente principal ──────────────────────────────────────────────────────

export default function EducacaoScreen() {
    const [activeTab, setActiveTab] = useState<'dicas' | 'artigos'>('dicas');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Cabeçalho ── */}
                <View style={styles.headerSection}>
                    <Text style={styles.screenTitle}>Aprender</Text>
                    <Text style={styles.screenSubtitle}>
                        Educação financeira no seu bolso
                    </Text>
                </View>

                {/* ── Tabs ── */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'dicas' && styles.tabActive]}
                        onPress={() => setActiveTab('dicas')}
                    >
                        <Ionicons
                            name="bulb-outline"
                            size={14}
                            color={activeTab === 'dicas' ? '#ffffff' : theme.colors.textMuted}
                        />
                        <Text style={[styles.tabText, activeTab === 'dicas' && styles.tabTextActive]}>
                            Dicas Rápidas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'artigos' && styles.tabActive]}
                        onPress={() => setActiveTab('artigos')}
                    >
                        <Ionicons
                            name="book-outline"
                            size={14}
                            color={activeTab === 'artigos' ? '#ffffff' : theme.colors.textMuted}
                        />
                        <Text style={[styles.tabText, activeTab === 'artigos' && styles.tabTextActive]}>
                            Artigos
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Conteúdo da tab ── */}
                <View style={styles.content}>
                    {activeTab === 'dicas'
                        ? TIPS.map(tip       => <TipCard     key={tip.id}     tip={tip}         />)
                        : ARTICLES.map(article => <ArticleCard key={article.id} article={article} />)
                    }
                </View>

            </ScrollView>
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
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        letterSpacing: -0.5,
    },
    screenSubtitle: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.sm,
        marginTop: 4,
    },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 4,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.sm,
        gap: theme.spacing.xs,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semibold,
    },
    tabTextActive: {
        color: '#ffffff',
    },

    // Conteúdo
    content: {
        paddingBottom: theme.spacing.xxxl,
    },
});
