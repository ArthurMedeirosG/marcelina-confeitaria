import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const container: CSSProperties = {
  width: "100%",
  maxWidth: "960px",
  margin: "0 auto",
  padding: `${theme.spacing.lg} ${theme.spacing.sm}`,
  minHeight: "calc(100vh - 4rem)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const card: CSSProperties = {
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.xl,
  boxShadow: theme.shadows.resting,
  border: `1px solid ${theme.colors.neutrals.border}`,
  textAlign: "center",
};

export const heading: CSSProperties = {
  fontFamily: theme.typography.heading,
  fontSize: "1.6rem",
  marginBottom: theme.spacing.sm,
  color: theme.colors.neutrals.textPrimary,
};

export const paragraph: CSSProperties = {
  color: theme.colors.neutrals.textSecondary,
  fontSize: "1rem",
};
