"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { FileDown } from "lucide-react";

import {
  allChartKeys,
  describeGroup,
  describeSelection,
  hasSomethingToPrint,
  isChartSelected,
  PrintGroup,
  PrintSelection,
  selectedInGroup,
  toggleChart,
  toggleSection,
} from "../../printSelection";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** As partes da história e os gráficos de cada uma, na ordem da página. */
  groups: PrintGroup[];
  selection: PrintSelection;
  onSelectionChange: (selection: PrintSelection) => void;
  onConfirm: () => void;
  exporting: boolean;
}

/**
 * Escolhe o que entra no PDF do Desempenho antes de gerá-lo.
 *
 * A página tem trinta gráficos em sete partes, e quase nunca é a página inteira
 * que se leva para a reunião: é a parte das comissões, ou os três gráficos que
 * sustentam um argumento. Antes deste passo, imprimir era pegar tudo e descartar
 * papel — ou desistir do PDF.
 *
 * A escolha é por parte E por gráfico porque as duas perguntas existem: "quero a
 * parte das fábricas" e "quero só este gráfico daqui". A caixa da parte só
 * aparece marcada quando todos os gráficos dela estão — meia parte marcada como
 * inteira faria a conferência antes de imprimir dizer a coisa errada.
 */
export function PrintOptionsModal({
  open,
  onOpenChange,
  groups,
  selection,
  onSelectionChange,
  onConfirm,
  exporting,
}: Props) {
  const total = allChartKeys(groups).length;
  const canPrint = hasSomethingToPrint(selection);

  const selectAll = () =>
    onSelectionChange({ ...selection, charts: allChartKeys(groups) });
  const clearAll = () => onSelectionChange({ ...selection, charts: [] });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="2xl">
        <Modal.Header
          title="O que imprimir"
          description="Marque as partes e os gráficos que devem entrar no PDF. A ordem no papel é a mesma da tela."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            <div className="flex flex-wrap items-center gap-12">
              <Button.Root
                type="button"
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
                onClick={selectAll}
              >
                <Button.Title>Marcar tudo</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="sm"
                noUppercase
                onClick={clearAll}
              >
                <Button.Title>Limpar</Button.Title>
              </Button.Root>
              <Title variant="body-xs" color="muted" className="ml-auto">
                {describeSelection(selection, total)}
              </Title>
            </div>

            {/* Os indicadores do topo não são um gráfico: eles entram no
                CABEÇALHO do documento, e por isso a escolha é separada. */}
            <Input.Checkbox
              label="Indicadores do topo (faturamento, pedidos, ticket médio)"
              checked={selection.includeKpis}
              onChange={() =>
                onSelectionChange({
                  ...selection,
                  includeKpis: !selection.includeKpis,
                })
              }
            />

            {groups.length === 0 ? (
              <Title variant="body-sm" color="muted">
                Os gráficos ainda estão carregando. Feche e tente de novo em
                instantes.
              </Title>
            ) : (
              <div className="flex flex-col gap-20">
                {groups.map((group) => {
                  const isComplete =
                    selectedInGroup(selection, group) === group.charts.length;

                  return (
                    <div
                      key={group.section || "sem-secao"}
                      className="flex flex-col gap-8"
                    >
                      <div className="flex items-center gap-8">
                        <Input.Checkbox
                          label={group.section || "Outros gráficos"}
                          checked={isComplete}
                          onChange={() =>
                            onSelectionChange(toggleSection(selection, group))
                          }
                        />
                        <Title variant="micro" color="muted">
                          {describeGroup(selection, group)}
                        </Title>
                      </div>

                      <div className="flex flex-col gap-6 pl-20">
                        {group.charts.map((choice) => (
                          <Input.Checkbox
                            key={choice.key}
                            label={choice.title}
                            checked={isChartSelected(selection, choice.key)}
                            onChange={() =>
                              onSelectionChange(
                                toggleChart(selection, choice.key)
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              disabled={exporting}
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
            loading={exporting}
            disabled={!canPrint}
            onClick={onConfirm}
          >
            <Button.Icon icon={FileDown} />
            <Button.Title>Baixar PDF</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
