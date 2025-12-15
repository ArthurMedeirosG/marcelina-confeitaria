import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const screen: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  padding: `${theme.spacing.lg} ${theme.spacing.sm} calc(${theme.spacing.xl} * 1.2)`,
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

export const form: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
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

export const textarea: CSSProperties = {
  ...input,
  minHeight: "96px",
  resize: "vertical",
};

export const inlineGroup: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
};

export const compositionRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: theme.spacing.sm,
  alignItems: "end",
};

export const addButton: CSSProperties = {
  alignSelf: "stretch",
  justifySelf: "stretch",
  padding: "0.75rem 1rem",
  borderRadius: theme.radii.md,
  border: "none",
  backgroundColor: theme.colors.brand.cacao,
  color: theme.colors.neutrals.surface,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: "120px",
};

export const chipsContainer: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing.xs,
};

export const chip: CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: theme.radii.md,
  backgroundColor: theme.colors.neutrals.surfaceMuted,
  border: `1px solid ${theme.colors.neutrals.border}`,
  fontSize: "0.9rem",
  color: theme.colors.neutrals.textPrimary,
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing.xs,
};

export const chipRemove: CSSProperties = {
  border: "none",
  background: "transparent",
  color: theme.colors.feedback.error,
  fontWeight: 700,
  cursor: "pointer",
  lineHeight: 1,
};

export const button: CSSProperties = {
  marginTop: "0.5rem",
  border: "none",
  backgroundColor: theme.colors.brand.cacao,
  color: theme.colors.neutrals.surface,
  fontWeight: 600,
  padding: "0.9rem 1.5rem",
  borderRadius: theme.radii.md,
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: theme.shadows.resting,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: theme.spacing.sm,
};

export const metricBox: CSSProperties = {
  border: `1px dashed ${theme.colors.brand.vanilla}`,
  borderRadius: theme.radii.md,
  padding: "0.85rem 1rem",
  backgroundColor: theme.colors.neutrals.surfaceMuted,
};

export const metricValue: CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 700,
  color: theme.colors.brand.cacao,
};

export const metricLabel: CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  color: theme.colors.neutrals.textSecondary,
};

export const emptyState: CSSProperties = {
  textAlign: "center",
  color: theme.colors.neutrals.textSecondary,
  padding: theme.spacing.md,
};

export const infoMessage: CSSProperties = {
  textAlign: "center",
  color: theme.colors.neutrals.textSecondary,
  fontSize: "0.95rem",
};

export const errorMessage: CSSProperties = {
  marginTop: theme.spacing.sm,
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
  fontSize: "0.75rem",
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

export const deleteButton: CSSProperties = {
  border: "none",
  background: "transparent",
  color: theme.colors.feedback.error,
  fontWeight: 600,
  cursor: "pointer",
};
