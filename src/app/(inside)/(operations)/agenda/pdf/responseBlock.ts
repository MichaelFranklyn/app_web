import { COLOR, PAGE, Pdf, setDraw, setFill, setText } from "@/utils/pdf/theme";

/** Lado do QR no papel. 92pt ≈ 3,2cm — lido por qualquer celular a um palmo. */
const QR_SIZE = 92;
const BLOCK_H = QR_SIZE + 28;

/**
 * Gera o QR do endereço como PNG.
 *
 * Import dinâmico junto com o resto do PDF: a biblioteca só faz sentido no
 * clique de imprimir, e ela não pode entrar no bundle inicial de ninguém.
 *
 * `margin: 1` e não o padrão 4: a "zona silenciosa" já está garantida pela
 * caixa branca em volta, e quatro módulos de margem encolheriam o desenho
 * dentro do mesmo espaço — que é justamente o que faz um QR impresso parar de
 * ser lido de longe.
 */
export const buildQrDataUrl = async (url: string): Promise<string | null> => {
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(url, { margin: 1, width: 512 });
  } catch {
    // O papel sai igual, com o endereço escrito. Um QR que falhou não pode
    // impedir o vendedor de levar a rota.
    return null;
  }
};

/**
 * O bloco que fecha a folha: "responda esta rota aqui".
 *
 * É o que liga o papel de volta ao sistema. O vendedor sai com a folha, roda o
 * dia e, à noite, aponta a câmera para o QR e diz o que aconteceu em cada
 * cliente — sem abrir o app, sem lembrar senha. A adoção é o gargalo do motor
 * (1 recomendação trabalhada em 94), e cada passo entre o fim do dia e o
 * registro é um lugar onde a resposta se perde.
 *
 * O endereço vai ESCRITO ao lado do QR de propósito: a folha costuma ser
 * fotografada e mandada por WhatsApp, e um QR fotografado de uma foto raramente
 * é lido — o texto, sim, dá para digitar.
 *
 * Devolve o `y` livre abaixo do bloco.
 */
export const drawResponseBlock = (
  pdf: Pdf,
  qrDataUrl: string | null,
  url: string,
  startY: number,
  onNewPage: () => number,
  /** Folha do dia ou da semana — muda o título e a validade escrita. */
  scope: "day" | "week" = "day"
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const right = pageW - PAGE.margin;

  // O bloco inteiro numa página só: QR de um lado e instrução do outro, partidos
  // ao meio, não são lidos por ninguém.
  const y =
    startY + BLOCK_H > pageH - PAGE.margin - 30 ? onNewPage() : startY + 10;

  setFill(pdf, COLOR.brandSoft);
  setDraw(pdf, COLOR.brand);
  pdf.roundedRect(PAGE.margin, y, right - PAGE.margin, BLOCK_H, 6, 6, "FD");

  const textX = PAGE.margin + 16;
  let textY = y + 26;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  setText(pdf, COLOR.brand);
  pdf.text(
    scope === "week" ? "RESPONDA AS VISITAS DA SEMANA" : "RESPONDA ESTA ROTA",
    textX,
    textY
  );

  textY += 18;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  setText(pdf, COLOR.ink);
  pdf.text(
    "Aponte a câmera do celular para o código ao lado, ou digite o endereço:",
    textX,
    textY
  );

  textY += 18;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  setText(pdf, COLOR.ink);
  pdf.text(url, textX, textY);

  textY += 18;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setText(pdf, COLOR.muted);
  pdf.text(
    scope === "week"
      ? "Vale até 7 dias depois do fim da semana. Reimprimir a folha gera um endereço novo e cancela este."
      : "O link vale 7 dias e é só desta rota. Reimprimir a folha gera um endereço novo e cancela este.",
    textX,
    textY
  );

  if (qrDataUrl) {
    const qrX = right - QR_SIZE - 16;
    // Fundo branco sob o código: o âmbar da faixa por baixo dos módulos derruba
    // o contraste que o leitor precisa.
    setFill(pdf, COLOR.white);
    pdf.rect(qrX - 6, y + 8, QR_SIZE + 12, QR_SIZE + 12, "F");
    pdf.addImage(qrDataUrl, "PNG", qrX, y + 14, QR_SIZE, QR_SIZE);
  }

  return y + BLOCK_H + 10;
};
