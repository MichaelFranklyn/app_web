/**
 * A conversa com o NAVEGADOR sobre o aviso no aparelho — separada do hook para
 * a lógica de tela não se misturar com API de plataforma (e para o hook poder
 * ser testado sem simular metade do `navigator`).
 *
 * Nada aqui fala com o backend.
 */

import { subscriptionToInput, urlBase64ToUint8Array } from "./utils";

/**
 * O service worker pode ainda não ter sido registrado quando a tela monta — ele
 * entra depois do `load`, para não competir com o JS da página. Quem PRECISA
 * dele (inscrever o aparelho) espera esse tempo; quem só está medindo, não —
 * ver `getRegistration`.
 */
const REGISTRATION_TIMEOUT_MS = 4000;

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** `standalone`: o app foi aberto pelo ícone da tela de início, não pelo navegador. */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;

  // O Safari do iPhone responde por `navigator.standalone`; os demais, pelo
  // display-mode. `matchMedia` é checado antes de ser chamado porque nem todo
  // ambiente o tem (o jsdom dos testes, por exemplo) — e isto roda no caminho
  // de uma tela, não pode derrubá-la.
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  if (iosStandalone === true) return true;

  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export async function getRegistration({
  /**
   * `false` responde com o que já existe, na hora. É o que a MEDIÇÃO usa: em
   * desenvolvimento o SW nem é registrado, e esperar por ele deixava o card do
   * perfil quatro segundos no esqueleto para concluir o óbvio. Quem vai
   * inscrever o aparelho continua esperando — aí o registro é indispensável.
   */
  wait = true,
}: { wait?: boolean } = {}): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  const existente = await navigator.serviceWorker.getRegistration();
  if (existente || !wait) return existente ?? null;

  const espera = new Promise<null>((resolve) =>
    window.setTimeout(() => resolve(null), REGISTRATION_TIMEOUT_MS)
  );
  return Promise.race([navigator.serviceWorker.ready, espera]);
}

export async function getSubscription(
  options: { wait?: boolean } = {}
): Promise<PushSubscription | null> {
  const registration = await getRegistration(options);
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Pede a permissão e inscreve o aparelho.
 *
 * Tem de ser chamada DENTRO do clique: navegadores recusam (e o Safari ignora
 * de vez) um pedido de permissão que não veio de um gesto do usuário.
 *
 * Devolve `null` quando o usuário nega — negar não é erro, é resposta.
 */
export async function subscribe(publicKey: string) {
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") return null;

  const registration = await getRegistration({ wait: true });
  if (!registration) return null;

  const subscription = await registration.pushManager.subscribe({
    // Obrigatório: garante ao navegador que todo push vira notificação visível.
    // Sem isso a inscrição é recusada no Chrome.
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  return subscriptionToInput(subscription);
}

/**
 * Descarta a inscrição no navegador e devolve o endpoint que existia, para o
 * backend apagar o registro certo. `null` = não havia nada inscrito aqui.
 */
export async function unsubscribe(): Promise<string | null> {
  const subscription = await getSubscription();
  if (!subscription) return null;

  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
}
