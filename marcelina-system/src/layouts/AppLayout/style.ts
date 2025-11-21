import type { CSSProperties } from "react";
import { theme } from "../../theme";

export const wrapper: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: theme.colors.neutrals.background,
};

export const content: CSSProperties = {
  paddingTop: theme.spacing.md,
};
