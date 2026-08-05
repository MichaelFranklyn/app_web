import { redirect } from "next/navigation";

import { REPORT_TABS, REPORTS_BASE_PATH } from "./utils";

/**
 * `/dashboard/reports` não é uma tela: é o caminho até as abas. Um índice com
 * cinco cartões só cobraria um clique extra de quem já sabe o que veio buscar,
 * então a raiz abre o primeiro relatório (Vendas).
 */
export default function ReportsPage() {
  redirect(`${REPORTS_BASE_PATH}/${REPORT_TABS[0].slug}`);
}
