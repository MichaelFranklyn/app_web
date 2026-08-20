import { describe, expect, it } from "vitest";

import { buildKpis } from "./utils";

/**
 * Os três cartões medem coisas diferentes que soam iguais: PESSOAS que vendem e
 * PERMISSÕES de vendedor × fábrica. Um vendedor que atende três fábricas conta
 * uma vez no primeiro cartão e três no segundo — por isso o segundo é
 * normalmente maior, e por isso a relação entre eles não é uma porcentagem.
 */
describe("buildKpis", () => {
  const stats = {
    totalCount: 8,
    activeCount: 5,
    activeFactoryAccessCount: 15,
    inactiveFactoryAccessCount: 2,
  };

  it("explica os três cartões — nenhum número fica sem “?”", () => {
    buildKpis(stats).forEach((kpi) => expect(kpi.help).toBeTruthy());
  });

  /**
   * O texto dizia `${acessos / vendedores * 100}% da carteira`: com 5
   * vendedores e 15 acessos, o cartão anunciava "300% da carteira" — um número
   * que não quer dizer nada e que ninguém consegue conferir contra nada.
   */
  it("lê acessos por vendedor como média, não como porcentagem", () => {
    const acessos = buildKpis(stats).find((kpi) =>
      kpi.label.includes("Acessos a fábricas")
    );

    expect(acessos?.value).toBe("15");
    expect(acessos?.delta).toContain("3.0 fábricas por vendedor");
    expect(acessos?.delta).not.toContain("%");
  });

  it("não divide por zero quando ninguém vende em campo", () => {
    const semVendedores = { ...stats, activeCount: 0 };
    const acessos = buildKpis(semVendedores).find((kpi) =>
      kpi.label.includes("Acessos a fábricas")
    );

    expect(acessos?.delta).toContain("0 fábricas por vendedor");
  });

  it("separa pessoas de permissões nos rótulos", () => {
    const [vendem, acessos, suspensos] = buildKpis(stats);

    expect(vendem.value).toBe("5");
    expect(vendem.delta).toContain("de 8 com perfil de vendedor");
    expect(acessos.value).toBe("15");
    expect(suspensos.value).toBe("2");
  });

  it("marca os acessos suspensos como pendência só quando existem", () => {
    expect(buildKpis(stats)[2].status).toBe("urgente");
    expect(
      buildKpis({ ...stats, inactiveFactoryAccessCount: 0 })[2].status
    ).toBe("ok");
  });

  it("degrada para zeros quando os stats não vieram", () => {
    const semStats = undefined as unknown as typeof stats;
    expect(buildKpis(semStats).map((k) => k.value)).toEqual(["0", "0", "0"]);
  });
});
