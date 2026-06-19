export const RULES = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  {
    label: "Pelo menos uma letra maiúscula",
    test: (p: string) => /[A-Z]/.test(p),
  },
  { label: "Pelo menos um número", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Pelo menos um caractere especial",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];
