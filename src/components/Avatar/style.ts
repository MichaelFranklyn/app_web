import { ThemeColor } from "@/lib/theme";

export const avatarStyles = {
  root: "rounded-full flex items-center justify-center font-head font-bold shrink-0 overflow-hidden relative",

  sizes: {
    sm: "w-[28px] h-[28px] text-body-sm",
    md: "w-[36px] h-[36px] text-body-sm",
    lg: "w-[48px] h-[48px] text-[16px]",
    // Marca em destaque (ex.: logo da fábrica no topo do detalhe).
    xl: "w-[72px] h-[72px] text-[22px]",
  },

  colors: {
    amber:
      "bg-(--amber-bg2) text-(--color-action-text-on-tint) border border-[var(--amber-bd,rgba(245,158,11,0.2))]",
    blue: "bg-(--color-status-info-bg)   text-(--color-status-info)  border border-[var(--color-status-info-bd,rgba(59,130,246,0.2))]",
    green:
      "bg-(--color-status-success-bg)  text-(--color-status-success) border border-[var(--color-status-success-bd,rgba(34,197,94,0.2))]",
    purple:
      "bg-(--purple-bg) text-(--purple-text) border border-[rgba(168,85,247,.2)]",
    neutral: "bg-(--bg3) text-(--color-text-muted) border border-(--border)",
    red: "bg-(--color-status-danger-bg) text-(--color-status-danger) border border-(--color-status-danger-bd)",
    cyan: "bg-(--cyan-bg) text-(--cyan-text) border border-(--cyan)/20",
    orange: "bg-(--orange-bg) text-(--orange-text) border border-(--orange)/20",
    pink: "bg-(--pink-bg) text-(--pink-text) border border-(--pink)/20",
    subtle:
      "bg-(--bg3) text-(--color-text-secondary) border border-(--border2)",
  } as Record<ThemeColor, string>,

  image: "w-full h-full object-cover",
};
