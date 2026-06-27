import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

// /settings/routine só mostra o form se houver uma config; o botão "Salvar
// configurações" só habilita quando há alteração (isDirty).
const config = {
  id: "cfg-1",
  sellerId: "s-1",
  maxVisitsPerDay: 5,
  workDays: [1, 2, 3, 4, 5],
  workStartTime: "08:00:00",
  workEndTime: "18:00:00",
  avgVisitDurationMin: 30,
  rescheduleSameWeek: true,
  maxRescheduleAttempts: 3,
  penaltyScorePerMiss: "10.5",
  priorityWeights: {
    urgency: 30,
    priority: 20,
    frequency: 25,
    potential: 15,
    recency: 10,
  },
  seller: { id: "s-1", user: { name: "João Vendedor" } },
};

test("settings/routine: altera um parâmetro e salva a configuração", async ({
  page,
}) => {
  await mockGraphql(page, {
    VisitScheduleConfigs: () => ({
      schedule_configs: { edges: [{ node: config }], totalCount: 1 },
    }),
    UpdateScheduleConfig: (v) => ({
      updateScheduleConfig: {
        status: true,
        message: "ok",
        data: { ...config, ...(v.input as object) },
      },
    }),
  });

  await page.goto("/settings/routine");

  // Primeiro spinbutton = "Máximo de visitas por dia"; mudar habilita o salvar.
  await page.getByRole("spinbutton").first().fill("6");
  await page.getByRole("button", { name: "Salvar configurações" }).click();

  await expect(page.getByText("Configuração salva com sucesso")).toBeVisible();
});
