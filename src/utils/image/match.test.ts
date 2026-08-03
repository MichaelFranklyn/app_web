import { describe, expect, it } from "vitest";

import { fileNameStem, matchFilesToTargets, matchKey } from "./match";

const file = (name: string) => new File([""], name, { type: "image/jpeg" });

const PRODUCTS = [
  { id: "p-1", sku: "CP-M-001" },
  { id: "p-2", sku: "Camisa 002" },
  { id: "p-3", sku: "ÁGUA-500" },
];

describe("fileNameStem", () => {
  it("tira caminho e extensão", () => {
    expect(fileNameStem("fotos/catalogo/CP-M-001.jpeg")).toBe("CP-M-001");
  });

  it("tira o sufixo de cópia que o sistema operacional acrescenta", () => {
    expect(fileNameStem("CP-M-001 (1).jpg")).toBe("CP-M-001");
    expect(fileNameStem("CP-M-001(2).jpg")).toBe("CP-M-001");
  });

  it("preserva pontos que fazem parte do nome", () => {
    expect(fileNameStem("REF.10.20.png")).toBe("REF.10.20");
  });
});

describe("matchKey", () => {
  it("ignora caixa, acento e separadores", () => {
    expect(matchKey("CP-M 001")).toBe(matchKey("cp_m_001"));
    expect(matchKey("ÁGUA-500")).toBe("agua500");
  });
});

describe("matchFilesToTargets", () => {
  it("casa a foto com o produto pelo nome do arquivo", () => {
    const [match] = matchFilesToTargets([file("cp_m_001.jpg")], PRODUCTS);
    expect(match.target?.id).toBe("p-1");
  });

  it("casa mesmo com acento e espaço divergentes", () => {
    const result = matchFilesToTargets(
      [file("agua 500.jpg"), file("CAMISA-002.png")],
      PRODUCTS
    );
    expect(result.map((m) => m.target?.id)).toEqual(["p-3", "p-2"]);
  });

  it("deixa como não casado o arquivo sem produto correspondente", () => {
    const [match] = matchFilesToTargets([file("IMG_2931.jpg")], PRODUCTS);
    expect(match.target).toBeNull();
    expect(match.file.name).toBe("IMG_2931.jpg");
  });

  it("mantém a ordem em que os arquivos foram soltos", () => {
    const result = matchFilesToTargets(
      [file("IMG_1.jpg"), file("CP-M-001.jpg")],
      PRODUCTS
    );
    expect(result.map((m) => m.file.name)).toEqual([
      "IMG_1.jpg",
      "CP-M-001.jpg",
    ]);
  });

  it("com SKUs que colidem depois de normalizados, o primeiro vence", () => {
    const targets = [
      { id: "a", sku: "AB-1" },
      { id: "b", sku: "ab1" },
    ];
    const [match] = matchFilesToTargets([file("ab1.jpg")], targets);
    expect(match.target?.id).toBe("a");
  });
});
