import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const screen: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  padding: `${theme.spacing.lg} ${theme.spacing.sm} calc(${theme.spacing.xl} * 1.2)`
    ,
  width: "100%",
  maxWidth: "960px",
  margin: "0 auto",
};

export const surface: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.lg,
  boxShadow: theme.shadows.resting,
  border: `1px solid ${theme.colors.neutrals.border}`,
};

export const header: CSSProperties = {
  marginBottom: theme.spacing.lg,
};

export const headline: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  fontFamily: theme.typography.heading,
  color: theme.colors.neutrals.textPrimary,
};

export const supportText: CSSProperties = {
  fontSize: "0.95rem",
  color: theme.colors.neutrals.textSecondary,
};

export const filters: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: theme.spacing.sm,
};

export const label: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  fontSize: "0.95rem",
  fontWeight: 500,
  color: theme.colors.neutrals.textSecondary,
};

export const input: CSSProperties = {
  borderRadius: theme.radii.md,
  padding: "0.75rem 1rem",
  border: `1px solid ${theme.colors.neutrals.border}`,
  fontSize: "1rem",
  fontFamily: "inherit",
  outline: "none",
  backgroundColor: theme.colors.neutrals.surfaceMuted,
};

export const listCard: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.lg,
  boxShadow: theme.shadows.resting,
  border: `1px solid ${theme.colors.neutrals.border}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
};

export const metricsRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: theme.spacing.sm,
};

export const metricBox: CSSProperties = {
  border: `1px dashed ${theme.colors.brand.vanilla}`,
  borderRadius: theme.radii.md,
  padding: "0.85rem 1rem",
  backgroundColor: theme.colors.neutrals.surfaceMuted,
};

export const metricValue: CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: theme.colors.brand.cacao,
};

export const metricLabel: CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  color: theme.colors.neutrals.textSecondary,
};

export const infoMessage: CSSProperties = {
  textAlign: "center",
  color: theme.colors.neutrals.textSecondary,
  fontSize: "0.95rem",
};

export const emptyState: CSSProperties = {
  textAlign: "center",
  color: theme.colors.neutrals.textSecondary,
  padding: theme.spacing.md,
};

export const errorMessage: CSSProperties = {
  color: theme.colors.feedback.error,
  fontSize: "0.9rem",
};

export const tableWrapper: CSSProperties = {
  overflowX: "auto",
};

export const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

export const tableHeader: CSSProperties = {
  textAlign: "left",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: theme.colors.neutrals.textSecondary,
  paddingBottom: "0.5rem",
};

export const tableCell: CSSProperties = {
  padding: "0.65rem 0",
  borderTop: `1px solid ${theme.colors.neutrals.border}`,
  color: theme.colors.neutrals.textPrimary,
};
