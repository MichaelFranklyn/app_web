import { describe, expect, it } from "vitest";

import { trimTransparent } from "./image";

const image = {
  dataUrl: "data:image/png;base64,AAAA",
  width: 500,
  height: 400,
};

describe("trimTransparent", () => {
  it("passa null adiante (logo ausente é caso normal)", async () => {
    await expect(trimTransparent(null)).resolves.toBeNull();
  });

  it("devolve a imagem intacta, sem ficar pendurado, quando não consegue rasterizar", async () => {
    // jsdom não desenha em canvas e nem dispara onload/onerror: é o mesmo
    // beco de um navegador que nunca responde. O contrato é degradar — o PDF
    // sai com a logo original — e, sobretudo, ASSENTAR. Sem o timeout de
    // decodeImage a promessa nunca resolvia e o botão "Gerar PDF" ficava
    // travado em carregando, sem erro nenhum.
    const started = Date.now();
    await expect(trimTransparent(image)).resolves.toBe(image);
    expect(Date.now() - started).toBeLessThan(10000);
  }, 15000);
});
