import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trimTransparent } from "./image";

const { decodeImage } = vi.hoisted(() => ({ decodeImage: vi.fn() }));
vi.mock("./imageDecode", () => ({ decodeImage }));

/** Pixels de uma imagem WxH com o desenho num retângulo opaco. */
const pixels = (
  width: number,
  height: number,
  desenho: { left: number; top: number; right: number; bottom: number } | null
) => {
  const data = new Uint8ClampedArray(width * height * 4);
  if (desenho) {
    for (let y = desenho.top; y <= desenho.bottom; y += 1) {
      for (let x = desenho.left; x <= desenho.right; x += 1) {
        data[(y * width + x) * 4 + 3] = 255;
      }
    }
  }
  return data;
};

/**
 * Canvas de mentira: o jsdom não rasteriza. O primeiro é o que LÊ os pixels
 * (onde o recorte é calculado); o segundo é o que recebe o corte.
 */
function stubCanvases(
  data: Uint8ClampedArray,
  opts: { semContexto?: boolean; semContextoNoCorte?: boolean } = {}
) {
  const criados: {
    width: number;
    height: number;
    getContext: ReturnType<typeof vi.fn>;
    toDataURL: ReturnType<typeof vi.fn>;
  }[] = [];
  const drawImage = vi.fn();

  vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
    if (tag !== "canvas") throw new Error(`inesperado: ${tag}`);
    const primeiro = criados.length === 0;
    const semContexto = primeiro ? opts.semContexto : opts.semContextoNoCorte;
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() =>
        semContexto
          ? null
          : {
              drawImage,
              getImageData: () => ({ data }),
            }
      ),
      toDataURL: vi.fn(() => "data:image/png;base64,RECORTADA"),
    };
    criados.push(canvas);
    return canvas as unknown as HTMLElement;
  }) as never);

  return { criados, drawImage };
}

const original = (width: number, height: number) => ({
  dataUrl: "data:image/png;base64,ORIGINAL",
  width,
  height,
});

const elemento = (width: number, height: number) =>
  ({ naturalWidth: width, naturalHeight: height }) as HTMLImageElement;

beforeEach(() => decodeImage.mockReset());
afterEach(() => vi.restoreAllMocks());

describe("trimTransparent", () => {
  it("recorta a moldura transparente em volta do desenho", async () => {
    // O caso real: logo 10x10 com o desenho ocupando um quadrado 4x4 no meio.
    // Sem recortar, "mesma altura" no cabeçalho do PDF significa altura do
    // ARQUIVO, e a logo mais folgada aparece bem menor que a outra.
    decodeImage.mockResolvedValue(elemento(10, 10));
    const { drawImage } = stubCanvases(
      pixels(10, 10, { left: 3, top: 2, right: 6, bottom: 5 })
    );

    const out = await trimTransparent(original(10, 10));

    expect(out).toEqual({
      dataUrl: "data:image/png;base64,RECORTADA",
      width: 4,
      height: 4,
    });
    // Copia exatamente a área do desenho para a origem do novo canvas.
    expect(drawImage).toHaveBeenLastCalledWith(
      expect.anything(),
      3,
      2,
      4,
      4,
      0,
      0,
      4,
      4
    );
  });

  it("imagem já sem margem volta como está, sem recodificar", async () => {
    decodeImage.mockResolvedValue(elemento(4, 4));
    stubCanvases(pixels(4, 4, { left: 0, top: 0, right: 3, bottom: 3 }));
    const entrada = original(4, 4);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("logo toda transparente volta como está", async () => {
    decodeImage.mockResolvedValue(elemento(4, 4));
    stubCanvases(pixels(4, 4, null));
    const entrada = original(4, 4);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("ignora o anti-aliasing: alfa baixo não conta como desenho", async () => {
    decodeImage.mockResolvedValue(elemento(4, 4));
    const data = pixels(4, 4, { left: 1, top: 1, right: 2, bottom: 2 });
    // Borda com alfa 5 (abaixo do limiar) em volta do desenho.
    data[3] = 5;
    stubCanvases(data);

    const out = await trimTransparent(original(4, 4));

    expect(out).toEqual(expect.objectContaining({ width: 2, height: 2 }));
  });

  it("sem imagem, não há o que recortar", async () => {
    await expect(trimTransparent(null)).resolves.toBeNull();
    expect(decodeImage).not.toHaveBeenCalled();
  });

  it("imagem sem dimensão volta como está", async () => {
    decodeImage.mockResolvedValue(elemento(0, 0));
    const entrada = original(0, 0);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("sem canvas disponível (SSR), o documento sai com a logo original", async () => {
    decodeImage.mockResolvedValue(elemento(10, 10));
    stubCanvases(pixels(10, 10, null), { semContexto: true });
    const entrada = original(10, 10);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("falha no canvas do corte também devolve a original", async () => {
    decodeImage.mockResolvedValue(elemento(10, 10));
    stubCanvases(pixels(10, 10, { left: 3, top: 2, right: 6, bottom: 5 }), {
      semContextoNoCorte: true,
    });
    const entrada = original(10, 10);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("falha ao decodificar devolve a original — o PDF não deixa de sair", async () => {
    decodeImage.mockRejectedValue(new Error("imagem inválida"));
    const entrada = original(10, 10);

    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
  });

  it("devolve a imagem intacta, sem ficar pendurado, quando não consegue rasterizar", async () => {
    // Com a decodificação DE VERDADE: o jsdom não desenha em canvas e nem
    // dispara onload/onerror — é o mesmo beco de um navegador que nunca
    // responde. O contrato é degradar (o PDF sai com a logo original) e,
    // sobretudo, ASSENTAR. Sem o timeout de decodeImage a promessa nunca
    // resolvia e o botão "Gerar PDF" ficava travado em carregando, sem erro.
    const real =
      await vi.importActual<typeof import("./imageDecode")>("./imageDecode");
    decodeImage.mockImplementation(real.decodeImage);

    const entrada = original(500, 400);
    const started = Date.now();
    await expect(trimTransparent(entrada)).resolves.toBe(entrada);
    expect(Date.now() - started).toBeLessThan(10000);
  }, 15000);
});
