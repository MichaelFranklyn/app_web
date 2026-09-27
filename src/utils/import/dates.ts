/**
 * Data de uma célula de planilha em ISO ("2026-05-04"), ou null.
 *
 * O Excel guarda data como número de série (dias desde 1899-12-30) e cada
 * sistema exporta num formato. O leitor (`readWorkbook`) já converte as datas
 * sem formato próprio para ISO; aqui entram as que chegam como texto. Dia vem
 * antes do mês, sempre: é planilha brasileira, e "04/05/2026" é 4 de maio.
 */
export const parseSheetDate = (value: string): string | null => {
  const text = (value ?? "").trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return build(+iso[1], +iso[2], +iso[3]);

  const br = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(\s|$)/);
  if (br) {
    const year = br[3].length === 2 ? 2000 + Number(br[3]) : Number(br[3]);
    return build(year, +br[2], +br[1]);
  }

  // Número de série do Excel: 20000 é 1954, 80000 é 2119 — fora disso não é data.
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const serial = Math.floor(Number(text));
    if (serial < 20000 || serial > 80000) return null;
    const date = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000);
    return date.toISOString().slice(0, 10);
  }
  return null;
};

const build = (year: number, month: number, day: number): string | null => {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
};
