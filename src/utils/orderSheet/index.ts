/**
 * A ficha de pedido offline.
 *
 * Uma planilha que o vendedor abre sem internet, na frente do cliente: uma aba
 * visível e as listas escondidas atrás. Ele digita o CNPJ, escolhe fábrica e
 * prazo, lança os códigos, e a folha mostra o total com imposto na hora.
 * Depois, ele (ou o escritório) sobe o arquivo e o sistema recalcula tudo.
 */

import type {
  OrderSheetBrand,
  OrderSheetPackage,
  OrderSheetPreset,
} from "./interface";

export type {
  OrderSheetBrand,
  OrderSheetPackage,
  OrderSheetPreset,
} from "./interface";

/** Só letras, números, espaço e hífen — o resto atrapalha em nome de arquivo. */
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .slice(0, 40);

/**
 * Nome do arquivo como o vendedor o veria na pasta.
 *
 * A data entra porque ele trabalha com "salvar como": o arquivo do cliente
 * novo nasce do arquivo do cliente anterior, e sem a data na frente é a ficha
 * do mês passado que volta para a rua.
 */
export const orderSheetFilename = (
  pkg: OrderSheetPackage,
  clientName?: string
): string => {
  const [, month, day] = pkg.generatedAt.split("-");
  const who = clientName ? slug(clientName) : slug(pkg.seller.name);
  const prefix = clientName ? "Pedido" : "Ficha de Pedido";
  return `${prefix} - ${who} - ${day}-${month}.xlsx`;
};

/** Gera a ficha e entrega o arquivo ao navegador. */
export const downloadOrderSheet = async (
  pkg: OrderSheetPackage,
  options: OrderSheetPreset & {
    clientName?: string;
    brand?: OrderSheetBrand;
  } = {}
): Promise<void> => {
  const { clientName, brand, ...preset } = options;
  const { buildOrderSheetFile } = await import("./build");
  const blob = new Blob([await buildOrderSheetFile(pkg, preset, brand)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = orderSheetFilename(pkg, clientName);
  anchor.click();
  URL.revokeObjectURL(url);
};
