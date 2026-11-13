/**
 * Teto do PDF que o navegador gera e manda ao backend para ir ANEXO num email
 * (pedido à fábrica, fechamento de comissões). Igual ao `MAX_PDF_BYTES` do
 * backend: o corpo passa pelo BFF na Vercel, que recusa acima de 4,5 MB, e o
 * base64 engorda um terço. Conferir aqui faz a recusa sair em português, antes
 * do upload.
 */
export const MAX_PDF_ATTACHMENT_BYTES = 3 * 1024 * 1024;
