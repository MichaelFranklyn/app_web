import { describe, expect, it, vi } from "vitest";

import {
  CONNECTION_LOST_MESSAGE,
  humanizeImportError,
  STALE_IMPORT_MESSAGE,
  waitForImportJob,
  WAIT_TIMEOUT_MESSAGE,
} from "./importJob";
import { PriceListImportJob } from "./interface";

const RESULT = {
  listName: "Tabela",
  totalRows: 2,
  tiers: 1,
  productsCreated: 2,
  productsReused: 0,
  pricesSet: 2,
  failed: 0,
  attention: 0,
  errors: [],
};

const job = (over: Partial<PriceListImportJob>): PriceListImportJob => ({
  id: "imp-1",
  status: "RUNNING",
  isStale: false,
  message: null,
  error: null,
  result: null,
  ...over,
});

const noSleep = { sleep: () => Promise.resolve() };

describe("waitForImportJob", () => {
  it("pergunta até terminar e devolve o resultado com a mensagem", async () => {
    const fetchJob = vi
      .fn()
      .mockResolvedValueOnce(job({ status: "PENDING" }))
      .mockResolvedValueOnce(job({ status: "RUNNING" }))
      .mockResolvedValueOnce(
        job({ status: "DONE", result: RESULT, message: "2 de 2" })
      );
    await expect(waitForImportJob(fetchJob, noSleep)).resolves.toEqual({
      data: RESULT,
      message: "2 de 2",
    });
    expect(fetchJob).toHaveBeenCalledTimes(3);
  });

  it("uma pergunta que cai na rede não derruba a espera", async () => {
    const fetchJob = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(job({ status: "DONE", result: RESULT }));
    await expect(waitForImportJob(fetchJob, noSleep)).resolves.toMatchObject({
      data: RESULT,
    });
  });

  it("rede que não volta: avisa para conferir a lista", async () => {
    const fetchJob = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(
      waitForImportJob(fetchJob, { ...noSleep, maxFailures: 3 })
    ).rejects.toThrow(CONNECTION_LOST_MESSAGE);
    expect(fetchJob).toHaveBeenCalledTimes(3);
  });

  it("recusa do servidor não é repetida", async () => {
    const fetchJob = vi
      .fn()
      .mockRejectedValue(new Error("Importação não encontrada"));
    await expect(waitForImportJob(fetchJob, noSleep)).rejects.toThrow(
      "Importação não encontrada"
    );
    expect(fetchJob).toHaveBeenCalledTimes(1);
  });

  it("FAILED traz o erro do backend", async () => {
    const fetchJob = vi
      .fn()
      .mockResolvedValue(
        job({ status: "FAILED", error: "Linha 3 sem código." })
      );
    await expect(waitForImportJob(fetchJob, noSleep)).rejects.toThrow(
      "Linha 3 sem código."
    );
  });

  it("parada no meio (isStale): avisa que parte pode ter sido gravada", async () => {
    const fetchJob = vi.fn().mockResolvedValue(job({ isStale: true }));
    await expect(waitForImportJob(fetchJob, noSleep)).rejects.toThrow(
      STALE_IMPORT_MESSAGE
    );
  });

  it("passou do teto: para de esperar", async () => {
    let clock = 0;
    const fetchJob = vi.fn().mockResolvedValue(job({}));
    await expect(
      waitForImportJob(fetchJob, {
        sleep: async (ms) => {
          clock += ms;
        },
        now: () => clock,
        intervalMs: 1000,
        maxWaitMs: 5000,
      })
    ).rejects.toThrow(WAIT_TIMEOUT_MESSAGE);
  });
});

describe("humanizeImportError", () => {
  it("troca o 'Failed to fetch' cru pelo aviso de conferir", () => {
    expect(humanizeImportError(new TypeError("Failed to fetch")).message).toBe(
      CONNECTION_LOST_MESSAGE
    );
    expect(
      humanizeImportError(new Error("NetworkError when attempting")).message
    ).toBe(CONNECTION_LOST_MESSAGE);
  });

  it("mantém a mensagem de recusa do servidor", () => {
    expect(
      humanizeImportError(new Error("Já tem uma importação")).message
    ).toBe("Já tem uma importação");
  });
});
