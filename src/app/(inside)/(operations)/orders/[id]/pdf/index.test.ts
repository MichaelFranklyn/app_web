import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderDetail, OrderItem } from "../interface";
import { exportOrderPdf } from "./index";

/**
 * O PDF do pedido é COMPOSIÇÃO: cada bloco (cabeçalho, partes, itens, resumo)
 * tem módulo próprio. O que se prende aqui é a montagem — sobretudo a CONTA do
 * rodapé financeiro, que precisa bater com o resumo da tela: o subtotal já
 * embute o imposto e o IPI entra por cima.
 */
interface TotaisArg {
  subtotal: string;
  ipiAmount: string;
  total: number;
}

interface CabecalhoArg {
  docKind: string;
  number: string;
  issuedAt: string;
  companyName: string | null;
  companyLogo: unknown;
  factoryName: string;
  factoryLogo: unknown;
}

const {
  drawHeader,
  drawParties,
  drawItemsTable,
  drawTotals,
  drawPayment,
  drawNotes,
  drawFooters,
  loadGirusLogo,
  loadImage,
  trimTransparent,
  factoryCard,
  clientCard,
} = vi.hoisted(() => ({
  drawHeader: vi.fn<(pdf: unknown, data: CabecalhoArg) => number>(),
  drawParties: vi.fn<(pdf: unknown, cards: unknown[], y: number) => number>(),
  drawItemsTable:
    vi.fn<
      (
        pdf: unknown,
        items: unknown[],
        y: number,
        onNewPage: () => number,
        photos?: Map<string, unknown>
      ) => { y: number }
    >(),
  drawTotals: vi.fn<(pdf: unknown, totais: TotaisArg, y: number) => number>(),
  drawPayment:
    vi.fn<(pdf: unknown, installments: unknown[], y: number) => number>(),
  drawNotes: vi.fn(),
  drawFooters: vi.fn(),
  loadGirusLogo: vi.fn(),
  loadImage: vi.fn(),
  trimTransparent: vi.fn(),
  factoryCard: vi.fn(() => ({ title: "Fábrica" })),
  clientCard: vi.fn(() => ({ title: "Cliente" })),
}));

vi.mock("./header", () => ({ drawHeader }));
vi.mock("./parties", () => ({ drawParties }));
vi.mock("./itemsTable", () => ({ drawItemsTable }));
vi.mock("./summary", () => ({ drawTotals, drawPayment, drawNotes }));
vi.mock("./cards", () => ({ factoryCard, clientCard }));
vi.mock("@/utils/pdf/footer", () => ({ drawFooters, loadGirusLogo }));
vi.mock("@/utils/media", () => ({ loadImage }));
vi.mock("@/utils/image", () => ({ trimTransparent }));

const marca = { dataUrl: "data:image/png;base64,AA", width: 100, height: 40 };

const pedido = (overrides: Partial<OrderDetail> = {}): OrderDetail =>
  ({
    id: "9f8e7d6c-1111-2222-3333-444455556666",
    orderDate: "2026-08-01",
    status: "CONFIRMED",
    totalAmount: "1000.00",
    taxAmount: "100.00",
    ipiAmount: "50.00",
    notes: null,
    paymentTerm: null,
    installments: [],
    factory: {
      id: "f-1",
      nomeFantasia: "Fábrica Alfa",
      razaoSocial: "Fábrica Alfa LTDA",
      logoUrl: "/media/fabrica.png",
    },
    client: { id: "c-1", razaoSocial: "Cliente LTDA", nomeFantasia: "Cliente" },
    ...overrides,
  }) as unknown as OrderDetail;

const item = (id: string, imageUrl: string | null): OrderItem =>
  ({
    id: `item-${id}`,
    quantity: "1",
    unitPrice: "100.00",
    product: { id, name: `Produto ${id}`, imageUrl },
  }) as unknown as OrderItem;

const cabecalho = () => drawHeader.mock.calls[0]![1];
const totais = () => drawTotals.mock.calls[0]![1];

let save: ReturnType<typeof vi.fn>;

beforeEach(() => {
  save = vi.fn();
  vi.resetModules();
  // O `save` do jsPDF é próprio da INSTÂNCIA e ela nasce dentro da função —
  // daí trocar o módulo inteiro. A geometria que a montagem usa é só a margem.
  vi.doMock("jspdf", () => ({
    jsPDF: class {
      save = save;
      internal = { pageSize: { getWidth: () => 842, getHeight: () => 595 } };
      addPage() {}
      getNumberOfPages() {
        return 1;
      }
    },
  }));

  drawHeader.mockReset().mockReturnValue(120);
  drawParties.mockReset().mockReturnValue(200);
  drawItemsTable.mockReset().mockReturnValue({ y: 300 });
  drawTotals.mockReset().mockReturnValue(360);
  drawPayment.mockReset().mockReturnValue(400);
  drawNotes.mockReset();
  drawFooters.mockReset();
  loadGirusLogo.mockReset().mockResolvedValue(marca);
  loadImage.mockReset().mockResolvedValue(marca);
  trimTransparent.mockReset().mockImplementation(async (img: unknown) => img);
});

/** Reimporta o módulo para pegar o `jspdf` trocado no `beforeEach`. */
const exportar = async (...args: Parameters<typeof exportOrderPdf>) => {
  const modulo = await import("./index");
  return modulo.exportOrderPdf(...args);
};

describe("exportOrderPdf", () => {
  it("o total soma o IPI por cima do subtotal, que já embute o imposto", () => {
    // Mesma conta do OrderSummaryCard na tela: 1000 de mercadoria + 100 de ST
    // = 1100 de subtotal; com 50 de IPI, 1150 a pagar.
    return exportar(pedido(), []).then(() => {
      expect(totais()).toEqual({
        subtotal: "1100.00",
        ipiAmount: "50.00",
        total: 1150,
      });
    });
  });

  it("pedido sem imposto nem IPI fecha no valor da mercadoria", async () => {
    await exportar(
      pedido({
        taxAmount: null,
        ipiAmount: "0",
      } as unknown as Partial<OrderDetail>),
      []
    );

    expect(totais()).toEqual({
      subtotal: "1000.00",
      ipiAmount: "0",
      total: 1000,
    });
  });

  it.each([
    ["DRAFT", "Orçamento", "orçamento"],
    ["SENT", "Orçamento", "orçamento"],
    ["CONFIRMED", "Pedido", "pedido"],
    ["INVOICED", "Pedido", "pedido"],
  ])(
    "status %s sai como %s no documento e no nome do arquivo",
    async (status, docKind, arquivo) => {
      await exportar(pedido({ status } as Partial<OrderDetail>), []);

      expect(cabecalho().docKind).toBe(docKind);
      expect(save).toHaveBeenCalledWith(`${arquivo}-9F8E7D6C.pdf`);
    }
  );

  it("o número do documento é o começo do id, em caixa alta", async () => {
    // O id inteiro não cabe no topo e não é o que o cliente repete no telefone.
    await exportar(pedido(), []);

    expect(cabecalho().number).toBe("9F8E7D6C");
  });

  it("leva a data do pedido, não a de hoje", async () => {
    await exportar(pedido(), []);

    expect(cabecalho().issuedAt).toBe("01/08/2026");
  });

  it("recorta a moldura das três logos antes de desenhar", async () => {
    // É o recorte que faz a logo da empresa e a da fábrica saírem do mesmo
    // tamanho no topo.
    await exportar(pedido(), [], { companyLogoUrl: "/media/empresa.png" });

    expect(loadImage).toHaveBeenCalledWith("/media/empresa.png");
    expect(loadImage).toHaveBeenCalledWith("/media/fabrica.png");
    expect(trimTransparent).toHaveBeenCalledTimes(3);
    expect(cabecalho().companyLogo).toBe(marca);
    expect(cabecalho().factoryLogo).toBe(marca);
  });

  it("logo que não carrega não impede a emissão", async () => {
    loadImage.mockResolvedValue(null);
    loadGirusLogo.mockResolvedValue(null);

    await exportar(pedido(), []);

    expect(cabecalho().companyLogo).toBeNull();
    expect(save).toHaveBeenCalled();
  });

  it("por padrão NÃO baixa as fotos dos produtos", async () => {
    // Dezenas de imagens embutidas engordam o arquivo e a geração é toda no
    // navegador.
    await exportar(pedido(), [item("p1", "/media/p1.png")]);

    expect(loadImage).not.toHaveBeenCalledWith("/media/p1.png");
    expect(drawItemsTable.mock.calls[0]![4]).toBeUndefined();
  });

  it("com fotos ligadas, indexa uma por produto que tem imagem", async () => {
    await exportar(
      pedido(),
      [
        item("p1", "/media/p1.png"),
        item("p2", null),
        item("p3", "/media/p3.png"),
      ],
      { withPhotos: true }
    );

    const photos = drawItemsTable.mock.calls[0]![4] as Map<string, unknown>;
    expect([...photos.keys()]).toEqual(["p1", "p3"]);
  });

  it("foto que falha só tira a miniatura daquela linha", async () => {
    loadImage.mockImplementation(async (url: string | null | undefined) =>
      url === "/media/p1.png" ? null : marca
    );

    await exportar(
      pedido(),
      [item("p1", "/media/p1.png"), item("p2", "/media/p2.png")],
      { withPhotos: true }
    );

    const photos = drawItemsTable.mock.calls[0]![4] as Map<string, unknown>;
    expect([...photos.keys()]).toEqual(["p2"]);
  });

  it("a tabela de itens abre página nova pela margem, sem repetir o cabeçalho", async () => {
    // Repetir o cabeçalho completo a cada folha poluiria o documento.
    await exportar(pedido(), []);

    const onNewPage = drawItemsTable.mock.calls[0]![3];
    expect(onNewPage()).toBe(40);
  });

  it("desenha os blocos na ordem em que se lê o papel", async () => {
    await exportar(pedido(), []);

    const ordem = [
      drawHeader,
      drawParties,
      drawItemsTable,
      drawTotals,
      drawPayment,
      drawNotes,
      drawFooters,
    ].map((fn) => fn.mock.invocationCallOrder[0]!);

    expect(ordem).toEqual([...ordem].sort((a, b) => a - b));
  });

  it("cada bloco começa onde o anterior terminou", async () => {
    await exportar(pedido(), []);

    expect(drawParties.mock.calls[0]![2]).toBe(120);
    expect(drawItemsTable.mock.calls[0]![2]).toBe(200);
    expect(drawTotals.mock.calls[0]![2]).toBe(300);
    expect(drawPayment.mock.calls[0]![2]).toBe(360);
    expect(drawNotes.mock.calls[0]![2]).toBe(400);
  });

  it("pedido sem parcelas ainda passa pelo bloco de pagamento", async () => {
    await exportar(
      pedido({ installments: null } as unknown as Partial<OrderDetail>),
      []
    );

    expect(drawPayment.mock.calls[0]![1]).toEqual([]);
  });

  it("o rodapé é o último traço, com a marca do sistema", async () => {
    await exportar(pedido(), []);

    expect(drawFooters).toHaveBeenCalledWith(expect.anything(), marca);
  });
});
