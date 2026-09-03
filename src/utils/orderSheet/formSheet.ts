/**
 * A folha que o vendedor vê — a única aba visível da ficha.
 *
 * Ela é escrita uma vez e usada o dia inteiro: ele digita o CNPJ, escolhe a
 * fábrica, o prazo e o frete, e depois só código e quantidade. Tudo o mais
 * aparece por fórmula, inclusive o total com imposto que ele mostra ao cliente.
 *
 * Duas regras governam o desenho:
 *
 * 1. **O que é para preencher tem fundo âmbar.** Tudo o que aparece sozinho é
 *    branco ou papel. Numa folha aberta em cima do balcão, é isso que diz onde
 *    clicar sem ninguém explicar. (É a mesma convenção da tela: âmbar é
 *    interação, a cor do módulo é identidade.)
 * 2. **A ficha é impressa e entregue ao cliente.** Então o que é recado de
 *    operação — "preencha os campos em amarelo", "peça uma ficha nova quando a
 *    tabela mudar" — ou some quando a ficha fica pronta, ou mora fora da área
 *    de impressão. No papel fica o documento: as marcas, o cliente, as
 *    condições, os itens e o total.
 */

import type { Worksheet } from "exceljs";

import { priceTierNames } from "./dataSheets";
import {
  clientField,
  grandTotalFormula,
  headerWarningFormula,
  lineTotalFormula,
  priceFormula,
  productField,
  tierFormula,
  unitsTotalFormula,
} from "./formulas";
import type { OrderSheetPackage, OrderSheetPreset } from "./interface";
import { ITEM_HEADER_ROW, LABEL } from "./labels";
import {
  CATALOG_COL,
  CLIENT_COL,
  CLIENT_NOTE_ROW,
  COL,
  EXTRA,
  EXTRA_COL,
  FACTORIES_SHEET,
  FACTORY_COL,
  HEAD,
  HEAD_COL,
  ITEMS,
  ITEMS_LAST,
  PRINT_AREA,
  TOTAL_ROW,
  columnLetter,
} from "./layout";
import {
  COLOR,
  FONT,
  MONEY_FORMAT,
  PERCENT_FORMAT,
  fill,
  medium,
  thin,
} from "./theme";

/** Onde cada campo do cabeçalho mora: rótulo, valor e até onde o valor se estende. */
type Side = "left" | "right";

const SIDE = {
  left: {
    label: HEAD_COL.leftLabel,
    labelEnd: HEAD_COL.leftLabelEnd,
    value: HEAD_COL.leftValue,
    valueEnd: HEAD_COL.leftValueEnd,
  },
  right: {
    label: HEAD_COL.rightLabel,
    labelEnd: HEAD_COL.rightLabelEnd,
    value: HEAD_COL.rightValue,
    valueEnd: HEAD_COL.rightValueEnd,
  },
} as const;

/** Última coluna da folha — a do total. */
const LAST_COL = COL.total;

/** Como se usa a folha. Mora na coluna extra: é conversa com o vendedor. */
const HOW_TO = [
  "Preencha os campos em amarelo. O resto aparece sozinho.",
  "Nada desta coluna sai na impressão.",
  "Peça uma ficha nova quando a tabela mudar ou entrar promoção: ao subir o pedido, o sistema recalcula tudo com os preços do dia.",
];

/** Célula que o vendedor preenche: âmbar, destravada e sublinhada. */
const asInput = (sheet: Worksheet, address: string) => {
  const cell = sheet.getCell(address);
  cell.protection = { locked: false };
  cell.fill = fill(COLOR.amberBg);
  cell.border = {
    top: thin(COLOR.amberBd),
    left: thin(COLOR.amberBd),
    right: thin(COLOR.amberBd),
    bottom: thin(COLOR.amber),
  };
  cell.font = { name: FONT, size: 11, bold: true, color: { argb: COLOR.ink } };
  cell.alignment = { vertical: "middle" };
  return cell;
};

/**
 * Fórmula sem resultado guardado.
 *
 * O Excel calcula ao abrir. Um valor gravado aqui viraria um cache que o
 * importador poderia confundir com dado digitado pelo vendedor.
 */
const computed = (sheet: Worksheet, address: string, formula: string) => {
  const cell = sheet.getCell(address);
  cell.value = { formula };
  cell.font = { name: FONT, size: 11, color: { argb: COLOR.ink2 } };
  cell.alignment = { vertical: "middle" };
  return cell;
};

/** Uma linha do cabeçalho: rótulo à esquerda, valor à direita. */
const field = (
  sheet: Worksheet,
  side: Side,
  row: number,
  text: string
): { valueAddress: string } => {
  const { label, labelEnd, value, valueEnd } = SIDE[side];

  sheet.mergeCells(`${label}${row}:${labelEnd}${row}`);
  const labelCell = sheet.getCell(`${label}${row}`);
  labelCell.value = text;
  labelCell.font = {
    name: FONT,
    size: 9,
    bold: true,
    color: { argb: COLOR.muted },
  };
  labelCell.alignment = { vertical: "middle", indent: 1 };

  sheet.mergeCells(`${value}${row}:${valueEnd}${row}`);
  sheet.getRow(row).height = 19;
  return { valueAddress: `${value}${row}` };
};

/**
 * A faixa que abre um bloco.
 *
 * Ela leva a cor do módulo de pedidos — é a mesma marcação da tela, onde o
 * módulo se anuncia no título e o âmbar fica reservado para o que se clica.
 */
const band = (
  sheet: Worksheet,
  row: number,
  columns: readonly string[],
  text: string
) => {
  const [first] = columns;
  const last = columns[columns.length - 1];
  sheet.mergeCells(`${first}${row}:${last}${row}`);
  const cell = sheet.getCell(`${first}${row}`);
  cell.value = text;
  cell.font = {
    name: FONT,
    size: 9,
    bold: true,
    color: { argb: COLOR.module },
  };
  cell.fill = fill(COLOR.moduleBg);
  cell.alignment = { vertical: "middle", indent: 1 };
  sheet.getRow(row).height = 18;

  // A faixa é uma célula mesclada: a borda inferior tem de ser posta em cada
  // célula do intervalo, senão o Excel desenha só sob a primeira.
  columns.forEach((column) => {
    sheet.getCell(`${column}${row}`).border = { bottom: medium(COLOR.module) };
  });
};

const sectionTitle = (sheet: Worksheet, side: Side, text: string) => {
  const { label, labelEnd, value, valueEnd } = SIDE[side];
  band(sheet, HEAD.sectionTitle, [label, labelEnd, value, valueEnd], text);
};

const writeBrandBar = (sheet: Worksheet, pkg: OrderSheetPackage) => {
  sheet.getRow(HEAD.logos).height = 42;

  // As logos entram como imagem (ver `build.ts`); aqui fica o nome da empresa,
  // que é o que sobra quando ela ainda não subiu logo nenhuma.
  sheet.mergeCells(`A${HEAD.logos}:D${HEAD.logos}`);
  sheet.getCell(`A${HEAD.logos}`).alignment = { vertical: "middle" };

  sheet.mergeCells(`G${HEAD.logos}:${LAST_COL}${HEAD.logos}`);
  sheet.getCell(`G${HEAD.logos}`).alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  // O filete da cor do módulo, separando as marcas do documento. É a única
  // linha grossa da folha — o que vem depois dela é a ficha.
  const rule = sheet.getRow(HEAD.rule);
  rule.height = 4;
  for (let column = 1; column <= ITEM_HEADER_ROW.length; column += 1) {
    rule.getCell(column).fill = fill(COLOR.module);
  }

  sheet.mergeCells(`A${HEAD.title}:F${HEAD.title}`);
  const title = sheet.getCell(`A${HEAD.title}`);
  title.value = "FICHA DE PEDIDO";
  title.font = { name: FONT, size: 20, bold: true, color: { argb: COLOR.ink } };
  title.alignment = { vertical: "middle" };
  sheet.getRow(HEAD.title).height = 30;

  // A identidade fica à vista: de quem é a ficha e de quando são os preços. É o
  // que denuncia a ficha do mês passado reaproveitada com "salvar como" — e o
  // cliente que recebe a folha impressa também tem direito de saber a data.
  sheet.mergeCells(`G${HEAD.identity}:${LAST_COL}${HEAD.identity}`);
  const identity = sheet.getCell(`G${HEAD.identity}`);
  identity.value = `${pkg.seller.name}  ·  preços de ${formatDate(pkg.generatedAt)}`;
  identity.font = {
    name: FONT,
    size: 10,
    bold: true,
    color: { argb: COLOR.ink2 },
  };
  identity.alignment = { vertical: "middle", horizontal: "right" };
};

const writeClientBlock = (
  sheet: Worksheet,
  preset: OrderSheetPreset | undefined
) => {
  sectionTitle(sheet, "left", "CLIENTE");

  const cnpj = asInput(
    sheet,
    field(sheet, "left", HEAD.cnpj, LABEL.cnpj).valueAddress
  );
  cnpj.value = preset?.cnpjDigits ?? "";
  cnpj.font = { name: FONT, size: 12, bold: true, color: { argb: COLOR.ink } };

  const lines: [number, string, number][] = [
    [HEAD.razaoSocial, LABEL.razaoSocial, CLIENT_COL.razaoSocial],
    [HEAD.fantasia, LABEL.fantasia, CLIENT_COL.fantasia],
    [HEAD.address, LABEL.address, CLIENT_COL.address],
    [HEAD.cityState, LABEL.cityState, CLIENT_COL.cityState],
  ];
  lines.forEach(([row, text, column]) => {
    const { valueAddress } = field(sheet, "left", row, text);
    computed(sheet, valueAddress, clientField(column));
  });
};

const writeOrderBlock = (
  sheet: Worksheet,
  pkg: OrderSheetPackage,
  preset: OrderSheetPreset | undefined
) => {
  sectionTitle(sheet, "right", "CONDIÇÕES DO PEDIDO");

  const factory = asInput(
    sheet,
    field(sheet, "right", HEAD.factory, LABEL.factory).valueAddress
  );
  factory.value = preset?.factoryName ?? "";

  asInput(
    sheet,
    field(sheet, "right", HEAD.paymentTerm, LABEL.paymentTerm).valueAddress
  );
  asInput(
    sheet,
    field(sheet, "right", HEAD.freight, LABEL.freight).valueAddress
  );

  // O prazo padrão da fábrica só existe quando ela tem um só — com duas, um
  // palpite aqui viraria o prazo errado no pedido de metade dos clientes.
  const delivery = asInput(
    sheet,
    field(sheet, "right", HEAD.deliveryDays, LABEL.deliveryDays).valueAddress
  );
  delivery.alignment = { vertical: "middle", horizontal: "left" };
  const defaults = new Set(
    pkg.factories.map((f) => f.deliveryEstimateDays).filter(Boolean)
  );
  if (defaults.size === 1) delivery.value = [...defaults][0] as number;

  asInput(
    sheet,
    field(sheet, "right", HEAD.coverageDays, LABEL.coverageDays).valueAddress
  ).alignment = { vertical: "middle", horizontal: "left" };
};

const writeItemsHeader = (sheet: Worksheet) => {
  const row = sheet.getRow(ITEMS.header);
  row.height = 28;
  ITEM_HEADER_ROW.forEach((text, index) => {
    const cell = row.getCell(index + 1);
    cell.value = text;
    cell.font = {
      name: FONT,
      size: 9,
      bold: true,
      color: { argb: COLOR.white },
    };
    cell.fill = fill(COLOR.ink);
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });
};

const writeItemRows = (sheet: Worksheet, priceColumns: number) => {
  for (let row = ITEMS.first; row <= ITEMS_LAST; row += 1) {
    sheet.getRow(row).height = 18;

    // Zebra: com quarenta linhas iguais, o olho perde a linha ao ir do código
    // até o total, do outro lado da folha. O filete vertical faz o resto — ele
    // separa as colunas sem o peso de uma grade fechada.
    const zebra = (row - ITEMS.first) % 2 === 1;
    ITEM_HEADER_ROW.forEach((_, index) => {
      const cell = sheet.getCell(`${columnLetter(index + 1)}${row}`);
      if (zebra) cell.fill = fill(COLOR.zebra);
      cell.border = {
        bottom: thin(COLOR.line),
        left: thin(COLOR.line),
        right: thin(COLOR.line),
      };
    });

    asInput(sheet, `${COL.sku}${row}`);
    asInput(sheet, `${COL.packQty}${row}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    const discount = asInput(sheet, `${COL.discount}${row}`);
    discount.numFmt = PERCENT_FORMAT;
    discount.alignment = { horizontal: "center", vertical: "middle" };

    computed(
      sheet,
      `${COL.description}${row}`,
      productField(row, CATALOG_COL.name, priceColumns, "Código não encontrado")
    );
    computed(
      sheet,
      `${COL.pack}${row}`,
      productField(row, CATALOG_COL.pack, priceColumns)
    ).alignment = { horizontal: "center", vertical: "middle" };
    computed(
      sheet,
      `${COL.multiple}${row}`,
      productField(row, CATALOG_COL.multiple, priceColumns)
    ).alignment = { horizontal: "center", vertical: "middle" };
    computed(
      sheet,
      `${COL.unitsTotal}${row}`,
      unitsTotalFormula(row, priceColumns)
    ).alignment = { horizontal: "center", vertical: "middle" };

    const price = computed(
      sheet,
      `${COL.packPrice}${row}`,
      priceFormula(row, priceColumns)
    );
    price.numFmt = MONEY_FORMAT;

    computed(
      sheet,
      `${COL.taxes}${row}`,
      productField(row, CATALOG_COL.taxes, priceColumns)
    ).alignment = { horizontal: "center", vertical: "middle" };

    const total = computed(sheet, `${COL.total}${row}`, lineTotalFormula(row));
    total.numFmt = MONEY_FORMAT;
    total.font = {
      name: FONT,
      size: 11,
      bold: true,
      color: { argb: COLOR.ink },
    };
  }
};

const writeTotal = (sheet: Worksheet) => {
  sheet.getRow(TOTAL_ROW).height = 28;

  sheet.mergeCells(`${COL.sku}${TOTAL_ROW}:${COL.taxes}${TOTAL_ROW}`);
  const label = sheet.getCell(`${COL.sku}${TOTAL_ROW}`);
  label.value = LABEL.total;
  label.font = { name: FONT, size: 11, bold: true, color: { argb: COLOR.ink } };
  label.alignment = { horizontal: "right", vertical: "middle", indent: 1 };

  const total = sheet.getCell(`${COL.total}${TOTAL_ROW}`);
  total.value = { formula: grandTotalFormula() };
  total.numFmt = MONEY_FORMAT;
  total.font = { name: FONT, size: 15, bold: true, color: { argb: COLOR.ink } };
  total.alignment = { horizontal: "right", vertical: "middle" };

  // A faixa inteira em papel, com o filete do módulo por cima: é o fecho do
  // documento, e é a primeira coisa que o cliente procura na folha.
  ITEM_HEADER_ROW.forEach((_, index) => {
    const cell = sheet.getCell(`${columnLetter(index + 1)}${TOTAL_ROW}`);
    cell.fill = fill(COLOR.paper2);
    cell.border = { top: medium(COLOR.module), bottom: thin(COLOR.line2) };
  });
};

/**
 * O aviso de validade — a única nota que sai no papel.
 *
 * Ela é do cliente que recebe a folha: diz de quando são os preços. O que é
 * recado de vendedor mora na coluna extra, fora da área de impressão.
 */
const writeClientNote = (sheet: Worksheet, pkg: OrderSheetPackage) => {
  sheet.mergeCells(`A${CLIENT_NOTE_ROW}:${LAST_COL}${CLIENT_NOTE_ROW}`);
  const note = sheet.getCell(`A${CLIENT_NOTE_ROW}`);
  note.value = `Valores de ${formatDate(
    pkg.generatedAt
  )}, já com impostos. Sujeitos à confirmação da fábrica.`;
  note.font = { name: FONT, size: 9, color: { argb: COLOR.muted } };
  note.alignment = { vertical: "middle" };
  sheet.getRow(CLIENT_NOTE_ROW).height = 18;
};

/**
 * O bloco de informações extras, à direita da área de impressão.
 *
 * Aqui vai o que a ficha precisa saber mas o cliente não precisa ver: o nível
 * acordado, que escolhe a coluna de preço da folha inteira, e as observações do
 * vendedor, que sobem junto com o pedido. Como a impressão para na coluna J,
 * nada disso chega ao papel.
 */
const writeExtraColumn = (sheet: Worksheet) => {
  const { label, labelEnd, value, valueEnd } = EXTRA_COL;
  const columns = [label, labelEnd, value, valueEnd];

  band(sheet, EXTRA.title, columns, "INFORMAÇÕES EXTRAS — O CLIENTE NÃO VÊ");

  // O que está faltando agora. Antes esta linha ficava no alto do cabeçalho, no
  // meio do que é impresso — e "Informe o CNPJ do cliente para começar" é
  // conversa com o vendedor, não com quem recebe a folha.
  sheet.mergeCells(`${label}${EXTRA.warning}:${valueEnd}${EXTRA.warning}`);
  const warning = sheet.getCell(`${label}${EXTRA.warning}`);
  warning.value = { formula: headerWarningFormula() };
  warning.font = {
    name: FONT,
    size: 9,
    bold: true,
    color: { argb: COLOR.amber2 },
  };
  warning.alignment = { vertical: "middle", wrapText: true, indent: 1 };
  sheet.getRow(EXTRA.warning).height = 24;

  const tierLabel = sheet.getCell(`${label}${EXTRA.tier}`);
  sheet.mergeCells(`${label}${EXTRA.tier}:${labelEnd}${EXTRA.tier}`);
  tierLabel.value = LABEL.tier;
  tierLabel.font = {
    name: FONT,
    size: 9,
    bold: true,
    color: { argb: COLOR.muted },
  };
  tierLabel.alignment = { vertical: "middle", indent: 1 };

  sheet.mergeCells(`${value}${EXTRA.tier}:${valueEnd}${EXTRA.tier}`);
  computed(sheet, `${value}${EXTRA.tier}`, tierFormula()).font = {
    name: FONT,
    size: 11,
    bold: true,
    color: { argb: COLOR.ink2 },
  };

  const notesLabel = sheet.getCell(`${label}${EXTRA.notes}`);
  sheet.mergeCells(`${label}${EXTRA.notes}:${labelEnd}${EXTRA.notes}`);
  notesLabel.value = LABEL.notes;
  notesLabel.font = {
    name: FONT,
    size: 9,
    bold: true,
    color: { argb: COLOR.muted },
  };
  notesLabel.alignment = { vertical: "top", indent: 1 };

  // Uma caixa de quatro linhas, e não um campo de uma: aqui se escreve frase
  // ("cliente pediu para entregar depois do dia 10"), não palavra.
  sheet.mergeCells(`${value}${EXTRA.notes}:${valueEnd}${EXTRA.notesEnd}`);
  const notes = asInput(sheet, `${value}${EXTRA.notes}`);
  notes.font = { name: FONT, size: 10, color: { argb: COLOR.ink } };
  notes.alignment = { vertical: "top", wrapText: true, indent: 1 };

  // O manual da folha. Ele é fixo (não some quando a ficha é preenchida) porque
  // aqui isso não custa nada: esta coluna nunca chega ao papel.
  sheet.mergeCells(`${label}${EXTRA.howTo}:${valueEnd}${EXTRA.howToEnd}`);
  const howTo = sheet.getCell(`${label}${EXTRA.howTo}`);
  howTo.value = HOW_TO.map((line) => `•  ${line}`).join("\n");
  howTo.font = { name: FONT, size: 9, color: { argb: COLOR.muted } };
  howTo.alignment = { vertical: "top", wrapText: true, indent: 1 };
  howTo.fill = fill(COLOR.paper);
  for (let row = EXTRA.howTo; row <= EXTRA.howToEnd; row += 1) {
    sheet.getRow(row).height = 18;
  }
};

const writeValidations = (sheet: Worksheet, pkg: OrderSheetPackage) => {
  const lastFactoryRow = pkg.factories.length + 1;
  const factoryColumn = columnLetter(FACTORY_COL.name);
  const factoryCell = `${HEAD_COL.rightValue}${HEAD.factory}`;
  // Absoluta ($H$8): a validação do prazo aponta para a célula da fábrica, e uma
  // referência relativa passaria a olhar outra linha se alguém copiar a célula.
  const factoryRef = `$${HEAD_COL.rightValue}$${HEAD.factory}`;

  sheet.getCell(factoryCell).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [
      `${FACTORIES_SHEET}!$${factoryColumn}$2:$${factoryColumn}$${lastFactoryRow}`,
    ],
    showErrorMessage: true,
    errorTitle: "Fábrica",
    error: "Escolha uma das fábricas da lista.",
  };

  // O prazo depende da fábrica escolhida: `MATCH` devolve a LINHA dela na aba
  // FABRICAS e o intervalo nomeado daquela linha traz só os prazos dela. Os
  // nomes são numerados pela linha justamente para não depender do nome da
  // fábrica, que tem espaço e acento.
  sheet.getCell(`${HEAD_COL.rightValue}${HEAD.paymentTerm}`).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [
      `INDIRECT("PRAZOS_"&MATCH(${factoryRef},${FACTORIES_SHEET}!$${factoryColumn}:$${factoryColumn},0))`,
    ],
  };

  sheet.getCell(`${HEAD_COL.rightValue}${HEAD.freight}`).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: ['"CIF,FOB"'],
  };
};

/**
 * A folha no papel.
 *
 * `printArea` é o que separa o documento do instrumento: ela para no aviso de
 * validade, e o recado de operação — que vem depois — não é impresso. O rodapé
 * de página só existe na impressão, e é onde entra a paginação que uma ficha
 * de vinte itens precisa.
 */
const setUpPrinting = (sheet: Worksheet, pkg: OrderSheetPackage) => {
  sheet.pageSetup = {
    orientation: "landscape",
    printArea: PRINT_AREA,
    // Com mais de uma página, a segunda vinha sem saber que coluna era qual.
    printTitlesRow: `${ITEMS.header}:${ITEMS.header}`,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  };

  sheet.headerFooter = {
    oddFooter: `&L&"${FONT}"&8${pkg.seller.name}&R&"${FONT}"&8Página &P de &N`,
  };
};

// A..J é a ficha (o que imprime); K é a calha; L..Q é o bloco de extras.
const COLUMN_WIDTHS = [
  14, 40, 13, 8, 10, 10, 13, 9, 11, 15, 3, 16, 8, 14, 10, 10, 10,
];

/** Desenha a folha inteira. */
export const writeFormSheet = (
  sheet: Worksheet,
  pkg: OrderSheetPackage,
  preset?: OrderSheetPreset
): void => {
  const priceColumns = priceTierNames(pkg).length;

  COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  writeBrandBar(sheet, pkg);
  writeClientBlock(sheet, preset);
  writeOrderBlock(sheet, pkg, preset);
  writeItemsHeader(sheet);
  writeItemRows(sheet, priceColumns);
  writeTotal(sheet);
  writeClientNote(sheet, pkg);
  writeExtraColumn(sheet);
  writeValidations(sheet, pkg);
  setUpPrinting(sheet, pkg);

  // O cabeçalho da tabela fica preso no topo: com quarenta linhas, o vendedor
  // perde de vista qual coluna é qual assim que rola a folha.
  sheet.views = [{ state: "frozen", ySplit: ITEMS.header }];
};

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};
