import { describe, expect, it } from "vitest";
import { readPushAnswer } from "./usePushAnswer";

const params = (query: string) => new URLSearchParams(query);

describe("readPushAnswer", () => {
  it("lê a visita e a resposta do botão do aviso", () => {
    expect(readPushAnswer(params("visit=v1&answer=done"))).toEqual({
      visitId: "v1",
      answer: "done",
    });
    expect(readPushAnswer(params("visit=v1&answer=missed&kind=call"))).toEqual({
      visitId: "v1",
      answer: "missed",
    });
  });

  it("só o toque no corpo do aviso (sem botão) não responde nada", () => {
    expect(readPushAnswer(params("visit=v1"))).toBeNull();
  });

  it("ignora resposta desconhecida ou sem visita", () => {
    expect(readPushAnswer(params("visit=v1&answer=talvez"))).toBeNull();
    expect(readPushAnswer(params("answer=done"))).toBeNull();
    expect(readPushAnswer(params(""))).toBeNull();
  });
});
