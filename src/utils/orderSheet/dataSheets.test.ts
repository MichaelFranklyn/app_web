import { describe, expect, it } from "vitest";

import {
  addressLine,
  buildCatalogRows,
  buildClientRows,
  buildFactoryRows,
  buildLinkRows,
  buildMetaRows,
  priceTierNames,
} from "./dataSheets";
import { sheetPackageFixture } from "./fixture";

describe("priceTierNames", () => {
  it("une os níveis das fábricas em ordem", () => {
    expect(priceTierNames(sheetPackageFixture())).toEqual([
      "Diamante",
      "Platina",
    ]);
  });

  it("não repete nível de mesmo nome em fábricas diferentes", () => {
    const pkg = sheetPackageFixture();
    pkg.factories[1].tiers = [{ id: "outro", name: "Platina" }];

    expect(priceTierNames(pkg)).toEqual(["Platina"]);
  });
});

describe("buildCatalogRows", () => {
  it("indexa por fábrica|código", () => {
    // O SKU só é único dentro da fábrica: buscar pelo código puro devolveria o
    // produto de outra fábrica quando as duas repetem a numeração.
    const [, herc, silvana] = buildCatalogRows(sheetPackageFixture());

    expect(herc[0]).toBe("HERC|1000000011");
    expect(silvana[0]).toBe("Silvana|90281");
  });

  it("soma ST e IPI numa alíquota só", () => {
    const [, herc, silvana] = buildCatalogRows(sheetPackageFixture());

    expect(herc[7]).toBe(5.2);
    expect(silvana[7]).toBe(7.5);
  });

  it("põe o preço na coluna do nível e deixa as outras vazias", () => {
    const rows = buildCatalogRows(sheetPackageFixture());
    const [header, herc, silvana] = rows;

    expect(header.slice(9)).toEqual(["Diamante", "Platina"]);
    expect(herc.slice(9)).toEqual(["", 89.52]);
    expect(silvana.slice(9)).toEqual([67.57, ""]);
  });
});

describe("buildLinkRows", () => {
  it("casa cliente e fábrica na mesma chave", () => {
    const [, link] = buildLinkRows(sheetPackageFixture());

    expect(link).toEqual(["51909936000170|HERC", "Platina"]);
  });

  it("descarta vínculo sem nível", () => {
    // Linha com nível em branco daria preço vazio sem explicar por quê; a folha
    // prefere tratar como "sem vínculo" e avisar.
    const pkg = sheetPackageFixture();
    pkg.links[0].tierName = null;

    expect(buildLinkRows(pkg)).toHaveLength(1);
  });

  it("descarta vínculo de cliente que não veio no pacote", () => {
    const pkg = sheetPackageFixture();
    pkg.links.push({
      clientId: "sumiu",
      factoryId: "factory-herc",
      tierId: "tier-platina",
      tierName: "Platina",
    });

    expect(buildLinkRows(pkg)).toHaveLength(2);
  });
});

describe("buildClientRows", () => {
  it("monta endereço e cidade/UF", () => {
    const [, client] = buildClientRows(sheetPackageFixture());

    expect(client[3]).toBe("24 DE JUNHO, 10 - Centro");
    expect(client[4]).toBe("Salvador/BA");
    // O id vai no fim: é por ele que o importador reconhece o cliente na volta.
    expect(client[5]).toBe("client-1");
  });

  it("não deixa sobrar separador quando falta pedaço do endereço", () => {
    expect(
      addressLine({
        addressStreet: "RUA A",
        addressNumber: null,
        addressNeighborhood: null,
      })
    ).toBe("RUA A");
  });
});

describe("buildFactoryRows", () => {
  it("põe os prazos de cada fábrica na própria linha", () => {
    // É esta forma que sustenta o dropdown de prazo dependente da fábrica.
    const [, herc, silvana] = buildFactoryRows(sheetPackageFixture());

    expect(herc).toEqual([
      "HERC",
      "factory-herc",
      15,
      "",
      "30/45/60",
      "30/60/90",
    ]);
    expect(silvana).toEqual(["Silvana", "factory-silvana", "", "", "28/42/56"]);
  });
});

describe("buildMetaRows", () => {
  it("carrega o vendedor, que é quem decide de quem é o pedido", () => {
    const meta = Object.fromEntries(buildMetaRows(sheetPackageFixture()));

    expect(meta.formato).toBe("girus-order-sheet");
    expect(meta.vendedor).toBe("seller-1");
    expect(meta.gerado_em).toBe("2026-09-02");
    expect(meta.tabelas).toBe("list-herc,list-silvana");
  });
});
