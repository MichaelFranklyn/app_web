"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";

import {
  getSubscription,
  isInstalledApp,
  isPushSupported,
  subscribe,
  unsubscribe,
} from "./browser";
import {
  PUSH_PUBLIC_KEY_QUERY,
  REGISTER_PUSH_SUBSCRIPTION_MUTATION,
  REMOVE_PUSH_SUBSCRIPTION_MUTATION,
} from "./gql";
import {
  PushPublicKeyResponse,
  PushStatus,
  RegisterPushSubscriptionResponse,
  RemovePushSubscriptionResponse,
} from "./interface";
import {
  describeDevice,
  pushUnsupportedHint,
  resolvePushStatus,
} from "./utils";

interface Options {
  /**
   * Adia a medição (e a query da chave) até a tela precisar dela.
   *
   * Existe por causa do sino: ele vive na topbar de TODAS as páginas, e sem
   * isto cada troca de rota pagaria uma query e uma espera pelo service worker
   * para responder a uma pergunta que só interessa com o dropdown aberto.
   */
  skip?: boolean;
}

/**
 * Motor do aviso no aparelho: mede em que pé está ESTE navegador e liga/desliga.
 *
 * O estado mora no navegador, não no banco — permissão e inscrição são do
 * aparelho. O backend guarda a inscrição para poder enviar; quem manda é sempre
 * o que o navegador responde aqui.
 */
export function usePushNotifications({ skip = false }: Options = {}) {
  const [status, setStatus] = useState<PushStatus>("loading");
  const { execute, isLoading } = useAsyncAction();

  const { data, error } = useQuery<PushPublicKeyResponse>(
    PUSH_PUBLIC_KEY_QUERY,
    { skip }
  );
  const publicKey = data?.pushPublicKey?.data ?? "";

  // Uma resposta é uma resposta — inclusive a que não veio. Enquanto a medição
  // dependia só de `data`, a query falhando (API fora do ar, ou um backend mais
  // velho que ainda não conhece `pushPublicKey`) deixava a tela no esqueleto
  // PARA SEMPRE. Erro aqui significa a mesma coisa que chave vazia: não há push
  // neste ambiente, então o card some em vez de ficar carregando.
  const answered = Boolean(data) || Boolean(error);

  const [registerSubscription] = useMutation<RegisterPushSubscriptionResponse>(
    REGISTER_PUSH_SUBSCRIPTION_MUTATION
  );
  const [removeSubscription] = useMutation<RemovePushSubscriptionResponse>(
    REMOVE_PUSH_SUBSCRIPTION_MUTATION
  );

  // Enquanto a chave não chega, `publicKey` é "" — e "" é o mesmo que push
  // desligado. Por isso a medição espera a query terminar antes de concluir.
  useEffect(() => {
    if (!answered) return;
    let ativo = true;

    (async () => {
      const isSupported = isPushSupported();
      const subscription = isSupported ? await getSubscription() : null;
      if (!ativo) return;

      setStatus(
        resolvePushStatus({
          isSupported,
          publicKey,
          permission: isSupported ? Notification.permission : "default",
          isSubscribed: Boolean(subscription),
        })
      );
    })();

    return () => {
      ativo = false;
    };
  }, [answered, publicKey]);

  const enable = useCallback(async () => {
    await execute(
      async () => {
        const inscricao = await subscribe(publicKey);
        if (!inscricao) {
          // Negar não é falha de sistema: o texto tem de dizer o que fazer, e
          // não "erro ao ativar". Quem nega uma vez não é perguntado de novo.
          throw new Error(
            "O navegador não autorizou os avisos. Para liberar, toque no cadeado ao lado do endereço e permita as notificações."
          );
        }

        const res = await registerSubscription({
          variables: {
            input: {
              ...inscricao,
              deviceLabel: describeDevice(
                navigator.userAgent,
                navigator.maxTouchPoints
              ),
            },
          },
        });
        const payload = res.data?.registerPushSubscription;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Não foi possível ativar os avisos"
          );
        }
        return payload;
      },
      {
        successMessage: "Pronto: os avisos vão chegar neste aparelho.",
        onSuccess: () => setStatus("on"),
        onError: () => {
          // A permissão pode ter sido negada agora: relê do navegador em vez de
          // supor que continua como estava.
          if (isPushSupported() && Notification.permission === "denied") {
            setStatus("blocked");
          }
        },
      }
    );
  }, [execute, publicKey, registerSubscription]);

  const disable = useCallback(async () => {
    await execute(
      async () => {
        const endpoint = await unsubscribe();
        // Sem inscrição no navegador não há o que apagar no banco — acontece
        // quando o usuário limpou os dados do site e volta aqui para desligar.
        if (endpoint) {
          await removeSubscription({ variables: { endpoint } });
        }
        return true;
      },
      {
        successMessage: "Os avisos foram desligados neste aparelho.",
        onSuccess: () => setStatus("off"),
      }
    );
  }, [execute, removeSubscription]);

  const unsupportedHint =
    typeof navigator === "undefined"
      ? ""
      : pushUnsupportedHint(
          navigator.userAgent,
          isInstalledApp(),
          navigator.maxTouchPoints
        );

  return { status, isLoading, enable, disable, unsupportedHint };
}
