import { describe, expect, it } from "vitest";

import { svgToPng } from "./svgToPng";

describe("svgToPng", () => {
  it("devolve o mesmo arquivo quando não é SVG", async () => {
    const png = new File([new Uint8Array([1, 2, 3])], "marca.png", {
      type: "image/png",
    });
    // Identidade importa: converter um PNG que já serve só perderia qualidade.
    await expect(svgToPng(png)).resolves.toBe(png);
  });

  it("devolve null quando o SVG não pode ser rasterizado", async () => {
    // jsdom não desenha: o caminho de falha é o que dá para exercitar aqui, e
    // é justamente o que precisa avisar o usuário em vez de enviar lixo.
    const svg = new File(
      ["<svg xmlns='http://www.w3.org/2000/svg'/>"],
      "m.svg",
      {
        type: "image/svg+xml",
      }
    );
    await expect(svgToPng(svg)).resolves.toBeNull();
  });
});
