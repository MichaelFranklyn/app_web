import { describe, expect, it } from "vitest";

import { buildDayOffConfirmation } from "./utils";

/**
 * O texto da confirmação é a única chance de o vendedor entender que a ação
 * alcança a semana, e não só aquele dia. Por isso ele é testado como regra, e
 * não tratado como enfeite: o número de paradas em jogo tem de aparecer, e a
 * assimetria do caminho de volta (as visitas não voltam sozinhas) precisa estar
 * escrita antes do clique, não depois no toast.
 */
describe("buildDayOffConfirmation", () => {
  it("diz quantas paradas serão realocadas", () => {
    const { description } = buildDayOffConfirmation(false, 4);
    expect(description).toContain("4 paradas marcadas");
  });

  it("concorda no singular", () => {
    const { description } = buildDayOffConfirmation(false, 1);
    expect(description).toContain("1 parada marcada");
    expect(description).not.toContain("1 paradas");
  });

  it("dia vazio não promete realocação nenhuma", () => {
    const { description } = buildDayOffConfirmation(false, 0);
    expect(description).toContain("Não há nada marcado");
    expect(description).not.toContain("parada");
  });

  it("avisa que o que não couber sai do plano", () => {
    const { description } = buildDayOffConfirmation(false, 3);
    expect(description).toContain("não couber");
  });

  it("desmarcar avisa que as visitas NÃO voltam sozinhas", () => {
    const { title, description, confirmLabel } = buildDayOffConfirmation(
      true,
      0
    );
    expect(title).toContain("Voltar a trabalhar");
    expect(confirmLabel).toBe("Voltar a trabalhar");
    expect(description).toContain("NÃO voltam");
  });
});
