"use client";

import { useState } from "react";

import { buildRows, missingFields } from "./utils";
import { useHistoryMatches } from "./useHistoryMatches";
import { useHistoryOptions } from "../useHistoryOptions";
import { useHistoryRun } from "../useHistoryRun";
import { useHistorySheet } from "./useHistorySheet";

/** As quatro etapas: planilha → colunas → quem é quem → conferir e importar. */
export function useHistoryImportWizard() {
  const [step, setStep] = useState(0);
  const sheet = useHistorySheet();
  const options = useHistoryOptions();
  const matches = useHistoryMatches({
    rows: sheet.data.rows,
    mapping: sheet.mapping,
    factoryOptions: options.factoryOptions,
    sellerOptions: options.sellerOptions,
  });
  const run = useHistoryRun();
  // Cliente que falta é opção: quem já cadastrou tudo prefere ver o que não
  // bateu a ganhar um cliente com o CNPJ digitado errado. Produto que falta
  // já vem ligado: sem ele o item cai e o pedido soma menos que o da planilha.
  const [createMissingClients, setCreateMissingClients] = useState(false);
  const [createMissingProducts, setCreateMissingProducts] = useState(true);
  // Só liga pelo botão da conferência, depois de a pessoa ver quem e qual fábrica.
  const [grantSellerAccess, setGrantSellerAccess] = useState(false);

  const input = () => {
    const built = buildRows({
      rows: sheet.data.rows,
      headerIndex: sheet.headerIndex,
      mapping: sheet.mapping!,
      factoryByValue: matches.factoryMatches,
      sellerByValue: matches.sellerMatches,
      statusByValue: matches.statusMatches,
      defaultSellerId: matches.defaultSellerId,
    });
    return {
      ...built,
      quantityUnit: sheet.quantityUnit,
      createMissingClients,
      createMissingProducts,
      grantSellerAccess,
    };
  };

  const canAdvance = [
    sheet.data.rows.length > 0 && !!sheet.mapping,
    !!sheet.mapping && missingFields(sheet.mapping).length === 0,
    matches.factoryValues.some((v) => matches.factoryMatches[v]),
    !!run.preview && run.preview.ordersCreated > 0 && !run.imported,
  ][step];

  const next = async () => {
    if (step === 2) {
      // Só avança com a prévia na mão: se a conferência falhou, o aviso já
      // apareceu e a pessoa continua onde estava.
      if (await run.check(input())) setStep(3);
      return;
    }
    if (step === 3) {
      await run.confirm(input());
      return;
    }
    setStep(step + 1);
  };

  /** Na conferência: cadastra os produtos que faltam e confere de novo. */
  const includeMissingProducts = async () => {
    setCreateMissingProducts(true);
    await run.check({ ...input(), createMissingProducts: true });
  };

  /** Na conferência: libera a fábrica aos vendedores que não a atendem e confere de novo. */
  const includeSellerAccess = async () => {
    setGrantSellerAccess(true);
    await run.check({ ...input(), grantSellerAccess: true });
  };

  const back = () => {
    run.resetPreview();
    setStep(Math.max(0, step - 1));
  };

  return {
    step,
    setStep,
    sheet,
    options,
    matches,
    run,
    createMissingClients,
    setCreateMissingClients,
    createMissingProducts,
    setCreateMissingProducts,
    includeMissingProducts,
    includeSellerAccess,
    canAdvance,
    next,
    back,
  };
}
