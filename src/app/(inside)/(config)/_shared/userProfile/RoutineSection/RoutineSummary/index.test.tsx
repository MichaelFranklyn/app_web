import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileScheduleConfig } from "../../interface";
import { RoutineSummary } from "./index";

const CONFIG: ProfileScheduleConfig = {
  id: "cfg-1",
  maxVisitsPerDay: 8,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00:00",
  workEndTime: "18:00:00",
  isRemoteContactEnabled: true,
  maxRemoteContactsPerDay: 5,
  remoteContactIntervalPct: 50,
  avgVisitDurationMin: 30,
  isRescheduleSameWeek: true,
  maxRescheduleAttempts: 3,
};

/**
 * Os rótulos do RoutineEditor, na ordem. Quem acrescentar um controle lá tem de
 * acrescentar a linha aqui — foi a divergência entre as duas telas que fez o
 * resumo mostrar 7 linhas para 10 campos editáveis.
 */
const LINHAS_DO_EDITOR = [
  "Dias de trabalho",
  "Começa às",
  "Termina às",
  "Visitas por dia",
  "Ligar entre visitas",
  "Ligações por dia",
  "Ligar a partir de",
  "Tempo médio de visita",
  "Ausência é remarcada",
  "Tentativas de remarcação",
];

describe("RoutineSummary", () => {
  it("mostra uma linha para cada controle do editor", () => {
    render(<RoutineSummary config={CONFIG} />);
    LINHAS_DO_EDITOR.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("mostra o valor de cada parâmetro", () => {
    render(<RoutineSummary config={CONFIG} />);
    expect(screen.getByText("Seg, Ter, Qua, Qui, Sex")).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("até 8")).toBeInTheDocument();
    expect(screen.getByText("até 5")).toBeInTheDocument();
    expect(screen.getByText("50% do intervalo")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("na mesma semana")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // O editor esconde os dois parâmetros quando o contato remoto está desligado;
  // o resumo faz o mesmo, senão mostraria número que não é usado.
  it("esconde os parâmetros de ligação quando o contato está desligado", () => {
    render(
      <RoutineSummary config={{ ...CONFIG, isRemoteContactEnabled: false }} />
    );
    expect(screen.getByText("Ligar entre visitas")).toBeInTheDocument();
    expect(screen.getByText("não")).toBeInTheDocument();
    expect(screen.queryByText("Ligações por dia")).toBeNull();
    expect(screen.queryByText("Ligar a partir de")).toBeNull();
  });

  it("diz quando a ausência é remarcada para a semana seguinte", () => {
    render(
      <RoutineSummary config={{ ...CONFIG, isRescheduleSameWeek: false }} />
    );
    expect(screen.getByText("na semana seguinte")).toBeInTheDocument();
  });
});
