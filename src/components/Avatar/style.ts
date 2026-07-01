import { ThemeColor } from "@/lib/theme";

export const avatarStyles = {
  root: "rounded-full flex items-center justify-center font-head font-bold shrink-0 overflow-hidden relative",

  sizes: {
    sm: "w-[28px] h-[28px] text-[13px]",
    md: "w-[36px] h-[36px] text-[13px]",
    lg: "w-[48px] h-[48px] text-[16px]",
  },

  colors: {
    amber:
      "bg-(--amber-bg2) text-(--amber) border border-[var(--amber-bd,rgba(245,158,11,0.2))]",
    blue: "bg-(--blue-bg)   text-(--blue)  border border-[var(--blue-bd,rgba(59,130,246,0.2))]",
    green:
      "bg-(--green-bg)  text-(--green) border border-[var(--green-bd,rgba(34,197,94,0.2))]",
    purple:
      "bg-(--purple-bg) text-(--purple) border border-[rgba(168,85,247,.2)]",
    neutral: "bg-(--bg3) text-(--muted) border border-(--border)",
    red: "bg-(--red-bg) text-(--red) border border-(--red-bd)",
    cyan: "bg-(--cyan-bg) text-(--cyan) border border-(--cyan)/20",
    orange: "bg-(--orange-bg) text-(--orange) border border-(--orange)/20",
    pink: "bg-(--pink-bg) text-(--pink) border border-(--pink)/20",
    subtle: "bg-(--bg3) text-(--text2) border border-(--border2)",
  } as Record<ThemeColor, string>,

  image: "w-full h-full object-cover",
};
