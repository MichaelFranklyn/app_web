import { ProgressColor } from "./interface";

export const PROGRESS_COLOR_TOKENS: Record<ProgressColor, string> = {
  amber: "var(--amber)",
  green: "var(--color-status-success)",
  red: "var(--color-status-danger)",
  blue: "var(--color-status-info)",
  cyan: "var(--cyan)",
  orange: "var(--orange)",
};
