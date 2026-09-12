import { describe, expect, it } from "vitest";

import {
  describeDevice,
  isAppleMobile,
  pushUnsupportedHint,
  resolvePushStatus,
  subscriptionToInput,
  urlBase64ToUint8Array,
} from "./utils";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 13; SM-A155M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const IPAD_COMO_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

describe("urlBase64ToUint8Array", () => {
  it("devolve os bytes da chave base64url", () => {
    // "hi" em base64url, sem padding — é assim que a chave VAPID chega.
    expect(Array.from(urlBase64ToUint8Array("aGk"))).toEqual([104, 105]);
  });

  it("traduz os caracteres trocados pela versão segura para URL", () => {
    // `-` e `_` no lugar de `+` e `/`: sem a troca, o atob recusa a string.
    expect(() => urlBase64ToUint8Array("A-B_AQ")).not.toThrow();
  });
});

describe("isAppleMobile", () => {
  it("reconhece iPhone", () => {
    expect(isAppleMobile(IPHONE)).toBe(true);
  });

  it("reconhece o iPad que se apresenta como Mac pelo toque", () => {
    expect(isAppleMobile(IPAD_COMO_MAC, 5)).toBe(true);
    expect(isAppleMobile(IPAD_COMO_MAC, 0)).toBe(false);
  });

  it("Android não é Apple", () => {
    expect(isAppleMobile(ANDROID)).toBe(false);
  });
});

describe("pushUnsupportedHint", () => {
  it("no iPhone fora do app, ensina a instalar", () => {
    // É o caso mais comum: o usuário abre o link no Safari e conclui que o
    // sistema não tem a função.
    expect(pushUnsupportedHint(IPHONE, false)).toContain("Tela de Início");
  });

  it("no iPhone já instalado, não repete o convite a instalar", () => {
    expect(pushUnsupportedHint(IPHONE, true)).not.toContain("Tela de Início");
  });

  it("nos demais, aponta um navegador que funciona", () => {
    expect(pushUnsupportedHint(ANDROID, false)).toContain("Chrome");
  });
});

describe("describeDevice", () => {
  it("nomeia navegador e aparelho", () => {
    expect(describeDevice(ANDROID)).toBe("Chrome no Android");
    expect(describeDevice(IPHONE)).toBe("Safari no iPhone");
  });

  it("Edge não é confundido com Chrome", () => {
    // O Edge carrega "Chrome/" no user agent; a ordem dos testes é o que decide.
    expect(
      describeDevice(
        "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36 Edg/124.0"
      )
    ).toBe("Edge no Windows");
  });
});

describe("resolvePushStatus", () => {
  const base = {
    isSupported: true,
    publicKey: "chave",
    permission: "granted" as NotificationPermission,
    isSubscribed: true,
  };

  it("navegador sem suporte vem antes de tudo", () => {
    expect(resolvePushStatus({ ...base, isSupported: false })).toBe(
      "unsupported"
    );
  });

  it("servidor sem chave VAPID desliga o recurso", () => {
    expect(resolvePushStatus({ ...base, publicKey: "" })).toBe("disabled");
  });

  it("permissão negada vence a inscrição que ficou no banco", () => {
    // Ativar e depois bloquear no navegador deixa a inscrição viva e inútil;
    // dizer "ativado" ali seria mentir para quem não vai receber nada.
    expect(resolvePushStatus({ ...base, permission: "denied" })).toBe(
      "blocked"
    );
  });

  it("inscrito e permitido = ligado", () => {
    expect(resolvePushStatus(base)).toBe("on");
  });

  it("sem inscrição, dá para ativar", () => {
    expect(
      resolvePushStatus({ ...base, permission: "default", isSubscribed: false })
    ).toBe("off");
  });
});

describe("subscriptionToInput", () => {
  const inscricao = (keys: Record<string, string> | undefined) =>
    ({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      toJSON: () => ({ keys }),
    }) as unknown as PushSubscription;

  it("extrai endpoint e as duas chaves", () => {
    expect(subscriptionToInput(inscricao({ p256dh: "p", auth: "a" }))).toEqual({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      p256dh: "p",
      auth: "a",
    });
  });

  it("sem chave não registra nada", () => {
    // Uma inscrição sem p256dh/auth é aceita pelo banco e depois entrega um
    // push que o aparelho não consegue decifrar.
    expect(subscriptionToInput(inscricao(undefined))).toBeNull();
    expect(subscriptionToInput(inscricao({ p256dh: "p" }))).toBeNull();
  });
});
