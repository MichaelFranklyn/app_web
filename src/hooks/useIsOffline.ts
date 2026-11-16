import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/**
 * O aparelho está SEM rede, com certeza.
 *
 * `navigator.onLine` é otimista: `true` só diz que há uma interface de rede
 * (wi-fi de loja sem saída também é `true`). Por isso este hook serve para o
 * lado seguro — travar uma ação que, offline, falharia no meio. Quando ele diz
 * `false`, a ação ainda pode falhar, e o tratamento de erro dela continua
 * valendo.
 *
 * No servidor (e no primeiro render) é `false`: assumir online evita piscar o
 * aviso em quem está conectado, que é quase todo mundo.
 */
export function useIsOffline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false
  );
}
