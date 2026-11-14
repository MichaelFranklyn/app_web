import { MoreOption, MoreOptionGroup } from "@/components/MoreOptions";
import {
  Ban,
  CalendarPlus,
  FileCheck2,
  FileClock,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { OrderDetail } from "../../../interface";
import { availableActions, pickPrimaryAction } from "./utils";

export type MenuModal =
  | "send"
  | "invoice"
  | "editInvoice"
  | "scheduleReturn"
  | "cancel"
  | "delete";

const when = (condition: boolean, option: MoreOption): MoreOption[] =>
  condition ? [option] : [];

/**
 * Monta o "Mais ações" do pedido e guarda qual modal dele está aberto (um por
 * vez). Envio e faturamento entram no menu só quando não são o primário — o
 * mesmo passo nunca aparece em dois lugares.
 */
export function useOrderMenu(order: OrderDetail) {
  const [menuModal, setMenuModal] = useState<MenuModal | null>(null);
  const can = availableActions(order);
  const primary = pickPrimaryAction(order);
  const isQuote = can.convert;
  const show = {
    ...can,
    send: can.send && primary !== "send",
    invoice: can.invoice && primary !== "invoice",
    // Sem cliente não há com quem combinar o retorno.
    scheduleReturn: can.scheduleReturn && !!order.client,
  };
  const open = (key: MenuModal) => () => setMenuModal(key);

  const menu: MoreOptionGroup[] = [
    {
      title: "Andamento",
      options: [
        ...when(show.send, {
          label: order.sentAt ? "Reenviar à fábrica" : "Enviar à fábrica",
          icon: Send,
          onClick: open("send"),
        }),
        ...when(show.invoice, {
          label: "Faturar pedido",
          icon: FileCheck2,
          onClick: open("invoice"),
        }),
        ...when(show.editInvoice, {
          label: "Editar faturamento",
          icon: FileClock,
          onClick: open("editInvoice"),
        }),
        ...when(show.scheduleReturn, {
          label: "Agendar retorno",
          icon: CalendarPlus,
          onClick: open("scheduleReturn"),
        }),
      ],
    },
    {
      // Separado embaixo: o que encerra o pedido fica longe do clique distraído.
      title: "Encerrar",
      options: [
        ...when(show.cancel, {
          label: isQuote ? "Cancelar orçamento" : "Cancelar pedido",
          icon: Ban,
          danger: true,
          onClick: open("cancel"),
        }),
        ...when(show.delete, {
          label: "Deletar pedido",
          icon: Trash2,
          danger: true,
          onClick: open("delete"),
        }),
      ],
    },
  ];

  const modalProps = (key: MenuModal) => ({
    open: menuModal === key,
    onOpenChange: (isOpen: boolean) => setMenuModal(isOpen ? key : null),
  });

  return {
    menu,
    hasMenu: menu.some((group) => group.options.length > 0),
    show,
    primary,
    isQuote,
    modalProps,
  };
}
