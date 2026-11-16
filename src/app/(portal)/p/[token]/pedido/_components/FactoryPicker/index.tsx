"use client";

import { Title } from "@/components/Title";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { useRouter } from "next/navigation";
import { PortalCatalogFactory } from "../../../interface";
import { orderHref } from "../../utils";

interface FactoryPickerProps {
  token: string;
  search: string | null;
  factoryId: string | null;
  factories: PortalCatalogFactory[];
}

/**
 * De qual fábrica é o orçamento — uma por vez, sem "todas". Só as fábricas
 * que atendem o cliente (o servidor manda a lista e ignora qualquer outra).
 *
 * Botões sempre à vista, como o "Valores de" das comissões: são poucas
 * fábricas, e um toque troca — sem abrir lista para achar o nome.
 *
 * A troca é por endereço (`?f=`), para a busca e a paginação lembrarem dela;
 * volta para a página 1 e não rola a tela, porque a escolha fica no topo.
 */
export function FactoryPicker({
  token,
  search,
  factoryId,
  factories,
}: FactoryPickerProps) {
  const router = useRouter();
  const options: ToggleOption<string>[] = factories.map((factory) => ({
    value: factory.factoryId,
    label: factory.name,
  }));

  const select = (value: string) => {
    if (value === factoryId) return;
    const href = orderHref(token, search, 1, value);
    router.push(href.replace(/#.*$/, ""), { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Title variant="caption" color="muted">
        Fábrica
      </Title>
      <ToggleGroup
        aria-label="Fábrica do orçamento"
        options={options}
        value={factoryId}
        onChange={select}
        fullWidthBelowDesktop
      />
    </div>
  );
}
