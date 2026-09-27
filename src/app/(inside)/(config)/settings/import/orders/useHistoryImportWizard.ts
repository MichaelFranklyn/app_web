"use client";

import { useState } from "react";

import { buildRows, missingFields } from "./utils";
import { useHistoryMatches } from "./useHistoryMatches";
import { useHistoryOptions } from "./useHistoryOptions";
import { useHistoryRun } from "./useHistoryRun";
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

  const input = () => {
    const built = buildRows({
      rows: sheet.data.rows,
      headerIndex: sheet.headerIndex,
      mapping: sheet.mapping!,
      factoryByValue: matches.factoryMatches,
      sellerByValue: matches.sellerMatches,
      defaultSellerId: matches.defaultSellerId,
    });
    return { ...built, quantityUnit: sheet.quantityUnit };
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
    canAdvance,
    next,
    back,
  };
}
