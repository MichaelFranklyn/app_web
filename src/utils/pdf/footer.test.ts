import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";

import { drawFooters, loadGirusLogo } from "./footer";
import { PAGE } from "./theme";

const { loadImageFromUrl } = vi.hoisted(() => ({
  loadImageFromUrl: vi.fn(),
}));
vi.mock("@/utils/media", () => ({ loadImageFromUrl }));

const setup = (pages = 1) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  for (let i = 1; i < pages; i += 1) pdf.addPage();
  const text = vi.spyOn(pdf, "text");
  const addImage = vi.spyOn(pdf, "addImage").mockReturnValue(pdf);
  const written = () => text.mock.calls.map((call) => String(call[0]));
  return { pdf, text, addImage, written };
};

const marca = { dataUrl: "data:image/png;base64,AAAA", width: 160, height: 40 };

describe("drawFooters", () => {
  it("numera todas as páginas com o total já conhecido", () => {
    // O rodapé é desenhado no fim justamente por isto: durante o fluxo, a
    // página 1 ainda não sabe que o documento terá 3.
    const { pdf, written } = setup(3);
    drawFooters(pdf, null);

    expect(written()).toEqual(
      expect.arrayContaining([
        "Página 1 de 3",
        "Página 2 de 3",
        "Página 3 de 3",
      ])
    );
  });

  it("assina o documento em toda página", () => {
    const { pdf, written } = setup(2);
    drawFooters(pdf, null);

    expect(
      written().filter((t) => t === "Documento gerado pelo Girus")
    ).toHaveLength(2);
  });

  it("com a marca, desenha a logo e afasta o texto dela", () => {
    const { pdf, addImage, text } = setup(1);
    drawFooters(pdf, marca);

    expect(addImage).toHaveBeenCalledTimes(1);
    // addImage é sobrecarregado no jsPDF: a assinatura escolhida pelo TS não é
    // a posicional que o rodapé usa.
    const [, , , largura] = addImage.mock.calls[0] as unknown as number[];

    const assinatura = text.mock.calls.find(
      (call) => String(call[0]) === "Documento gerado pelo Girus"
    );
    expect(Number(assinatura?.[1])).toBeCloseTo(PAGE.margin + largura + 8, 5);
  });

  it("sem a marca, o texto começa na margem", () => {
    const { pdf, text } = setup(1);
    drawFooters(pdf, null);

    const assinatura = text.mock.calls.find(
      (call) => String(call[0]) === "Documento gerado pelo Girus"
    );
    expect(Number(assinatura?.[1])).toBe(PAGE.margin);
  });

  it("a logo respeita a proporção e o teto de altura do rodapé", () => {
    // Estourar a altura faria a marca cruzar a linha do rodapé.
    const { pdf, addImage } = setup(1);
    drawFooters(pdf, marca);

    const [, , , largura, altura] = (
      addImage.mock.calls[0] as unknown as unknown[]
    ).map(Number);
    expect(altura).toBeLessThanOrEqual(18);
    expect(largura / altura).toBeCloseTo(marca.width / marca.height, 5);
  });

  it("a paginação sai alinhada à direita, dentro da margem", () => {
    const { pdf, text } = setup(1);
    drawFooters(pdf, null);

    const pagina = text.mock.calls.find((call) =>
      String(call[0]).startsWith("Página")
    );
    expect(pagina?.[3]).toEqual(expect.objectContaining({ align: "right" }));
    expect(Number(pagina?.[1])).toBe(
      pdf.internal.pageSize.getWidth() - PAGE.margin
    );
  });

  it("deixa o cursor na última página, e não na primeira", () => {
    // Quem chama desenha o rodapé por último, mas um `setPage(1)` esquecido
    // faria qualquer escrita seguinte cair na folha errada.
    const { pdf } = setup(3);
    drawFooters(pdf, null);
    expect(pdf.getCurrentPageInfo().pageNumber).toBe(3);
  });
});

describe("loadGirusLogo", () => {
  it("busca a marca servida pelo próprio front", async () => {
    loadImageFromUrl.mockResolvedValue(marca);
    await expect(loadGirusLogo()).resolves.toBe(marca);
    expect(loadImageFromUrl).toHaveBeenCalledWith("/horizontal_logo.png");
  });

  it("falhando o carregamento, o PDF sai sem a marca em vez de não sair", async () => {
    loadImageFromUrl.mockResolvedValue(null);
    await expect(loadGirusLogo()).resolves.toBeNull();
  });
});
