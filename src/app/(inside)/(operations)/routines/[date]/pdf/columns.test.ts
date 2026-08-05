import { describe, expect, it } from "vitest";

import type { ScoreDimensions } from "@/utils/score";
import { VisitItem } from "../interface";
import {
  buildRouteContext,
  buildStopColumns,
  focusLabel,
  hasProgress,
  REMOTE_CONTACT_COLUMNS,
  ROUTE_STOP_COLUMNS,
  stopReason,
  stopUrgency,
} from "./columns";

const factory = (id: string) => ({
  id,
  nomeFantasia: `Fábrica ${id}`,
  razaoSocial: `Fábrica ${id} LTDA`,
});

const score = (over: Partial<ScoreDimensions> = {}): ScoreDimensions => ({
  scoreTotal: "0",
  scoreUrgency: "0",
  scorePriority: "0",
  scoreFrequency: "0",
  scorePotential: "0",
  scoreRecency: "0",
  // Estoque confirmado por padrão: mantém os pesos nominais e deixa cada teste
  // isolar o fator que quer explicar. Sem lastro a urgência contribui zero e
  // some da lista de motivos (ver @/utils/score).
  stockConfidence: "confirmado",
  ...over,
});

const stop = (over: Partial<VisitItem> = {}): VisitItem => ({
  id: "it-1",
  plannedOrder: 1,
  contactType: "IN_PERSON",
  estimatedTravelMin: null,
  plannedStartTime: "09:40",
  plannedEndTime: "10:10",
  visitDurationMin: 30,
  status: "PENDING",
  // Sem mínimo cadastrado na fábrica — o estado de todo vínculo até o gestor
  // preencher, e o único em que o PDF da rota não fala de pedido mínimo.
  viability: null,
  outcome: null,
  notes: null,
  focusFactories: [],
  treatedFactories: [],
  clientFactoryLink: null,
  ...over,
});

const focus = (id: string, dims?: ScoreDimensions) => ({
  scoreTotal: dims?.scoreTotal ?? null,
  factory: factory(id),
  clientFactoryLink: dims ? { id: `cfl-${id}`, latestVisitScore: dims } : null,
});

describe("focusLabel", () => {
  it("lista as fábricas que motivaram a parada", () => {
    expect(focusLabel(stop({ focusFactories: [focus("a"), focus("b")] }))).toBe(
      "Fábrica a, Fábrica b"
    );
  });

  // A coluna é estreita: da terceira em diante vira contagem, como no card.
  it("resume em +N a partir da terceira fábrica", () => {
    const item = stop({
      focusFactories: [focus("a"), focus("b"), focus("c"), focus("d")],
    });

    expect(focusLabel(item)).toBe("Fábrica a, Fábrica b +2");
  });

  it("cai na fábrica do vínculo nas visitas antigas, sem foco", () => {
    const item = stop({
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("z"),
        latestVisitScore: null,
      },
    });

    expect(focusLabel(item)).toBe("Fábrica z");
  });
});

describe("stopReason", () => {
  it("resume o fator que mais pesou no score", () => {
    const item = stop({
      focusFactories: [
        focus("a", score({ scoreTotal: "70.00", scoreUrgency: "100" })),
      ],
    });

    expect(stopReason(item)).toBe("Estoque acabando");
    expect(stopUrgency(item)).toBe("Urgente · 70");
  });

  it("sem score calculado não inventa motivo", () => {
    expect(stopReason(stop())).toBe("—");
    expect(stopUrgency(stop())).toBeNull();
  });
});

describe("buildStopColumns", () => {
  it("rota do dia (tudo pendente) não gasta largura com situação", () => {
    const columns = buildStopColumns([stop()], ROUTE_STOP_COLUMNS);

    expect(columns).toHaveLength(ROUTE_STOP_COLUMNS.length);
  });

  it("rota já executada vira conferência e ganha a coluna situação", () => {
    const columns = buildStopColumns(
      [stop(), stop({ id: "it-2", status: "COMPLETED" })],
      ROUTE_STOP_COLUMNS
    );

    expect(columns).toHaveLength(ROUTE_STOP_COLUMNS.length + 1);
    expect(columns[columns.length - 1].header).toBe("SITUAÇÃO");
    expect(hasProgress([stop()])).toBe(false);
  });

  it("vale igual para o bloco de ligações", () => {
    const columns = buildStopColumns(
      [stop({ contactType: "REMOTE", status: "COMPLETED" })],
      REMOTE_CONTACT_COLUMNS
    );

    expect(columns[columns.length - 1].header).toBe("SITUAÇÃO");
  });
});

describe("buildRouteContext", () => {
  it("diz de quem é o dia e quanto ele custa em estrada", () => {
    const context = buildRouteContext({
      sellerName: "João",
      departureAddress: "Rua A, 100",
      stopsCount: 6,
      remoteCount: 2,
      routeDistanceKm: "42.30",
      routeDurationMin: 95,
    });

    expect(context).toEqual([
      "Vendedor: João",
      "6 parada(s)",
      "2 ligação(ões)",
      "42,3 km",
      "1h 35m de trajeto",
      "Saída: Rua A, 100",
    ]);
  });

  // Dia sem trajeto calculado (ou só de ligações) não imprime "0 km · 0 min".
  it("omite o que o dia não tem", () => {
    expect(
      buildRouteContext({
        sellerName: null,
        departureAddress: null,
        stopsCount: 0,
        remoteCount: 0,
        routeDistanceKm: "0",
        routeDurationMin: 0,
      })
    ).toEqual(["0 parada(s)"]);
  });
});
