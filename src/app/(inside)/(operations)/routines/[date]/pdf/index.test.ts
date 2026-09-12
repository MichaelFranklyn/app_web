import { beforeEach, describe, expect, it, vi } from "vitest";

import { VisitItem } from "../interface";
import { buildDayRoutePdf } from "./index";

/**
 * A folha da rota é COMPOSIÇÃO: o cabeçalho, a tabela e o rodapé têm testes
 * próprios (utils/pdf). O que se prende aqui é a montagem — o recorte que vai
 * no topo, as ligações em bloco separado e o rodapé desenhado por último.
 */
/** O que a montagem entrega a cada desenho — tipado para os testes poderem ler
 * os argumentos sem `any`. */
interface CabecalhoArg {
  companyName: string | null;
  companyLogo: unknown;
  title: string;
  highlight?: string | null;
  context?: string[];
  issuedAt: string;
}

interface TabelaArg {
  columns: unknown[];
  rows: unknown[];
  startY: number;
  onNewPage: () => number;
}

const {
  drawReportHeader,
  drawReportTable,
  drawFooters,
  loadGirusLogo,
  loadImage,
  trimTransparent,
} = vi.hoisted(() => ({
  drawReportHeader: vi.fn<(pdf: unknown, data: CabecalhoArg) => number>(),
  drawReportTable: vi.fn<(pdf: unknown, options: TabelaArg) => number>(),
  drawFooters: vi.fn(),
  loadGirusLogo: vi.fn(),
  loadImage: vi.fn(),
  trimTransparent: vi.fn(),
}));

vi.mock("@/utils/pdf/reportHeader", () => ({ drawReportHeader }));
vi.mock("@/utils/pdf/table", () => ({ drawReportTable }));
vi.mock("@/utils/pdf/footer", () => ({ drawFooters, loadGirusLogo }));
vi.mock("@/utils/media", () => ({ loadImage }));
vi.mock("@/utils/image", () => ({ trimTransparent }));

const marca = { dataUrl: "data:image/png;base64,AA", width: 100, height: 40 };

const stop = (over: Partial<VisitItem> = {}): VisitItem =>
  ({
    id: "it-1",
    fixedScheduleId: null,
    plannedOrder: 1,
    contactType: "IN_PERSON",
    estimatedTravelMin: null,
    plannedStartTime: "09:40",
    plannedEndTime: "10:10",
    visitDurationMin: 30,
    status: "PENDING",
    isWholeDay: false,
    viability: null,
    outcome: null,
    notes: null,
    focusFactories: [],
    treatedFactories: [],
    clientFactoryLink: null,
    ...over,
  }) as VisitItem;

const meta = {
  date: "2026-09-11",
  sellerName: "Ana",
  departureAddress: "Rua A, 100",
  routeDistanceKm: "42.5",
  routeDurationMin: 75,
  companyName: "Representação Teste",
  companyLogoUrl: "/media/logo.png",
};

const cabecalho = () => drawReportHeader.mock.calls[0]![1];

beforeEach(() => {
  drawReportHeader.mockClear().mockReturnValue(120);
  drawReportTable.mockClear().mockReturnValue(300);
  drawFooters.mockClear();
  loadGirusLogo.mockReset().mockResolvedValue(marca);
  loadImage.mockReset().mockResolvedValue(marca);
  trimTransparent.mockReset().mockImplementation(async (img: unknown) => img);
});

describe("buildDayRoutePdf", () => {
  it("sai em paisagem: em retrato o endereço saía cortado", async () => {
    // Endereço pela metade não leva ninguém a lugar nenhum.
    const pdf = await buildDayRoutePdf([stop()], [], meta);

    const { width, height } = pdf.internal.pageSize;
    expect(width).toBeGreaterThan(height);
  });

  it("o topo diz de quem é a rota, de que dia e o que ela cobre", async () => {
    await buildDayRoutePdf([stop(), stop({ id: "it-2" })], [stop()], meta);

    expect(cabecalho()).toEqual(
      expect.objectContaining({
        title: "Rota do dia",
        companyName: "Representação Teste",
        highlight: expect.stringContaining("11/09/2026"),
      })
    );
    expect(cabecalho().context).toEqual(
      expect.arrayContaining([
        "Vendedor: Ana",
        "2 parada(s)",
        "1 ligação(ões)",
        "Saída: Rua A, 100",
      ])
    );
  });

  it("recorta a moldura das duas logos antes de desenhar", async () => {
    // Sem recortar, a logo mais folgada aparece menor ao lado da outra.
    await buildDayRoutePdf([stop()], [], meta);

    expect(loadImage).toHaveBeenCalledWith("/media/logo.png");
    expect(trimTransparent).toHaveBeenCalledTimes(2);
    expect(cabecalho().companyLogo).toBe(marca);
  });

  it("logo que não carrega não impede a folha de sair", async () => {
    loadImage.mockResolvedValue(null);
    loadGirusLogo.mockResolvedValue(null);

    const pdf = await buildDayRoutePdf([stop()], [], meta);

    expect(cabecalho().companyLogo).toBeNull();
    expect(pdf.getNumberOfPages()).toBe(1);
    expect(drawFooters).toHaveBeenCalledWith(expect.anything(), null);
  });

  it("desenha uma tabela só quando não há ligações", async () => {
    await buildDayRoutePdf([stop()], [], meta);

    expect(drawReportTable).toHaveBeenCalledTimes(1);
  });

  it("as ligações vêm em bloco separado, depois das paradas", async () => {
    // Misturá-las na sequência faria o vendedor dirigir até um cliente que era
    // só um telefonema.
    await buildDayRoutePdf([stop()], [stop({ contactType: "REMOTE" })], meta);

    expect(drawReportTable).toHaveBeenCalledTimes(2);
    const [paradas, ligacoes] = drawReportTable.mock.calls.map((c) => c[1]!);
    expect(paradas.rows).toHaveLength(1);
    expect(ligacoes.rows).toHaveLength(1);
    // A segunda tabela começa abaixo de onde a primeira terminou.
    expect(ligacoes.startY).toBeGreaterThan(paradas.startY);
  });

  it("dia só de ligações sai sem a tabela de paradas", async () => {
    await buildDayRoutePdf([], [stop({ contactType: "REMOTE" })], meta);

    expect(drawReportTable).toHaveBeenCalledTimes(1);
    expect(drawReportTable.mock.calls[0]![1].rows).toHaveLength(1);
  });

  it("dia vazio ainda gera a folha, com cabeçalho e rodapé", async () => {
    await buildDayRoutePdf([], [], meta);

    expect(drawReportTable).not.toHaveBeenCalled();
    expect(drawReportHeader).toHaveBeenCalledTimes(1);
    expect(drawFooters).toHaveBeenCalledTimes(1);
  });

  it("não começa as ligações no pé da página", async () => {
    // O título abriria numa folha e as linhas na seguinte.
    drawReportTable.mockReturnValue(560);

    const pdf = await buildDayRoutePdf(
      [stop()],
      [stop({ contactType: "REMOTE" })],
      meta
    );

    expect(pdf.getNumberOfPages()).toBe(2);
    const ligacoes = drawReportTable.mock.calls[1]![1];
    expect(ligacoes.startY).toBeLessThan(100);
  });

  it("com espaço sobrando, as ligações continuam na mesma folha", async () => {
    drawReportTable.mockReturnValue(200);

    const pdf = await buildDayRoutePdf(
      [stop()],
      [stop({ contactType: "REMOTE" })],
      meta
    );

    expect(pdf.getNumberOfPages()).toBe(1);
  });

  it("o rodapé é o último traço: só aí o total de páginas é conhecido", async () => {
    await buildDayRoutePdf([stop()], [], meta);

    expect(drawFooters).toHaveBeenCalledWith(expect.anything(), marca);
    expect(drawFooters.mock.invocationCallOrder[0]!).toBeGreaterThan(
      drawReportTable.mock.invocationCallOrder[0]!
    );
  });

  it("a tabela abre página nova pelo callback recebido", async () => {
    const pdf = await buildDayRoutePdf([stop()], [], meta);
    const { onNewPage } = drawReportTable.mock.calls[0]![1];

    const y = onNewPage();

    expect(pdf.getNumberOfPages()).toBe(2);
    expect(y).toBe(40);
  });
});

describe("exportDayRoutePdf", () => {
  it("baixa o arquivo nomeado pelo dia da rota", async () => {
    // O `save` do jsPDF é próprio da INSTÂNCIA (não do prototype), e a
    // instância nasce dentro da função — daí trocar o módulo inteiro aqui.
    const save = vi.fn();
    vi.resetModules();
    vi.doMock("jspdf", () => ({
      jsPDF: class {
        save = save;
        internal = {
          pageSize: { getWidth: () => 842, getHeight: () => 595 },
        };
        addPage() {}
        getNumberOfPages() {
          return 1;
        }
      },
    }));

    const { exportDayRoutePdf: exportar } = await import("./index");
    await exportar([stop()], [], meta);

    expect(save).toHaveBeenCalledWith("rota-2026-09-11.pdf");
    vi.doUnmock("jspdf");
  });
});
