import { PortalCatalogFactory } from "../../../interface";
import { FactoryPicker } from "../FactoryPicker";

interface OrderToolbarProps {
  token: string;
  search: string | null;
  /** Fábrica do orçamento (nula = falta escolher). */
  factoryId: string | null;
  factories: PortalCatalogFactory[];
}

/**
 * De qual fábrica é o orçamento — logo abaixo do cabeçalho, solto na página
 * (sem cartão de formulário), como os filtros de topo das telas do escritório.
 * A busca de produto mora no cabeçalho da tabela do catálogo.
 *
 * Com uma fábrica só não há o que escolher.
 */
export function OrderToolbar({
  token,
  search,
  factoryId,
  factories,
}: OrderToolbarProps) {
  if (factories.length <= 1) return null;

  return (
    <FactoryPicker
      token={token}
      search={search}
      factoryId={factoryId}
      factories={factories}
    />
  );
}
