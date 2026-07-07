"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import {
  BarChart3,
  Check,
  Grid3x3,
  Image as ImageIcon,
  LineChart,
  List,
  Maximize2,
  MoreHorizontal,
  PieChart,
  Sheet,
  Tag,
} from "lucide-react";
import { ReactNode } from "react";

import { ChartCapabilities, ChartPrefs } from "../../chartCustomize";

interface Props {
  prefs: ChartPrefs;
  capabilities: ChartCapabilities;
  /** Desabilita o menu enquanto o gráfico não montou (sem dados/instância). */
  disabled: boolean;
  onToggle: (key: "showLabel" | "showLegend" | "showGrid") => void;
  onSelectVariant: (index: number) => void;
  onExpand: () => void;
  onDownloadImage: () => void;
  onDownloadCsv: () => void;
}

/** Ícone da variação de forma conforme o rótulo. */
const variantIcon = (label: string) => {
  if (label.includes("Linha") || label.includes("Área")) return LineChart;
  if (label.includes("Rosca") || label.includes("Pizza")) return PieChart;
  return BarChart3;
};

/** Rótulo de seção do menu (não-interativo). */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-[14px] pt-[8px] pb-[4px] font-mono text-[11px] tracking-wide text-(--muted) uppercase">
      {children}
    </div>
  );
}

/** Item que mantém o menu aberto e marca com ✓ quando ativo. */
function CheckItem({
  icon,
  active,
  onSelect,
  children,
}: {
  icon: React.ElementType;
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <Dropdown.Item
      icon={icon}
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <span className="flex-1">{children}</span>
      {active && <Check size={14} className="text-(--amber)" />}
    </Dropdown.Item>
  );
}

/**
 * Menu de personalização do gráfico (três pontos): forma de visualizar (variações
 * do mesmo tipo), exibição (rótulos, legenda, grade — só os aplicáveis),
 * expandir e download (imagem/dados).
 */
export function ChartMenu({
  prefs,
  capabilities,
  disabled,
  onToggle,
  onSelectVariant,
  onExpand,
  onDownloadImage,
  onDownloadCsv,
}: Props) {
  const { variants } = capabilities;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          disabled={disabled}
          aria-label="Opções do gráfico"
        >
          <Button.Icon icon={MoreHorizontal} />
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        {variants.length > 1 && (
          <>
            <SectionLabel>Forma de visualizar</SectionLabel>
            {variants.map((label, i) => (
              <CheckItem
                key={label}
                icon={variantIcon(label)}
                active={i === prefs.variant}
                onSelect={() => onSelectVariant(i)}
              >
                {label}
              </CheckItem>
            ))}
            <Dropdown.Separator />
          </>
        )}

        <SectionLabel>Exibição</SectionLabel>
        <CheckItem
          icon={Tag}
          active={prefs.showLabel}
          onSelect={() => onToggle("showLabel")}
        >
          Rótulos
        </CheckItem>
        {capabilities.hasLegend && (
          <CheckItem
            icon={List}
            active={prefs.showLegend}
            onSelect={() => onToggle("showLegend")}
          >
            Legenda
          </CheckItem>
        )}
        {capabilities.hasAxes && (
          <CheckItem
            icon={Grid3x3}
            active={prefs.showGrid}
            onSelect={() => onToggle("showGrid")}
          >
            Linhas de grade
          </CheckItem>
        )}

        <Dropdown.Separator />
        <Dropdown.Item icon={Maximize2} onSelect={onExpand}>
          Expandir
        </Dropdown.Item>

        <Dropdown.Separator />
        <SectionLabel>Baixar</SectionLabel>
        <Dropdown.Item icon={ImageIcon} onSelect={onDownloadImage}>
          Imagem (PNG)
        </Dropdown.Item>
        <Dropdown.Item icon={Sheet} onSelect={onDownloadCsv}>
          Dados (CSV)
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
