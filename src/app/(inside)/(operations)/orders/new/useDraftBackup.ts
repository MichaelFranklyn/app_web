import { useUserData } from "@/hooks/useUserData";
import { useEffect, useState } from "react";

import { OrderDraftItems } from "../../_shared/orderDraftItems";
import {
  clearDraftBackup,
  DraftBackup,
  draftBackupKey,
  readDraftBackup,
  writeDraftBackup,
} from "./draftBackup";

/**
 * Espelha os itens do pedido no aparelho e, ao voltar ao mesmo cliente e
 * fábrica, oferece recuperá-los.
 *
 * Enquanto a cópia não foi respondida ("Recuperar" ou "Descartar"), nada é
 * gravado por cima: a lista vazia do começo da página apagaria a cópia antes
 * de a pessoa ver a oferta.
 */
export function useDraftBackup(
  draft: OrderDraftItems,
  factoryId: string,
  clientId: string
) {
  const { userData } = useUserData();
  const userId = userData?.userId ?? null;
  const key =
    userId && factoryId && clientId
      ? draftBackupKey(userId, factoryId, clientId)
      : null;

  const [offer, setOffer] = useState<DraftBackup | null>(null);
  // A chave cuja cópia já foi resolvida — só ela é espelhada.
  const [settledKey, setSettledKey] = useState<string | null>(null);

  // A pergunta só vale com a lista vazia: quem já começou a digitar está
  // fazendo outro pedido, e a cópia antiga continua guardada.
  const isEmpty = draft.items.length === 0;
  useEffect(() => {
    if (!key) {
      setOffer(null);
      return;
    }
    const backup = isEmpty ? readDraftBackup(key) : null;
    setOffer(backup);
    setSettledKey(backup ? null : key);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao mudar de pedido
  }, [key]);

  useEffect(() => {
    if (!key || settledKey !== key) return;
    if (draft.items.length > 0) writeDraftBackup(key, draft.items);
    else clearDraftBackup(key);
  }, [key, settledKey, draft.items]);

  const settle = () => {
    setOffer(null);
    setSettledKey(key);
  };

  return {
    /** Cópia esperando resposta, se houver. */
    offer,
    recover: () => {
      if (offer) draft.restore(offer.items);
      settle();
    },
    discard: () => {
      if (key) clearDraftBackup(key);
      settle();
    },
    /** O pedido foi criado: a cópia perdeu a razão de existir. */
    clear: () => {
      if (key) clearDraftBackup(key);
    },
  };
}

export type DraftBackupState = ReturnType<typeof useDraftBackup>;
