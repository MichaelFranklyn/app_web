import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { describe, expect, it } from "vitest";

import { OfflineEntry } from "./interface";
import {
  dropExpired,
  isConnectivityError,
  isSessionError,
  localDay,
  MAX_ENTRY_AGE_MS,
  stockObservationsDraft,
  upsertEntry,
  visitStatusDraft,
} from "./utils";

const serverError = (status: number) =>
  new ServerError("http", {
    response: new Response("", { status }),
    bodyText: "",
  });

const graphQLError = (code: number) =>
  new CombinedGraphQLErrors({
    errors: [{ message: "x", extensions: { code } }],
  });

describe("isConnectivityError", () => {
  it("sem rede (fetch recusado) vai para a fila", () => {
    expect(isConnectivityError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("o teto de espera vencido vai para a fila", () => {
    expect(
      isConnectivityError(new DOMException("timeout", "TimeoutError"))
    ).toBe(true);
  });

  it("502/503/504 — nosso caminho sem chegar ao backend — vão para a fila", () => {
    expect(isConnectivityError(serverError(502))).toBe(true);
    expect(isConnectivityError(serverError(503))).toBe(true);
    expect(isConnectivityError(serverError(504))).toBe(true);
  });

  it("recusa do servidor NÃO vai: não melhora com o tempo", () => {
    expect(isConnectivityError(serverError(500))).toBe(false);
    expect(isConnectivityError(serverError(403))).toBe(false);
    expect(isConnectivityError(graphQLError(404))).toBe(false);
    expect(isConnectivityError(new Error("Visita não encontrada"))).toBe(false);
  });
});

describe("isSessionError", () => {
  it("sessão vencida é esperar, não descartar", () => {
    expect(isSessionError(serverError(401))).toBe(true);
    expect(isSessionError(graphQLError(401))).toBe(true);
  });

  it("outras recusas não são de sessão", () => {
    expect(isSessionError(graphQLError(403))).toBe(false);
    expect(isSessionError(new TypeError("Failed to fetch"))).toBe(false);
  });
});

const NOW = new Date("2026-09-28T14:30:00-03:00");

const entry = (key: string, createdAt: string): OfflineEntry => ({
  kind: "visitStatus",
  key,
  userId: "u1",
  createdAt,
  label: "Loja",
  variables: { id: key, status: "COMPLETED" },
});

describe("upsertEntry", () => {
  it("a resposta nova do mesmo assunto troca a antiga e vai para o fim", () => {
    const a = entry("visit:a", "2026-09-28T10:00:00Z");
    const b = entry("visit:b", "2026-09-28T11:00:00Z");
    const a2 = entry("visit:a", "2026-09-28T12:00:00Z");
    expect(upsertEntry([a, b], a2)).toEqual([b, a2]);
  });
});

describe("dropExpired", () => {
  it("descarta o que passou de 7 dias", () => {
    const fresh = entry(
      "visit:a",
      new Date(NOW.getTime() - 1000).toISOString()
    );
    const old = entry(
      "visit:b",
      new Date(NOW.getTime() - MAX_ENTRY_AGE_MS - 1000).toISOString()
    );
    expect(dropExpired([fresh, old], NOW.getTime())).toEqual([fresh]);
  });
});

describe("visitStatusDraft", () => {
  it("concluir guarda a hora do TOQUE como hora da visita", () => {
    const draft = visitStatusDraft(
      { id: "v1", status: "COMPLETED", label: "Loja" },
      NOW
    );
    expect(draft.key).toBe("visit:v1");
    expect(draft.variables).toEqual({
      id: "v1",
      status: "COMPLETED",
      actualVisitAt: NOW.toISOString(),
    });
  });

  it("reabrir não carrega hora de visita", () => {
    const draft = visitStatusDraft(
      { id: "v1", status: "PENDING", label: "Loja" },
      NOW
    );
    expect(draft.variables).toEqual({ id: "v1", status: "PENDING" });
  });

  it("respeita a hora que quem chama já decidiu (visita vencida)", () => {
    const draft = visitStatusDraft(
      {
        id: "v1",
        status: "COMPLETED",
        label: "Loja",
        actualVisitAt: "2026-09-25T12:00:00.000Z",
      },
      NOW
    );
    expect(draft.variables).toMatchObject({
      actualVisitAt: "2026-09-25T12:00:00.000Z",
    });
  });
});

describe("stockObservationsDraft", () => {
  it("leva o dia em que a prateleira foi vista", () => {
    const draft = stockObservationsDraft(
      {
        itemId: "v1",
        label: "Loja",
        observations: [{ productId: "p1", daysRemaining: 10 }],
      },
      NOW
    );
    expect(draft.key).toBe("stock:v1");
    expect(draft.variables).toMatchObject({
      itemId: "v1",
      observedOn: localDay(NOW),
    });
  });
});
