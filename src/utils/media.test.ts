import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadImage, loadImageFromUrl, mediaUrl } from "./media";

const { decodeImage } = vi.hoisted(() => ({ decodeImage: vi.fn() }));
vi.mock("./imageDecode", () => ({ decodeImage }));

const fetchMock = vi.fn();

beforeEach(() => {
  decodeImage.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "https://api.girus.app/graphql");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const respostaComImagem = (ok = true) => ({
  ok,
  blob: async () => new Blob(["png"], { type: "image/png" }),
});

const imagem = (width: number, height: number) =>
  ({ naturalWidth: width, naturalHeight: height }) as HTMLImageElement;

describe("mediaUrl", () => {
  it("prefixa o caminho relativo com a origem da API", () => {
    // O backend devolve só o caminho: quem serve (disco em dev, Storage em
    // produção) é detalhe dele.
    expect(mediaUrl("/media/logo.png")).toBe(
      "https://api.girus.app/media/logo.png"
    );
  });

  it("deixa a URL absoluta como está", () => {
    expect(mediaUrl("https://cdn.externo/logo.png")).toBe(
      "https://cdn.externo/logo.png"
    );
    expect(mediaUrl("http://cdn.externo/logo.png")).toBe(
      "http://cdn.externo/logo.png"
    );
  });

  it("sem caminho, não inventa URL", () => {
    expect(mediaUrl(null)).toBeUndefined();
    expect(mediaUrl(undefined)).toBeUndefined();
    expect(mediaUrl("")).toBeUndefined();
  });

  it("sem host de API configurado, devolve indefinido em vez de URL quebrada", () => {
    vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "");
    expect(mediaUrl("/media/logo.png")).toBeUndefined();
  });
});

describe("loadImageFromUrl", () => {
  it("baixa a imagem e devolve data URL com as dimensões", async () => {
    fetchMock.mockResolvedValue(respostaComImagem());
    decodeImage.mockResolvedValue(imagem(412, 134));

    const loaded = await loadImageFromUrl("/horizontal_logo.png");

    expect(loaded).toEqual({
      dataUrl: expect.stringMatching(/^data:/),
      width: 412,
      height: 134,
    });
  });

  it("busca sem cache: a entrada do <img> não tem cabeçalho CORS", async () => {
    // Reaproveitar aquela resposta faria o fetch ser bloqueado e o PDF sair sem
    // a logo, só em algumas máquinas.
    fetchMock.mockResolvedValue(respostaComImagem());
    decodeImage.mockResolvedValue(imagem(10, 10));

    await loadImageFromUrl("/logo.png");

    expect(fetchMock).toHaveBeenCalledWith("/logo.png", {
      mode: "cors",
      cache: "no-store",
    });
  });

  it("sem URL, nem tenta a rede", async () => {
    await expect(loadImageFromUrl(null)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resposta de erro vira nulo — o PDF sai sem a logo", async () => {
    fetchMock.mockResolvedValue(respostaComImagem(false));

    await expect(loadImageFromUrl("/some.png")).resolves.toBeNull();
  });

  it("falha de rede vira nulo, não exceção", async () => {
    fetchMock.mockRejectedValue(new Error("CORS"));

    await expect(loadImageFromUrl("/some.png")).resolves.toBeNull();
  });

  it("arquivo que não decodifica vira nulo", async () => {
    fetchMock.mockResolvedValue(respostaComImagem());
    decodeImage.mockRejectedValue(new Error("imagem inválida"));

    await expect(loadImageFromUrl("/some.png")).resolves.toBeNull();
  });

  it("imagem sem dimensão vira nulo: jsPDF não sabe desenhá-la", async () => {
    fetchMock.mockResolvedValue(respostaComImagem());
    decodeImage.mockResolvedValue(imagem(0, 0));

    await expect(loadImageFromUrl("/some.png")).resolves.toBeNull();
  });
});

describe("loadImage", () => {
  it("resolve o caminho da API antes de baixar", async () => {
    fetchMock.mockResolvedValue(respostaComImagem());
    decodeImage.mockResolvedValue(imagem(100, 50));

    await loadImage("/media/logo.png");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.girus.app/media/logo.png",
      expect.anything()
    );
  });

  it("sem caminho, não busca nada", async () => {
    await expect(loadImage(null)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
