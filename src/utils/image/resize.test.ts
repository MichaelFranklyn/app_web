import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_IMAGE_SIDE, resizeImage, toJpegName } from "./resize";

const { decodeImage } = vi.hoisted(() => ({ decodeImage: vi.fn() }));
vi.mock("@/utils/imageDecode", () => ({ decodeImage }));

/**
 * O jsdom não rasteriza: sem um canvas de mentira, `getContext` devolve null e
 * todo caso cairia no mesmo atalho ("devolve o original"). Este duble registra
 * o que foi desenhado para o teste afirmar o TAMANHO da redução.
 */
function stubCanvas(
  blob: Blob | null = new Blob(["x"], { type: "image/jpeg" })
) {
  const context = {
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((cb: (b: Blob | null) => void) => cb(blob)),
  };
  const real = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation(((tag: string) =>
    tag === "canvas"
      ? (canvas as unknown as HTMLElement)
      : real(tag)) as never);
  return { canvas, context };
}

const arquivo = (name: string, type: string) =>
  new File(["conteúdo"], name, { type });

const imagem = (width: number, height: number) =>
  ({ naturalWidth: width, naturalHeight: height }) as HTMLImageElement;

beforeEach(() => {
  decodeImage.mockReset();
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:teste"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("resizeImage", () => {
  it("não mexe no que não é imagem raster", async () => {
    const pdf = arquivo("tabela.pdf", "application/pdf");

    await expect(resizeImage(pdf)).resolves.toBe(pdf);
    expect(decodeImage).not.toHaveBeenCalled();
  });

  it("encolhe a foto do celular para o maior lado permitido", async () => {
    // 4000x3000 em base64 estouraria o limite de corpo do BFF num lote de fotos.
    const { canvas, context } = stubCanvas();
    decodeImage.mockResolvedValue(imagem(4000, 3000));

    const out = await resizeImage(arquivo("SKU-1.png", "image/png"));

    expect(canvas.width).toBe(MAX_IMAGE_SIDE);
    expect(canvas.height).toBe(750);
    expect(context.drawImage).toHaveBeenCalled();
    expect(out.type).toBe("image/jpeg");
  });

  it("preserva o nome (menos a extensão): é por ele que a foto acha o produto", async () => {
    stubCanvas();
    decodeImage.mockResolvedValue(imagem(2000, 2000));

    const out = await resizeImage(arquivo("SKU-1.png", "image/png"));

    expect(out.name).toBe("SKU-1.jpg");
  });

  it("pinta fundo branco antes de desenhar: PNG transparente viraria preto", async () => {
    const { context } = stubCanvas();
    decodeImage.mockResolvedValue(imagem(500, 500));

    await resizeImage(arquivo("logo.png", "image/png"));

    expect(context.fillStyle).toBe("#ffffff");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 500, 500);
  });

  it("não amplia foto pequena — só encolhe", async () => {
    const { canvas } = stubCanvas();
    decodeImage.mockResolvedValue(imagem(300, 200));

    await resizeImage(arquivo("pequena.png", "image/png"));

    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(200);
  });

  it("JPEG que já cabe sai intacto, sem recomprimir à toa", async () => {
    stubCanvas();
    decodeImage.mockResolvedValue(imagem(800, 600));
    const original = arquivo("foto.jpg", "image/jpeg");

    await expect(resizeImage(original)).resolves.toBe(original);
  });

  it("imagem sem dimensão devolve o original — quem valida é o backend", async () => {
    stubCanvas();
    decodeImage.mockResolvedValue(imagem(0, 0));
    const original = arquivo("quebrada.png", "image/png");

    await expect(resizeImage(original)).resolves.toBe(original);
  });

  it("falha ao decodificar devolve o original em vez de derrubar o envio", async () => {
    decodeImage.mockRejectedValue(new Error("imagem inválida"));
    const original = arquivo("corrompida.png", "image/png");

    await expect(resizeImage(original)).resolves.toBe(original);
  });

  it("canvas indisponível devolve o original", async () => {
    const { canvas } = stubCanvas();
    canvas.getContext.mockReturnValue(null as never);
    decodeImage.mockResolvedValue(imagem(2000, 2000));
    const original = arquivo("foto.png", "image/png");

    await expect(resizeImage(original)).resolves.toBe(original);
  });

  it("canvas que não gera blob devolve o original", async () => {
    stubCanvas(null);
    decodeImage.mockResolvedValue(imagem(2000, 2000));
    const original = arquivo("foto.png", "image/png");

    await expect(resizeImage(original)).resolves.toBe(original);
  });

  it("solta a URL temporária mesmo quando dá errado", async () => {
    // Sem o revoke, cada foto de um lote de cinquenta segura memória até a aba
    // ser fechada.
    decodeImage.mockRejectedValue(new Error("x"));

    await resizeImage(arquivo("foto.png", "image/png"));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:teste");
  });
});

describe("toJpegName", () => {
  it("troca a extensão preservando o resto do nome", () => {
    expect(toJpegName("SKU-1.png")).toBe("SKU-1.jpg");
    expect(toJpegName("foto.JPEG")).toBe("foto.jpg");
  });

  it("nome com ponto no meio perde só a última extensão", () => {
    expect(toJpegName("torneira 1.5 polegadas.png")).toBe(
      "torneira 1.5 polegadas.jpg"
    );
  });

  it("nome sem extensão ganha a do jpeg", () => {
    expect(toJpegName("SKU-1")).toBe("SKU-1.jpg");
  });
});
