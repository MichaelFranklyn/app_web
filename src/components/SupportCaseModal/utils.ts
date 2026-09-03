/**
 * O campo `currency` do FormBuilder entrega o texto mascarado ("R$ 1.234,56");
 * o backend quer número.
 *
 * Vazio devolve `null`, e não zero: zero afirmaria que não há valor em
 * discussão, o que é diferente de não saber quanto é — e é `null` que faz a
 * ficha mostrar "—" em vez de "R$ 0,00".
 */
export function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const text = String(value).trim();
  if (!text) return null;
  // Milhar sai, decimal vira ponto: "1.234,56" → "1234.56". Fazer o contrário
  // (só trocar a vírgula) transformaria mil reais em um real e vinte e três.
  const normalized = text
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  // Sem nenhum dígito não há valor: `Number("")` é zero, e devolvê-lo faria a
  // ficha afirmar "R$ 0,00" para quem só deixou o prefixo da máscara na tela.
  if (!/\d/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
