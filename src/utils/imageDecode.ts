/** Teto para a decodificação de uma imagem. */
const DECODE_TIMEOUT_MS = 8000;

/**
 * Decodifica uma imagem a partir de uma URL (data URL, blob ou http).
 *
 * O timeout não é zelo excessivo: `HTMLImageElement` pode não disparar nem
 * `onload` nem `onerror` (fonte que nunca responde, ambiente sem rasterizador),
 * e quem espera essa promessa — geração de PDF, preview de logo — ficaria
 * pendurado sem nunca falhar, com o botão travado em "carregando".
 */
export const decodeImage = (
  src: string,
  timeoutMs = DECODE_TIMEOUT_MS
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const element = new Image();
    const timer = setTimeout(() => {
      element.onload = null;
      element.onerror = null;
      reject(new Error("tempo esgotado ao ler a imagem"));
    }, timeoutMs);

    const finish = (action: () => void) => {
      clearTimeout(timer);
      action();
    };

    element.onload = () => finish(() => resolve(element));
    element.onerror = () => finish(() => reject(new Error("imagem inválida")));
    element.src = src;
  });
