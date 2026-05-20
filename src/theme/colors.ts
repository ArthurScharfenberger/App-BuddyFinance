export const theme = {
    colors: {
        buddyBlack: '#050A14',
        buddyNight: '#0B1220',
        buddyTrust: '#0F4C81',
        buddyAction: '#1EA7FF',
        buddyProgress: '#43D9BD',
        buddySnow: '#F4F7FB',
        ifoodRed: '#EA1D2C',

        primary: '#1EA7FF',
        primaryHover: '#198FE0',
        primaryMuted: 'rgba(30, 167, 255, 0.14)',

        secondary: '#0F4C81',
        secondaryMuted: 'rgba(15, 76, 129, 0.34)',

        success: '#43D9BD',
        successMuted: 'rgba(67, 217, 189, 0.14)',
        danger: '#FF4757',
        dangerMuted: 'rgba(255, 71, 87, 0.14)',
        warning: '#FFA502',
        warningMuted: 'rgba(255, 165, 2, 0.15)',

        background: '#050A14',
        backgroundSoft: '#08101E',
        surface: '#0B1220',
        surfaceHover: '#101B31',
        overlay: 'rgba(5, 10, 20, 0.78)',

        textPrimary: '#F4F7FB',
        textMuted: '#8A95A8',
        textFaint: '#5F6D84',

        border: 'rgba(30, 167, 255, 0.15)',
        borderSoft: 'rgba(30, 167, 255, 0.10)',
        input: 'rgba(30, 167, 255, 0.10)',
    },

    typography: {
        fontFamily: {
            brand: 'Sora',
            body: 'Inter',
        },

        xs: 12,
        sm: 14,
        base: 16,
        md: 18,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 42,

        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
        black: '900' as const,
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },

    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        pill: 999,
    },

    shadow: {
        sm: {
            shadowColor: '#1EA7FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.10,
            shadowRadius: 16,
            elevation: 3,
        },
        md: {
            shadowColor: '#1EA7FF',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 32,
            elevation: 6,
        },
        lg: {
            shadowColor: '#43D9BD',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.20,
            shadowRadius: 28,
            elevation: 10,
        },
    },
} as const;

export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeRadius = typeof theme.radius;
