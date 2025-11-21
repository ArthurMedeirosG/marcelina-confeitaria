const palette = {
  sky: "#A8D5FF",
  vanilla: "#F8E4AF",
  rose: "#F5C3D4",
  cacao: "#8D3B32",
  sugar: "#FFF8ED",
  marshmallow: "#FFFDF8",
  textPrimary: "#241B19",
  textSecondary: "#6F665C",
  border: "#EFE3D7",
  background: "#FDF9F4",
} as const;

export const theme = {
  colors: {
    brand: {
      sky: palette.sky,
      vanilla: palette.vanilla,
      rose: palette.rose,
      cacao: palette.cacao,
    },
    neutrals: {
      background: palette.background,
      surface: "#FFFFFF",
      surfaceMuted: palette.sugar,
      border: palette.border,
      textPrimary: palette.textPrimary,
      textSecondary: palette.textSecondary,
      highlight: palette.marshmallow,
    },
    feedback: {
      success: "#48B26B",
      warning: "#D99A27",
      error: "#C03C36",
    },
  },
  typography: {
    heading: "\"Playfair Display\", \"Fraunces\", serif",
    body: "\"Inter\", \"Segoe UI\", system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
  },
  shadows: {
    floating: "0 12px 32px rgba(53, 41, 26, 0.08)",
    resting: "0 8px 24px rgba(53, 41, 26, 0.06)",
  },
} as const;

export type Theme = typeof theme;

export function applyTheme(themeToApply: Theme = theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const entries: Record<string, string> = {
    "--color-brand-sky": themeToApply.colors.brand.sky,
    "--color-brand-vanilla": themeToApply.colors.brand.vanilla,
    "--color-brand-rose": themeToApply.colors.brand.rose,
    "--color-brand-cacao": themeToApply.colors.brand.cacao,
    "--color-background": themeToApply.colors.neutrals.background,
    "--color-surface": themeToApply.colors.neutrals.surface,
    "--color-surface-muted": themeToApply.colors.neutrals.surfaceMuted,
    "--color-border": themeToApply.colors.neutrals.border,
    "--color-text-primary": themeToApply.colors.neutrals.textPrimary,
    "--color-text-secondary": themeToApply.colors.neutrals.textSecondary,
    "--color-feedback-success": themeToApply.colors.feedback.success,
    "--color-feedback-warning": themeToApply.colors.feedback.warning,
    "--color-feedback-error": themeToApply.colors.feedback.error,
    "--font-family-heading": themeToApply.typography.heading,
    "--font-family-body": themeToApply.typography.body,
    "--shadow-floating": themeToApply.shadows.floating,
    "--shadow-resting": themeToApply.shadows.resting,
  };

  Object.entries(entries).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
}
