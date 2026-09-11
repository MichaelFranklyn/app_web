"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import { clientName, factoryName } from "@/utils/company";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FACTORY_CONTACTS_QUERY,
  MARK_ORDER_SENT_MUTATION,
  ORDER_ITEMS_QUERY,
} from "../../gql";
import { OrderDetail, OrderItem, OrderItemsResponse } from "../../interface";
import { exportOrderPdf } from "../../pdf";
import { byCreatedAtAsc } from "../../utils";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  pickFactoryContact,
} from "./utils";

interface FactoryContactsResponse {
  factoryContacts: {
    edges: {
      node: {
        id: string;
        name: string;
        role: string | null;
        phone: string | null;
        isPrimary: boolean;
      };
    }[];
  };
}

interface MarkSentResponse {
  markOrderSent: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
}

/**
 * Manda o pedido para a fábrica pelo WhatsApp e registra o envio.
 *
 * Três passos numa ação: baixa o PDF, abre a conversa com a mensagem pronta, e
 * carimba `sentAt`/`sentBy`/`sentChannel` no pedido. Antes disso o vendedor
 * fazia os dois primeiros na mão, por fora, e o terceiro não existia — "enviado"
 * era um rótulo que ninguém sabia quando tinha sido posto.
 *
 * **O anexo continua manual, e a tela diz isso.** O `wa.me` não carrega arquivo;
 * quem carrega é a API oficial, que cobra por conversa e exige aprovação de
 * modelo de mensagem. Fingir que o PDF vai junto seria pior que não ter o botão:
 * a fábrica receberia um resumo sem o pedido e ninguém perceberia.
 *
 * O carimbo é gravado ANTES de abrir o WhatsApp. Se fosse depois, um bloqueador
 * de pop-up ou o app não instalado deixariam o pedido mandado e não registrado —
 * e o registro é o que a operação usa para achar o que ficou para trás. O
 * inverso (registrado e não mandado) é visível: a conversa não abriu, a pessoa
 * repete, e o reenvio é permitido de propósito.
 */
export function SendToFactoryModal({ order, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const [fetchContacts, { data: contactsData, loading: loadingContacts }] =
    useLazyQuery<FactoryContactsResponse>(FACTORY_CONTACTS_QUERY);
  const [fetchItems] = useLazyQuery<OrderItemsResponse>(ORDER_ITEMS_QUERY);
  const [markSent] = useMutation<MarkSentResponse>(MARK_ORDER_SENT_MUTATION);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  // `factory` e `client` são opcionais no tipo porque um erro parcial da query
  // derruba o campo sem derrubar a resposta. Sem fábrica não há para quem
  // mandar, e sem cliente a mensagem sairia sem dizer de quem é o pedido.
  const factoryId = order.factory?.id;

  // Busca os contatos só quando o modal abre: o telefone da fábrica não
  // interessa a quem está apenas olhando o pedido.
  useEffect(() => {
    if (open && factoryId) fetchContacts({ variables: { factoryId } });
  }, [open, factoryId, fetchContacts]);

  const contatos = (contactsData?.factoryContacts?.edges ?? []).map(
    (e) => e.node
  );
  const destino = pickFactoryContact(contatos);
  const isResend = !!order.sentAt;

  const handleSend = async () => {
    if (!destino) return;

    await execute(
      async () => {
        // 1) Os itens, para o PDF e para a contagem da mensagem.
        const res = await fetchItems({ variables: { orderId: order.id } });
        if (res.error) throw res.error;
        const items: OrderItem[] = (
          res.data?.orderItems?.edges?.map((e) => e.node) ?? []
        )
          .slice()
          .sort(byCreatedAtAsc);

        // 2) O PDF baixa antes de a conversa abrir: quando o WhatsApp assume a
        // tela do celular, o arquivo já está lá para anexar.
        await exportOrderPdf(order, items, { companyName, companyLogoUrl });

        // 3) Carimba (ver o cabeçalho: antes de abrir a conversa, não depois).
        const sent = await markSent({
          variables: {
            id: order.id,
            input: { channel: "WHATSAPP", note: note.trim() || null },
          },
        });
        if (!sent.data?.markOrderSent?.status) {
          throw new Error(
            sent.data?.markOrderSent?.message ??
              "Não foi possível registrar o envio."
          );
        }

        // 4) A conversa, com a mensagem escrita.
        const mensagem = buildOrderMessage({
          orderCode: order.id.slice(0, 8).toUpperCase(),
          clientName: clientName(order.client) || "Cliente",
          clientCity: order.client?.addressCity,
          clientState: order.client?.addressState,
          factoryName: factoryName(order.factory) || "Fábrica",
          itemCount: items.length,
          totalWithIpi: Number(order.totalAmount) + Number(order.ipiAmount),
          paymentTermLabel: order.paymentTerm?.name ?? null,
          isResend,
        });
        window.open(
          buildWhatsAppUrl(destino.phone, mensagem),
          "_blank",
          "noopener,noreferrer"
        );

        return sent.data.markOrderSent;
      },
      {
        successMessage: (r) => r?.message ?? "Envio registrado.",
        onSuccess: () => {
          setOpen(false);
          setNote("");
          onSuccess();
          // O carimbo de envio é o que apaga a tarja "não enviado" na lista, e
          // a mutation devolve só o `id`.
          void invalidateClient(ORDER_CACHE_FIELDS);
        },
      }
    );
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) setNote("");
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance={isResend ? "outline" : "solid"}
          color={isResend ? "neutral" : "amber"}
          size="sm"
        >
          <Button.Icon icon={Send} />
          <Button.Title>
            {isResend ? "Reenviar à fábrica" : "Enviar à fábrica"}
          </Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title={isResend ? "Reenviar para a fábrica" : "Enviar para a fábrica"}
          description="Baixa o PDF do pedido, abre a conversa no WhatsApp com a mensagem já escrita e registra o envio."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            {loadingContacts && (
              <Title variant="body-sm" color="muted">
                Buscando o contato da fábrica…
              </Title>
            )}

            {!loadingContacts && !destino && (
              // Sem telefone não há o que abrir. A saída é concreta: onde
              // cadastrar, em vez de "contato inválido".
              <div className="rounded-(--radius) border border-(--red-bd) bg-(--red-bg) p-12">
                <Title variant="body-sm" color="red" weight="semibold">
                  Esta fábrica não tem telefone cadastrado
                </Title>
                <Title variant="body-sm" color="secondary" className="mt-4">
                  Cadastre um contato com telefone (com DDD) na aba Contatos da
                  fábrica e volte aqui. Você também pode exportar o PDF em
                  “Exportar” e mandar por fora — mas aí o envio não fica
                  registrado.
                </Title>
              </div>
            )}

            {destino && (
              <>
                <div className="rounded-(--radius) bg-(--bg3) p-12">
                  <Title variant="eyebrow" color="muted">
                    Vai para
                  </Title>
                  <Title variant="body-md" weight="semibold" className="mt-2">
                    {destino.contact.name}
                    {destino.contact.isPrimary && " · principal"}
                  </Title>
                  <Title variant="body-sm" color="secondary">
                    {destino.contact.phone}
                  </Title>
                </div>

                {/* O aviso do anexo é a parte que não pode ser discreta: é o
                    único passo que continua na mão da pessoa. */}
                <div className="rounded-(--radius) border border-(--amber-bd) bg-(--amber-bg) p-12">
                  <Title variant="body-sm" color="amber" weight="semibold">
                    Anexe o PDF na conversa
                  </Title>
                  <Title variant="body-sm" color="secondary" className="mt-4">
                    O arquivo baixa no seu aparelho e a mensagem abre pronta,
                    mas o WhatsApp não deixa anexar automaticamente. Toque no
                    clipe e escolha o PDF do pedido.
                  </Title>
                </div>

                <Input.Text
                  label="Observação (opcional)"
                  hint="Fica registrada no pedido, junto com a data e o seu nome."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex.: mandei para o Carlos, o Rogério está de férias"
                  maxLength={200}
                />
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!destino || isLoading}
            onClick={handleSend}
          >
            <Button.Title>
              {isResend ? "Baixar e reenviar" : "Baixar PDF e abrir WhatsApp"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
