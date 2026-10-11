import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OfflineQueueState, VisitStatusEntry } from "./interface";

/**
 * Duas ABAS de verdade são dois módulos carregados, cada um com a sua cópia em
 * memória, sobre o mesmo `localStorage`. É isso que `openTab` monta.
 */
type Store = typeof import("./store");

const STORAGE_KEY = "girus:offline-queue:v1";

async function openTab(): Promise<Store> {
  vi.resetModules();
  const store = await import("./store");
  // A aba já abriu e leu a fila: é a cópia que ficaria velha.
  store.getQueueState();
  return store;
}

const entry = (id: string, userId = "u1"): VisitStatusEntry => ({
  kind: "visitStatus",
  key: `visit:${id}`,
  userId,
  createdAt: new Date().toISOString(),
  label: `Cliente ${id}`,
  variables: { id, status: "COMPLETED" },
});

const stored = (): OfflineQueueState =>
  JSON.parse(
    window.localStorage.getItem(STORAGE_KEY) ?? '{"entries":[],"failures":[]}'
  );

const keys = () => stored().entries.map((e) => e.key);

/** Web Locks de mentira, mas com a regra de verdade: um por vez, em ordem. */
function fakeLocks() {
  let tail: Promise<unknown> = Promise.resolve();
  const request = vi.fn((_name: string, callback: () => unknown) => {
    const run = tail.then(callback);
    tail = run.catch(() => undefined);
    return run;
  });
  vi.stubGlobal("navigator", { ...navigator, locks: { request } });
  return request;
}

describe("fila offline em duas abas", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("cada aba guarda uma visita: as duas ficam gravadas", async () => {
    const tabA = await openTab();
    const tabB = await openTab();

    await tabA.enqueue(entry("a"));
    await tabB.enqueue(entry("b"));

    expect(keys()).toEqual(["visit:a", "visit:b"]);
  });

  it("registros simultâneos passam um por vez pela trava compartilhada", async () => {
    const request = fakeLocks();
    const tabA = await openTab();
    const tabB = await openTab();

    await Promise.all([tabA.enqueue(entry("a")), tabB.enqueue(entry("b"))]);

    expect(keys()).toEqual(["visit:a", "visit:b"]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenCalledWith(tabA.WRITE_LOCK, expect.any(Function));
  });

  it("a mesma visita respondida nas duas abas não duplica: vale a última", async () => {
    const tabA = await openTab();
    const tabB = await openTab();

    await tabA.enqueue(entry("a"));
    await tabB.enqueue({
      ...entry("a"),
      variables: { id: "a", status: "CLIENT_ABSENT" },
    });

    expect(stored().entries).toHaveLength(1);
    expect(stored().entries[0].variables).toMatchObject({
      status: "CLIENT_ABSENT",
    });
  });

  it("dar baixa numa aba não apaga o que a outra acabou de guardar", async () => {
    const tabA = await openTab();
    const sent = entry("a");
    await tabA.enqueue(sent);
    const tabB = await openTab();

    await tabB.enqueue(entry("b"));
    await tabA.settle(sent);

    expect(keys()).toEqual(["visit:b"]);
  });

  it('"Entendi" numa aba não apaga o que a outra acabou de guardar', async () => {
    const tabA = await openTab();
    const tabB = await openTab();

    await tabB.enqueue(entry("b"));
    await tabA.dismissFailures("u1");

    expect(keys()).toEqual(["visit:b"]);
  });

  it("a aba que vai guardar enxerga o que a outra já tem esperando", async () => {
    const tabA = await openTab();
    const tabB = await openTab();

    await tabA.enqueue(entry("a"));

    expect(tabB.hasEntriesOf("u1")).toBe(true);
  });

  it("sem armazenamento, a fila segue na memória da aba e não se perde", async () => {
    const tab = await openTab();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("cheio", "QuotaExceededError");
    });

    await tab.enqueue(entry("a"));
    await tab.enqueue(entry("b"));

    expect(tab.getQueueState().entries.map((e) => e.key)).toEqual([
      "visit:a",
      "visit:b",
    ]);
  });
});
