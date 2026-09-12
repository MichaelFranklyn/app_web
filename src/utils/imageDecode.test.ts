import { afterEach, describe, expect, it, vi } from "vitest";

import { decodeImage } from "./imageDecode";

/**
 * O `Image` do jsdom não busca nada: trocamos por um que guarda os handlers,
 * para o teste decidir se a imagem carregou, falhou ou nunca respondeu.
 */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  static last: FakeImage | null = null;

  constructor() {
    FakeImage.last = this;
  }
}

const stubImage = () => {
  vi.stubGlobal("Image", FakeImage);
  return () => FakeImage.last!;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("decodeImage", () => {
  it("entrega a imagem quando ela carrega", async () => {
    const image = stubImage();
    const promise = decodeImage("data:image/png;base64,AAAA");

    image().onload!();

    await expect(promise).resolves.toBe(image());
    expect(image().src).toBe("data:image/png;base64,AAAA");
  });

  it("recusa a fonte que o navegador não consegue ler", async () => {
    const image = stubImage();
    const promise = decodeImage("data:image/png;base64,quebrado");

    image().onerror!();

    await expect(promise).rejects.toThrow("imagem inválida");
  });

  it("desiste da imagem que nunca responde", async () => {
    // Sem o teto, quem espera — a geração do PDF, o preview da logo — ficaria
    // pendurado para sempre, com o botão travado em "carregando".
    vi.useFakeTimers();
    stubImage();
    const promise = decodeImage("http://lento.example/logo.png", 1000);
    const assertion = expect(promise).rejects.toThrow(
      "tempo esgotado ao ler a imagem"
    );

    await vi.advanceTimersByTimeAsync(1000);

    await assertion;
  });

  it("imagem que chegou a tempo não é derrubada pelo teto", async () => {
    vi.useFakeTimers();
    const image = stubImage();
    const promise = decodeImage("data:image/png;base64,AAAA", 1000);

    image().onload!();
    await vi.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toBe(image());
  });
});
