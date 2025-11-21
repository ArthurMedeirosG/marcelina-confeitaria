import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const container: CSSProperties = {
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: theme.colors.neutrals.surface,
  borderBottom: `1px solid ${theme.colors.neutrals.border}`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

export const brandImage: CSSProperties = {
  height: "40px",
  width: "auto",
};

export const menuButton: CSSProperties = {
  border: `1px solid ${theme.colors.neutrals.border}`,
  borderRadius: theme.radii.md,
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  backgroundColor: theme.colors.neutrals.surface,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.25rem",
  cursor: "pointer",
};

export const menuLine: CSSProperties = {
  width: "20px",
  height: "2px",
  backgroundColor: theme.colors.neutrals.textPrimary,
  borderRadius: "999px",
};

export const menuLabel: CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.05em",
  color: theme.colors.neutrals.textSecondary,
};

export const links: CSSProperties = {
  display: "flex",
  gap: theme.spacing.sm,
};

export const linksDesktop: CSSProperties = {
  flexDirection: "row",
};

export const linksMobile: CSSProperties = {
  flexDirection: "column",
};

export const link: CSSProperties = {
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  borderRadius: theme.radii.md,
  textDecoration: "none",
  color: theme.colors.neutrals.textPrimary,
  fontWeight: 500,
  textAlign: "center",
};

export const linkActive: CSSProperties = {
  backgroundColor: theme.colors.brand.rose,
  color: theme.colors.brand.cacao,
};

export const backdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  zIndex: 18,
};

export const mobilePanel: CSSProperties = {
  position: "fixed",
  right: theme.spacing.sm,
  top: "4.5rem",
  backgroundColor: theme.colors.neutrals.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.md,
  boxShadow: theme.shadows.floating,
  zIndex: 20,
};
