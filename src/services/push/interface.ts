export interface PushPublicKeyResponse {
  pushPublicKey: {
    status: boolean;
    /** Vazia = push desligado neste ambiente (sem chaves VAPID no servidor). */
    data: string;
  };
}

export interface RegisterPushSubscriptionResponse {
  registerPushSubscription: {
    status: boolean;
    message: string;
  };
}

export interface RemovePushSubscriptionResponse {
  removePushSubscription: {
    status: boolean;
    message: string;
  };
}

/**
 * Em que pé está o aviso NESTE aparelho. A permissão é do navegador e some do
 * nosso alcance: o usuário pode tê-la negado uma vez e nunca mais ser
 * perguntado — é por isso que "bloqueado" é um estado próprio, com texto que
 * ensina a desfazer, e não um erro.
 */
export type PushStatus =
  /** Ainda medindo o que este navegador suporta e o que já foi decidido. */
  | "loading"
  /** Navegador sem Push API, ou iPhone com o site aberto fora da tela de início. */
  | "unsupported"
  /** Servidor sem chaves VAPID: não adianta oferecer. */
  | "disabled"
  /** Dá para ativar: ninguém autorizou nem bloqueou ainda. */
  | "off"
  /** Este aparelho está inscrito e recebendo. */
  | "on"
  /** O usuário negou a permissão no navegador; só ele desfaz, nas configurações do site. */
  | "blocked";
