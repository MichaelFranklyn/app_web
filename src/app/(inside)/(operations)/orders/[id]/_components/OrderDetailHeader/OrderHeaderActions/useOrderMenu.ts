import { MoreOption, MoreOptionGroup } from "@/components/MoreOptions";
import {
  Ban,
  CalendarPlus,
  FileCheck2,
  FileClock,
  FileSpreadsheet,
  FileText,
  Images,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useUserData } from "@/hooks/useUserData";
import { useOrderExport } from "../useOrderExport";
import { isAdminRole } from "@/utils/auth/roles";
import { OrderDetail } from "../../../interface";
import { availableActions, pickPrimaryAction } from "./utils";

export type MenuModal =
  | "edit"
  | "send"
  | "invoice"
  | "editInvoice"
  | "scheduleReturn"
  | "cancel"
  | "reopen"
  | "delete";

const when = (condition: boolean, option: MoreOption): MoreOption[] =>
  condition ? [option] : [];

/**
 * Monta o "Mais ações" do pedido e guarda qual modal dele está aberto (um por
 * vez). Envio e faturamento entram no menu só quando não são o primário — o
 * mesmo passo nunca aparece em dois lugares.
 *
 * No celular, Editar e Exportar também entram no menu: empilhados, eram quatro
 * faixas de botão empurrando o pedido para baixo, e lá fica à vista só o
 * próximo passo + "Mais ações" (crítica de /orders, 23/11/2026).
 */
export function useOrderMenu(order: OrderDetail) {
  const [menuModal, setMenuModal] = useState<MenuModal | null>(null);
  const { userData } = useUserData();
  const isPhone = useIsPhone();
  const exports = useOrderExport(order);
  const can = availableActions(order);
  const primary = pickPrimaryAction(order);
  const isQuote = can.convert;
  const show = {
    ...can,
    send: can.send && primary !== "send",
    invoice: can.invoice && primary !== "invoice",
    // Sem cliente não há com quem combinar o retorno.
    scheduleReturn: can.scheduleReturn && !!order.client,
    // Cancelar é do dia a dia; desfazer o desfecho é correção — do gestor.
    reopen: can.reopen && isAdminRole(userData?.role),
  };
  const open = (key: MenuModal) => () => setMenuModal(key);

  const phoneGroup: MoreOptionGroup = {
    title: "Pedido",
    options: [
      { label: "Editar pedido", icon: Pencil, onClick: open("edit") },
      {
        label: "Exportar planilha (.xlsx)",
        icon: FileSpreadsheet,
        onClick: () => void exports.exportSheet(),
      },
      {
        label: "Exportar PDF",
        icon: FileText,
        onClick: () => void exports.exportPdf(),
      },
      {
        label: "Exportar PDF com fotos",
        icon: Images,
        onClick: () => void exports.exportPdfWithPhotos(),
      },
    ],
  };

  const menu: MoreOptionGroup[] = [
    ...(isPhone ? [phoneGroup] : []),
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
        ...when(show.reopen, {
          label: "Reabrir pedido",
          icon: RotateCcw,
          onClick: open("reopen"),
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
    isPhone,
    show,
    primary,
    isQuote,
    modalProps,
  };
}
