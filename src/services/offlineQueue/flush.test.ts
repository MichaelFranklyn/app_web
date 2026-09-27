import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ApolloClient } from "@apollo/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { flushQueue } from "./flush";
import { VisitStatusEntry } from "./interface";
import { enqueue, getQueueState, resetQueueForTests } from "./store";

const entry = (
  id: string,
  createdAt: string,
  userId = "u1"
): VisitStatusEntry => ({
  kind: "visitStatus",
  key: `visit:${id}`,
  userId,
  createdAt,
  label: `Loja ${id}`,
  variables: { id, status: "COMPLETED", actualVisitAt: createdAt },
});

const ok = { data: { updateVisitScheduleItem: { status: true, message: "" } } };

function fakeClient(mutate: ReturnType<typeof vi.fn>) {
  return { mutate } as unknown as ApolloClient;
}

describe("flushQueue", () => {
  beforeEach(() => resetQueueForTests());

  it("envia na ordem em que foi feito e esvazia a fila", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    enqueue(entry("b", "2026-09-28T11:00:00Z"));
    const mutate = vi.fn().mockResolvedValue(ok);

    const result = await flushQueue(fakeClient(mutate), "u1");

    expect(result.sent.map((e) => e.key)).toEqual(["visit:a", "visit:b"]);
    expect(mutate.mock.calls.map((c) => c[0].variables.id)).toEqual(["a", "b"]);
    // A hora da visita viaja junto — é a do toque, não a do envio.
    expect(mutate.mock.calls[0][0].variables.input).toEqual({
      status: "COMPLETED",
      actualVisitAt: "2026-09-28T10:00:00Z",
    });
    expect(getQueueState().entries).toEqual([]);
  });

  it("para no primeiro sinal de rede ruim e guarda o resto sem pular a vez", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    enqueue(entry("b", "2026-09-28T11:00:00Z"));
    const mutate = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(ok);

    const result = await flushQueue(fakeClient(mutate), "u1");

    expect(result.sent).toEqual([]);
    expect(mutate).toHaveBeenCalledOnce();
    expect(getQueueState().entries.map((e) => e.key)).toEqual([
      "visit:a",
      "visit:b",
    ]);
  });

  it("sessão vencida também espera — o registro continua válido", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    const mutate = vi.fn().mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          { message: "Autenticação necessária", extensions: { code: 401 } },
        ],
      })
    );

    await flushQueue(fakeClient(mutate), "u1");

    expect(getQueueState().entries).toHaveLength(1);
    expect(getQueueState().failures).toEqual([]);
  });

  it("recusa do servidor sai da fila com o motivo, e as outras seguem", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    enqueue(entry("b", "2026-09-28T11:00:00Z"));
    const mutate = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          updateVisitScheduleItem: {
            status: false,
            message: "Visita não encontrada",
          },
        },
      })
      .mockResolvedValue(ok);

    const result = await flushQueue(fakeClient(mutate), "u1");

    expect(result.rejected).toBe(1);
    expect(result.sent.map((e) => e.key)).toEqual(["visit:b"]);
    expect(getQueueState().entries).toEqual([]);
    expect(getQueueState().failures).toEqual([
      {
        key: "visit:a",
        userId: "u1",
        label: "Loja a",
        message: "Visita não encontrada",
      },
    ]);
  });

  it("nunca envia o que outra pessoa guardou no mesmo aparelho", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z", "outra"));
    const mutate = vi.fn().mockResolvedValue(ok);

    await flushQueue(fakeClient(mutate), "u1");

    expect(mutate).not.toHaveBeenCalled();
    expect(getQueueState().entries).toHaveLength(1);
  });

  it("resposta nova dada durante o envio fica para a próxima vez", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    const mutate = vi.fn().mockImplementation(async () => {
      // Enquanto o "concluída" viaja, a pessoa reabre a visita.
      enqueue({
        ...entry("a", "2026-09-28T10:05:00Z"),
        variables: { id: "a", status: "PENDING" },
      });
      return ok;
    });

    await flushQueue(fakeClient(mutate), "u1");

    expect(getQueueState().entries).toHaveLength(1);
    expect(getQueueState().entries[0].createdAt).toBe("2026-09-28T10:05:00Z");
  });

  it("duas chamadas juntas fazem uma descarga só", async () => {
    enqueue(entry("a", "2026-09-28T10:00:00Z"));
    const mutate = vi.fn().mockResolvedValue(ok);
    const client = fakeClient(mutate);

    await Promise.all([flushQueue(client, "u1"), flushQueue(client, "u1")]);

    expect(mutate).toHaveBeenCalledOnce();
  });
});
