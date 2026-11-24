const UNITS = ["bytes", "KB", "MB", "GB", "TB"];

/**
 * Tamanho de arquivo no formato brasileiro: "820 bytes", "1,5 MB". Casas são
 * teto, não piso — "2 MB", não "2,00 MB".
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 bytes";
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1
  );
  const value = (bytes / 1024 ** i).toLocaleString("pt-BR", {
    maximumFractionDigits: i === 0 ? 0 : Math.max(0, decimals),
  });
  return `${value} ${UNITS[i]}`;
};
