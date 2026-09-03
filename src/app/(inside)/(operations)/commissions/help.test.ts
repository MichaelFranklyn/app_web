import { describe, expect, it } from "vitest";

import { ignoresMonth, scopeSentence } from "./help";
import { CommissionRow } from "./interface";
import { COMMISSION_TABS, filterByMonth } from "./utils";

const row = (receiveDate: string | null): CommissionRow =>
  ({ receiveDate, isOverdue: true, defaultedAt: null }) as CommissionRow;

const MONTH = { year: 2026, month: 8 };

/**
 * O aviso da tela e o recorte real têm de dizer a mesma coisa.
 *
 * `ignoresMonth` alimenta o texto ("esta aba não segue o mês") e o asterisco na
 * barra de abas; `filterByMonth` é quem de fato recorta. Se alguém passar outra
 * aba a ignorar o mês e esquecer do aviso, a tela mentiria em silêncio — que é
 * exatamente o problema que este aviso existe para resolver.
 */
describe("ignoresMonth", () => {
  const rows = [row("2026-08-10"), row("2026-05-02"), row(null)];

  it.each(COMMISSION_TABS.map((tab) => tab.id))(
    "combina com o que a aba %s realmente recorta",
    (tab) => {
      const filtered = filterByMonth(rows, MONTH, tab);
      expect(ignoresMonth(tab)).toBe(filtered.length === rows.length);
    }
  );

  it("marca a aba de boletos em atraso, e só ela", () => {
    expect(ignoresMonth("overdue")).toBe(true);
    expect(ignoresMonth("receivable")).toBe(false);
    expect(ignoresMonth("all")).toBe(false);
  });
});

/**
 * A frase de escopo é a única coisa na tela que diz o que a lista está somando.
 * Ela e o recorte real não podem divergir: a aba que ignora o mês tem de dizer
 * isso na frase, e as que o seguem têm de nomeá-lo.
 */
describe("scopeSentence", () => {
  it.each(COMMISSION_TABS.map((tab) => tab.id))(
    "a frase da aba %s combina com o recorte que ela faz",
    (tab) => {
      const frase = scopeSentence(tab, "agosto de 2026");

      if (ignoresMonth(tab)) {
        expect(frase).toContain("não segue o mês");
      } else {
        expect(frase).toContain("agosto de 2026");
        expect(frase).not.toContain("não segue o mês");
      }
    }
  );
});
