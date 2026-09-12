import { beforeEach, describe, expect, it, vi } from "vitest";

import { sheetPackageFixture } from "./fixture";
import { downloadOrderSheet, orderSheetFilename } from "./index";

vi.mock("./build", () => ({
  buildOrderSheetFile: vi.fn(async () => new Uint8Array([1, 2, 3]).buffer),
}));

describe("orderSheetFilename", () => {
  it("nasce com a data na frente do nome de quem vai receber", () => {
    // O vendedor trabalha com "salvar como": sem o dia no nome, a ficha do
    // cliente de ontem volta para a rua parecendo a de hoje.
    expect(orderSheetFilename(sheetPackageFixture(), "Alto Construção")).toBe(
      "Pedido - Alto Construcao - 02-09.xlsx"
    );
  });

  it("sem cliente, é a ficha em branco do vendedor", () => {
    expect(orderSheetFilename(sheetPackageFixture())).toBe(
      "Ficha de Pedido - Rafael - 02-09.xlsx"
    );
  });

  it("tira do nome o que atrapalha em pasta e corta o que é longo demais", () => {
    const pkg = sheetPackageFixture();

    // A barra some sem deixar espaço (é o caractere que o sistema de arquivos
    // não aceita); acento e parêntese caem, o resto do nome continua legível.
    expect(orderSheetFilename(pkg, "MERCADO/SÃO JOÃO (matriz) *")).toBe(
      "Pedido - MERCADOSAO JOAO matriz - 02-09.xlsx"
    );
    expect(
      orderSheetFilename(pkg, "A".repeat(60)).replace(
        /^Pedido - (.*) - .*$/,
        "$1"
      )
    ).toHaveLength(40);
  });
});

describe("downloadOrderSheet", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("entrega o arquivo ao navegador já com o nome do cliente", async () => {
    const createObjectURL = vi.fn(() => "blob:ficha");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });

    // A âncora nasce e morre dentro da função: interceptamos a criação para
    // conferir com que nome o arquivo chega ao vendedor.
    const created = document.createElement.bind(document);
    let anchor: HTMLAnchorElement | undefined;
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const element = created(tag);
      if (tag === "a") anchor = element as HTMLAnchorElement;
      return element;
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await downloadOrderSheet(sheetPackageFixture(), {
      clientName: "Alto Construção",
    });

    expect(click).toHaveBeenCalledOnce();
    expect(anchor?.download).toBe("Pedido - Alto Construcao - 02-09.xlsx");
    expect(anchor?.getAttribute("href")).toBe("blob:ficha");
    // A URL do blob é revogada na sequência: a aba do vendedor fica aberta o
    // dia inteiro, e cada ficha baixada seguraria o arquivo inteiro em memória.
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:ficha");

    const [blob] = createObjectURL.mock.calls[0] as unknown as [Blob];
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("passa o preset adiante e guarda a marca à parte", async () => {
    // `clientName` e `brand` são do arquivo e do desenho; o resto do objeto é o
    // preset que a folha já abre preenchido.
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:ficha"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const { buildOrderSheetFile } = await import("./build");
    const pkg = sheetPackageFixture();
    const brand = { companyName: "Contato Rep." };

    await downloadOrderSheet(pkg, {
      clientName: "Alto",
      brand,
      factoryName: "HERC",
    });

    expect(buildOrderSheetFile).toHaveBeenCalledWith(
      pkg,
      { factoryName: "HERC" },
      brand
    );
  });
});
