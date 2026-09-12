import { PushStatus } from "./interface";

/**
 * A chave pública VAPID chega como texto base64url e o `pushManager.subscribe`
 * exige bytes. Sem esta conversão o navegador recusa a inscrição com um
 * "InvalidCharacterError" que não diz nada sobre a chave.
 */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  // base64url → base64: o padding perdido volta, e os dois caracteres trocados
  // pela versão "segura para URL" voltam ao alfabeto normal.
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  // `new ArrayBuffer(...)` explícito, e não `new Uint8Array(tamanho)`: o tipo
  // padrão admite `SharedArrayBuffer`, que `applicationServerKey` não aceita.
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * O aparelho está num iPhone/iPad?
 *
 * O iPad moderno se apresenta como Mac; o `maxTouchPoints` é o que o distingue.
 * Importa porque o iOS é o único que exige o app na tela de início para receber
 * aviso — ver `pushUnsupportedHint`.
 */
export function isAppleMobile(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

/**
 * Texto que explica por que este aparelho não pode receber aviso.
 *
 * No iPhone a resposta é acionável — falta instalar o app —, e é o caso que
 * mais aparece aqui: o usuário abre o link no Safari, o botão não existe, e sem
 * esta frase ele conclui que o sistema não tem a função.
 */
export function pushUnsupportedHint(
  userAgent: string,
  isInstalled: boolean,
  maxTouchPoints = 0
): string {
  if (isAppleMobile(userAgent, maxTouchPoints) && !isInstalled) {
    return (
      "No iPhone e no iPad, o aviso só funciona com o app instalado. " +
      "Toque em Compartilhar e depois em “Adicionar à Tela de Início”; " +
      "abra o Girus por esse ícone e o botão aparece aqui."
    );
  }
  return "Este navegador não mostra avisos com o app fechado. Tente pelo Chrome no celular ou no computador.";
}

/** "Chrome no Android", "Safari no iPhone" — para reconhecer o aparelho na lista. */
export function describeDevice(userAgent: string, maxTouchPoints = 0): string {
  const navegador = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Navegador";

  const aparelho = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent) || isAppleMobile(userAgent, maxTouchPoints)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Mac OS X/.test(userAgent)
            ? "Mac"
            : "computador";

  return `${navegador} no ${aparelho}`;
}

interface StatusInput {
  /** O navegador tem Push API e service worker. */
  isSupported: boolean;
  /** Chave pública VAPID do servidor (vazia = push desligado no ambiente). */
  publicKey: string;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

/**
 * Em que pé está o aviso NESTE aparelho, em um lugar só.
 *
 * A ordem das perguntas é a regra: "bloqueado" vence "inscrito" porque uma
 * permissão negada depois de ativar deixa a inscrição no banco viva e inútil —
 * mostrar "ativado" ali seria mentir para quem não vai receber nada.
 */
export function resolvePushStatus({
  isSupported,
  publicKey,
  permission,
  isSubscribed,
}: StatusInput): PushStatus {
  if (!isSupported) return "unsupported";
  if (!publicKey) return "disabled";
  if (permission === "denied") return "blocked";
  if (isSubscribed) return "on";
  return "off";
}

/**
 * Os campos que o backend guarda, a partir do que o navegador devolve.
 *
 * `null` quando falta chave: uma inscrição sem `p256dh`/`auth` é aceita pelo
 * banco e depois entrega um push que o aparelho não consegue decifrar.
 */
export function subscriptionToInput(
  subscription: Pick<PushSubscription, "endpoint" | "toJSON">
): { endpoint: string; p256dh: string; auth: string } | null {
  const chaves = subscription.toJSON().keys;
  if (!chaves?.p256dh || !chaves?.auth) return null;
  return {
    endpoint: subscription.endpoint,
    p256dh: chaves.p256dh,
    auth: chaves.auth,
  };
}
