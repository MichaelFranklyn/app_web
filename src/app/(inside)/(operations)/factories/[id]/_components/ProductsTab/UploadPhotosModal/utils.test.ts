import { describe, expect, it } from "vitest";

import { PhotoAssignment } from "./interface";
import {
  assignedPhotos,
  chunk,
  duplicatedProductIds,
  summarize,
  UPLOAD_BATCH_SIZE,
} from "./utils";

const photo = (name: string, productId: string): PhotoAssignment => ({
  file: new File([""], name),
  previewUrl: `blob:${name}`,
  productId,
});

describe("chunk", () => {
  it("fatia no tamanho do lote e deixa o resto no último", () => {
    // O envio é base64 pelo BFF: o lote existe para o corpo não estourar e
    // para uma falha de rede custar oito fotos, não o envio inteiro.
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("lista vazia não gera lote nenhum", () => {
    expect(chunk([])).toEqual([]);
  });

  it("usa o lote de envio quando não lhe dizem o tamanho", () => {
    const batches = chunk(Array.from({ length: 20 }, (_, i) => i));

    expect(batches[0]).toHaveLength(UPLOAD_BATCH_SIZE);
    expect(batches).toHaveLength(3);
  });
});

describe("conferência das fotos", () => {
  it("só sobem as fotos que acharam produto", () => {
    // Foto sem produto não é erro: é como o usuário descarta uma foto da lista
    // sem removê-la da tela.
    const photos = [photo("a.jpg", "p1"), photo("sem-dono.jpg", "")];

    expect(assignedPhotos(photos).map((p) => p.file.name)).toEqual(["a.jpg"]);
  });

  it("aponta o produto que recebeu duas fotos", () => {
    // "CP-001.jpg" e "CP-001.png" casam com o mesmo produto: sem o aviso, a
    // última gravada venceria em silêncio.
    const photos = [
      photo("CP-001.jpg", "p1"),
      photo("CP-001.png", "p1"),
      photo("CP-002.jpg", "p2"),
    ];

    expect([...duplicatedProductIds(photos)]).toEqual(["p1"]);
  });

  it("não conta como duplicado quem ficou sem produto", () => {
    const photos = [photo("a.jpg", ""), photo("b.jpg", "")];

    expect(duplicatedProductIds(photos).size).toBe(0);
  });

  it("resume o que vai subir, o que sobrou e o que conflita", () => {
    const photos = [
      photo("CP-001.jpg", "p1"),
      photo("CP-001.png", "p1"),
      photo("CP-002.jpg", "p2"),
      photo("foto-solta.jpg", ""),
    ];

    expect(summarize(photos)).toEqual({
      total: 4,
      matched: 3,
      unmatched: 1,
      duplicated: 1,
    });
  });
});
