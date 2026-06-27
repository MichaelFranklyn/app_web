import { afterEach, describe, expect, it, vi } from "vitest";

import { fileToBase64 } from "./file";

afterEach(() => vi.restoreAllMocks());

describe("fileToBase64", () => {
  it("devolve o conteúdo em base64 sem o prefixo data URL", async () => {
    const file = new File(["abc"], "a.txt", { type: "text/plain" });
    // base64 de "abc" = "YWJj"
    expect(await fileToBase64(file)).toBe("YWJj");
  });

  it("rejeita com mensagem padrão quando a leitura falha", async () => {
    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>);
      }
    );
    await expect(fileToBase64(new File(["x"], "x.txt"))).rejects.toThrow(
      "Falha ao ler o arquivo."
    );
  });
});
