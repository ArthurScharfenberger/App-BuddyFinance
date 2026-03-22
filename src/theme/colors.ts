// =============================================================================
// BuddyFinance App — src/theme/colors.ts
// Sistema de design centralizado. Alinhado com as variáveis CSS do site.
// Altere apenas aqui para propagar por todo o app.
// =============================================================================

export const theme = {

    // ── Cores principais ──────────────────────────────────────────────────────
    colors: {
        // Cor primária — azul BuddyFinance (idêntico ao site #0052FF)
        primary:        '#0052FF',
        primaryHover:   '#0040CC',
        primaryMuted:   '#0052FF20', // azul com opacidade para fundos de ícone

        // Feedback
        success:        '#10B981', // verde — receita, lucro
        successMuted:   '#10B98120',
        danger:         '#EF4444', // vermelho — despesa, prejuízo
        dangerMuted:    '#EF444420',
        warning:        '#F59E0B', // âmbar — alerta
        warningMuted:   '#F59E0B20',

        // Fundo (dark mode — alinhado com --color-bg do site)
        background:     '#080e1a', // fundo principal
        surface:        '#0d1526', // cards e painéis
        surfaceHover:   '#111d35', // hover de cards
        overlay:        'rgba(0, 0, 0, 0.7)', // overlay de modais

        // Tipografia
        textPrimary:    '#f0f4ff', // texto principal
        textMuted:      '#8ba0c4', // texto secundário
        textFaint:      '#4a5e80', // texto bem apagado / placeholder

        // Bordas
        border:         '#1e2d4a',
        borderSoft:     '#152038',
    },

    // ── Tipografia ────────────────────────────────────────────────────────────
    typography: {
        // Tamanhos
        xs:     10,
        sm:     12,
        base:   14,
        md:     16,
        lg:     18,
        xl:     22,
        xxl:    28,
        xxxl:   36,

        // Pesos
        regular:    '400' as const,
        medium:     '500' as const,
        semibold:   '600' as const,
        bold:       '700' as const,
        extrabold:  '800' as const,
        black:      '900' as const,
    },

    // ── Espaçamentos ──────────────────────────────────────────────────────────
    spacing: {
        xs:   4,
        sm:   8,
        md:   12,
        base: 16,
        lg:   20,
        xl:   24,
        xxl:  32,
        xxxl: 48,
    },

    // ── Raios de borda ────────────────────────────────────────────────────────
    radius: {
        sm:   8,
        md:   12,
        lg:   16,
        xl:   20,
        xxl:  24,
        pill: 999,
    },

    // ── Sombras ───────────────────────────────────────────────────────────────
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
        },
        md: {
            shadowColor: '#0052FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
        },
        lg: {
            shadowColor: '#0052FF',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.20,
            shadowRadius: 20,
            elevation: 10,
        },
    },
} as const;

// Tipos derivados para uso com TypeScript
export type ThemeColors  = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeRadius  = typeof theme.radius;
