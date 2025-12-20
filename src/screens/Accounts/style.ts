import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const screen: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  padding: `${theme.spacing.lg} ${theme.spacing.sm} calc(${theme.spacing.xl} * 1.2)`,
  width: "100%",
  maxWidth: "1024px",
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
  display: "flex",
  gap: theme.spacing.md,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
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
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: theme.spacing.md,
};

export const toggleRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  padding: theme.spacing.sm,
  borderRadius: theme.radii.md,
  backgroundColor: theme.colors.neutrals.surfaceMuted,
  border: `1px dashed ${theme.colors.brand.vanilla}`,
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

export const board: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.lg,
  boxShadow: theme.shadows.resting,
  border: `1px solid ${theme.colors.neutrals.border}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
};

export const summaryRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: theme.spacing.sm,
};

export const summaryCard: CSSProperties = {
  border: `1px dashed ${theme.colors.brand.vanilla}`,
  borderRadius: theme.radii.md,
  padding: "0.85rem 1rem",
  backgroundColor: theme.colors.neutrals.surfaceMuted,
};

export const summaryValue: CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 700,
  color: theme.colors.brand.cacao,
};

export const summaryLabel: CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  color: theme.colors.neutrals.textSecondary,
};

export const cardsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: theme.spacing.md,
};

export const card: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surfaceMuted,
  borderRadius: theme.radii.md,
  padding: theme.spacing.md,
  border: `1px solid ${theme.colors.neutrals.border}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.sm,
};

export const cardHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.sm,
};

export const statusDot: CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  border: `1px solid ${theme.colors.neutrals.border}`,
};

export const statusRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.xs,
  fontSize: "0.85rem",
  color: theme.colors.neutrals.textSecondary,
};

export const typeBadge: CSSProperties = {
  backgroundColor: theme.colors.brand.rose,
  color: theme.colors.brand.cacao,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "0.2rem 0.5rem",
  borderRadius: theme.radii.sm,
  fontWeight: 600,
};

export const title: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: theme.colors.neutrals.textPrimary,
};

export const metaText: CSSProperties = {
  fontSize: "0.9rem",
  color: theme.colors.neutrals.textSecondary,
};

export const valueText: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: theme.colors.neutrals.textPrimary,
};

export const tag: CSSProperties = {
  alignSelf: "flex-start",
  backgroundColor: theme.colors.neutrals.surface,
  border: `1px solid ${theme.colors.neutrals.border}`,
  borderRadius: theme.radii.sm,
  padding: "0.2rem 0.5rem",
  fontSize: "0.75rem",
  color: theme.colors.neutrals.textSecondary,
};

export const cardActions: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

export const editButton: CSSProperties = {
  border: "none",
  backgroundColor: theme.colors.neutrals.surface,
  color: theme.colors.neutrals.textPrimary,
  fontWeight: 600,
  padding: "0.5rem 0.85rem",
  borderRadius: theme.radii.sm,
  cursor: "pointer",
  borderColor: theme.colors.neutrals.border,
  borderStyle: "solid",
  borderWidth: "1px",
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

export const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: theme.spacing.md,
};

export const modal: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.lg,
  width: "min(560px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: theme.shadows.floating,
  border: `1px solid ${theme.colors.neutrals.border}`,
};

export const modalTitle: CSSProperties = {
  fontFamily: theme.typography.heading,
  fontSize: "1.2rem",
  marginBottom: theme.spacing.sm,
  color: theme.colors.neutrals.textPrimary,
};

export const modalContent: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.sm,
};

export const modalActions: CSSProperties = {
  marginTop: theme.spacing.md,
  display: "flex",
  gap: theme.spacing.sm,
  justifyContent: "flex-end",
  flexWrap: "wrap",
};

const modalButtonBase: CSSProperties = {
  borderRadius: theme.radii.md,
  padding: "0.65rem 1rem",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

export const modalButtonSecondary: CSSProperties = {
  ...modalButtonBase,
  backgroundColor: theme.colors.neutrals.surfaceMuted,
  border: `1px solid ${theme.colors.neutrals.border}`,
  color: theme.colors.neutrals.textPrimary,
};

export const modalButtonPrimary: CSSProperties = {
  ...modalButtonBase,
  backgroundColor: theme.colors.brand.cacao,
  color: theme.colors.neutrals.surface,
};

export const modalHint: CSSProperties = {
  marginTop: theme.spacing.xs,
  fontSize: "0.9rem",
  color: theme.colors.neutrals.textSecondary,
};
