/**
 * Monta o arquivo .xlsx da ficha de pedido.
 *
 * O ExcelJS entra aqui — e só aqui — porque a folha precisa de duas coisas que
 * o SheetJS (o que o resto do projeto usa para ler planilha) não escreve:
 * lista suspensa e proteção de aba. Ele é pesado, então é carregado sob demanda
 * pelo `index.ts`: quem nunca clica no botão nunca baixa a biblioteca.
 */

import type { Workbook, Worksheet } from "exceljs";

import {
  buildCatalogRows,
  buildClientRows,
  buildFactoryRows,
  buildLinkRows,
  buildMetaRows,
  type Row,
} from "./dataSheets";
import { writeFormSheet } from "./formSheet";
import type {
  OrderSheetBrand,
  OrderSheetPackage,
  OrderSheetPreset,
} from "./interface";
import {
  CATALOG_SHEET,
  CLIENTS_SHEET,
  FACTORIES_SHEET,
  FACTORY_COL,
  FORM_SHEET,
  HEAD,
  LINKS_SHEET,
  META_SHEET,
  columnLetter,
} from "./layout";
import { COLOR, FONT } from "./theme";

/**
 * Aba de dados: preenchida e fora de alcance.
 *
 * `veryHidden` e não `hidden`: a aba escondida comum aparece na caixa "Reexibir"
 * do Excel, a um clique de distância — e o que há dentro delas (o catálogo, a
 * carteira, os ids) é o que faz as fórmulas e a importação funcionarem. Mexer
 * ali por curiosidade quebra a ficha em silêncio, e o vendedor só descobre na
 * hora de subir o arquivo. Uma aba `veryHidden` não é listada por nenhuma tela
 * do Excel; só volta por macro, que é uma decisão, não um acidente.
 */
const addDataSheet = (
  workbook: Workbook,
  name: string,
  rows: Row[]
): Worksheet => {
  const sheet = workbook.addWorksheet(name);
  rows.forEach((row) => sheet.addRow(row));
  sheet.state = "veryHidden";
  return sheet;
};

/**
 * Um intervalo nomeado por fábrica, com os prazos dela.
 *
 * O nome é `PRAZOS_<linha>` — a mesma linha que o `MATCH` do dropdown devolve.
 * Numerar pela linha evita depender do nome da fábrica, que tem espaço e acento
 * e não serve como nome definido no Excel.
 */
const nameFactoryTerms = (workbook: Workbook, pkg: OrderSheetPackage) => {
  const first = columnLetter(FACTORY_COL.firstTerm);
  pkg.factories.forEach((factory, index) => {
    const row = index + 2;
    const count = factory.paymentTerms.length;
    if (count === 0) return;
    const last = columnLetter(FACTORY_COL.firstTerm + count - 1);
    workbook.definedNames.add(
      `${FACTORIES_SHEET}!$${first}$${row}:$${last}$${row}`,
      `PRAZOS_${row}`
    );
  });
};

/**
 * A senha da proteção da folha.
 *
 * Não protege de ninguém — está no código aberto e o Excel a remove em
 * segundos para quem quiser. O papel dela é outro: transformar "desproteger a
 * planilha" em um ato deliberado. Quem precisa (o suporte, resolvendo um caso)
 * sabe onde procurar; quem está com pressa na loja não desprotege sem querer.
 */
const PROTECTION_PASSWORD = "girus";

/** Altura da faixa de marca, em pixels — as duas logos se ajustam a ela. */
const BRAND_HEIGHT = 34;

/**
 * As duas marcas no topo: a da representação à esquerda, a do sistema à direita.
 *
 * A ficha é um documento que o cliente vê — quem assina é a representação. A
 * marca do sistema fica do outro lado, discreta, como no rodapé dos PDFs.
 * Empresa sem logo cai no nome, que é o mínimo para o documento dizer quem
 * emite; imagem que não carregou simplesmente não aparece (a ficha não pode
 * deixar de existir porque a logo falhou).
 */
const writeBrandImages = (
  workbook: Workbook,
  sheet: Worksheet,
  brand: OrderSheetBrand | undefined
) => {
  const place = (
    image: { dataUrl: string; width: number; height: number },
    col: number
  ) => {
    const extension = image.dataUrl.includes("image/jpeg") ? "jpeg" : "png";
    const id = workbook.addImage({ base64: image.dataUrl, extension });
    const ratio = image.width / image.height || 1;
    sheet.addImage(id, {
      tl: { col, row: HEAD.logos - 0.85 },
      ext: { width: BRAND_HEIGHT * ratio, height: BRAND_HEIGHT },
      editAs: "oneCell",
    });
  };

  if (brand?.companyLogo) {
    place(brand.companyLogo, 0.1);
  } else if (brand?.companyName) {
    const cell = sheet.getCell(`A${HEAD.logos}`);
    cell.value = brand.companyName;
    cell.font = {
      name: FONT,
      size: 13,
      bold: true,
      color: { argb: COLOR.ink },
    };
  }

  // Encostada na direita: a folha tem dez colunas e a última é a do total.
  if (brand?.girusLogo) place(brand.girusLogo, 7.9);
};

/**
 * O arquivo pronto, em bytes.
 *
 * Devolve o buffer e não um `Blob` de propósito: assim o mesmo caminho que o
 * vendedor percorre pode ser aberto de volta em teste, sem depender do `Blob`
 * do navegador. Embrulhar para download é trabalho do `index.ts`.
 */
export const buildOrderSheetFile = async (
  pkg: OrderSheetPackage,
  preset?: OrderSheetPreset,
  brand?: OrderSheetBrand
): Promise<ArrayBuffer> => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Girus";
  workbook.created = new Date();

  const form = workbook.addWorksheet(FORM_SHEET);
  writeFormSheet(form, pkg, preset);
  writeBrandImages(workbook, form, brand);

  addDataSheet(workbook, CATALOG_SHEET, buildCatalogRows(pkg));
  addDataSheet(workbook, CLIENTS_SHEET, buildClientRows(pkg));
  addDataSheet(workbook, LINKS_SHEET, buildLinkRows(pkg));
  addDataSheet(workbook, FACTORIES_SHEET, buildFactoryRows(pkg));
  addDataSheet(workbook, META_SHEET, buildMetaRows(pkg));

  nameFactoryTerms(workbook, pkg);

  // A folha inteira travada, menos o que o vendedor preenche (as células foram
  // destravadas uma a uma). O alvo é o acidente: apagar a fórmula do preço
  // junto com os dados do cliente anterior, arrastar uma célula sem querer,
  // deletar a linha do total. Nada disso avisa — a ficha só falha depois, na
  // hora de subir.
  //
  // A senha não é segredo (está aqui, no código): ela existe para desproteger
  // ser uma DECISÃO, e não um clique distraído. Continua liberado o que não
  // quebra nada: selecionar qualquer célula, copiar, e mexer na largura das
  // colunas e na altura das linhas para ler melhor.
  await form.protect(PROTECTION_PASSWORD, {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatColumns: true,
    formatRows: true,
  });

  return workbook.xlsx.writeBuffer();
};
