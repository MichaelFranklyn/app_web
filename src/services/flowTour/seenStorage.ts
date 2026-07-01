// Guard local (por navegador) de "fluxo já auto-exibido", por versão. Complementa o
// progresso salvo no back: garante que o auto-start dispare no máximo uma vez mesmo
// que a persistência no servidor falhe/atrase. O back continua sendo a fonte de
// verdade para status/retomada e a biblioteca do lançador.
const KEY = "flowtour:auto-seen";

type SeenMap = Record<string, number>; // flowKey -> maior versão já auto-exibida

const read = (): SeenMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as SeenMap;
  } catch {
    return {};
  }
};

export const wasAutoShown = (flowKey: string, version: number): boolean =>
  (read()[flowKey] ?? -1) >= version;

export const markAutoShown = (flowKey: string, version: number): void => {
  if (typeof window === "undefined") return;
  try {
    const map = read();
    map[flowKey] = Math.max(map[flowKey] ?? 0, version);
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // localStorage indisponível (modo privado/quota) — sem guard local, recai no back.
  }
};
