export type ThemeAppearance = "tinted" | "outline" | "solid" | "ghost";

export type ThemeColor =
  | "red"
  | "amber"
  | "blue"
  | "green"
  | "neutral"
  | "subtle"
  | "cyan"
  | "purple"
  | "orange"
  | "pink";

const themeVariants: Record<ThemeAppearance, Record<ThemeColor, string>> = {
  tinted: {
    red: "bg-(--red-bg) border-(--red-bd) text-(--red)",
    amber: "bg-(--amber-bg) border-(--amber-bd) text-(--amber)",
    blue: "bg-(--blue-bg) border-(--blue-bd) text-(--blue)",
    green: "bg-(--green-bg) border-(--green-bd) text-(--green)",
    neutral: "bg-(--bg3) border-(--border) text-(--muted)",
    subtle: "bg-(--bg3) border-(--border2) text-(--text2)",
    cyan: "bg-(--cyan-bg) border-(--cyan)/20 text-(--cyan)",
    purple:
      "bg-(--purple-bg) border-(--purple)/20 text-(--purple)",
    orange:
      "bg-(--orange-bg) border-(--orange)/20 text-(--orange)",
    pink: "bg-(--pink-bg) border-(--pink)/20 text-(--pink)",
  },
  outline: {
    neutral: "bg-transparent border-(--border2) text-(--text2)",
    subtle: "bg-transparent border-(--border2) text-(--text2)",
    red: "bg-transparent border-(--red) text-(--red)",
    amber: "bg-transparent border-(--amber) text-(--amber)",
    blue: "bg-transparent border-(--blue) text-(--blue)",
    green: "bg-transparent border-(--green) text-(--green)",
    cyan: "bg-transparent border-(--cyan) text-(--cyan)",
    purple: "bg-transparent border-(--purple) text-(--purple)",
    orange: "bg-transparent border-(--orange) text-(--orange)",
    pink: "bg-transparent border-(--pink) text-(--pink)",
  },
  ghost: {
    neutral: "bg-transparent border-transparent text-(--text2)",
    subtle: "bg-transparent border-transparent text-(--muted)",
    red: "bg-transparent border-transparent text-(--red)",
    amber: "bg-transparent border-transparent text-(--amber)",
    blue: "bg-transparent border-transparent text-(--blue)",
    green: "bg-transparent border-transparent text-(--green)",
    cyan: "bg-transparent border-transparent text-(--cyan)",
    purple: "bg-transparent border-transparent text-(--purple)",
    orange: "bg-transparent border-transparent text-(--orange)",
    pink: "bg-transparent border-transparent text-(--pink)",
  },
  solid: {
    amber: "bg-(--amber) border-(--amber) text-white",
    neutral: "bg-(--text) border-(--text) text-white",
    subtle: "bg-(--text2) border-(--text2) text-white",
    red: "bg-(--red) border-(--red) text-white",
    blue: "bg-(--blue) border-(--blue) text-white",
    green: "bg-(--green) border-(--green) text-white",
    cyan: "bg-(--cyan) border-(--cyan) text-white",
    purple: "bg-(--purple) border-(--purple) text-white",
    orange: "bg-(--orange) border-(--orange) text-white",
    pink: "bg-(--pink) border-(--pink) text-white",
  },
};

export const getThemeClasses = (
  appearance: ThemeAppearance,
  color: ThemeColor
): string => {
  return themeVariants[appearance]?.[color] ?? themeVariants.tinted.neutral;
};
