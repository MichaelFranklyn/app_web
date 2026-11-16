import { describe, expect, it } from "vitest";

import { describeDraftImport } from "./utils";

describe("describeDraftImport", () => {
  it("conta os novos e os atualizados", () => {
    expect(describeDraftImport({ items: [], added: 3, updated: 1 })).toBe(
      "3 itens novos e 1 item já na lista com a quantidade da planilha. Nada foi gravado ainda: confira e clique em “Criar pedido”."
    );
  });

  it("singular só com novos", () => {
    expect(describeDraftImport({ items: [], added: 1, updated: 0 })).toMatch(
      /^1 item novo\./
    );
  });

  it("diz quando nada entrou", () => {
    expect(describeDraftImport({ items: [], added: 0, updated: 0 })).toBe(
      "Nenhum item foi levado para a lista."
    );
  });
});
